import { assert, digest } from "./security.js";
const encoder = new TextEncoder();
const fromHex = (s) =>
  Uint8Array.from(s.match(/.{2}/g) || [], (x) => parseInt(x, 16));
const b64 = (bytes) =>
  btoa(
    Array.from(new Uint8Array(bytes), (x) => String.fromCharCode(x)).join(""),
  );
const unb64 = (s) => Uint8Array.from(atob(s), (x) => x.charCodeAt(0));
async function key(env) {
  assert(
    /^[a-f0-9]{64}$/.test(env.EMAIL_SETTINGS_KEY || ""),
    503,
    "The email credential vault is not configured.",
  );
  return crypto.subtle.importKey(
    "raw",
    fromHex(env.EMAIL_SETTINGS_KEY),
    "AES-GCM",
    false,
    ["encrypt", "decrypt"],
  );
}
export async function seal(env, value, context = "social-email-v1") {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: encoder.encode(context) },
    await key(env),
    encoder.encode(JSON.stringify(value)),
  );
  return JSON.stringify({ v: 1, iv: b64(iv), data: b64(encrypted) });
}
export async function unseal(env, packed, context = "social-email-v1") {
  const d = JSON.parse(packed);
  assert(d.v === 1, 503, "Email settings require migration.");
  const plain = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: unb64(d.iv),
      additionalData: encoder.encode(context),
    },
    await key(env),
    unb64(d.data),
  );
  return JSON.parse(new TextDecoder().decode(plain));
}
async function configuration(env) {
  if (env.SENDPULSE_API_KEY)
    return {
      provider: "sendpulse",
      apiKey: env.SENDPULSE_API_KEY,
      senderEmail: env.EMAIL_SENDER_ADDRESS || "hello@beaconofunity.com",
      senderName: env.EMAIL_SENDER_NAME || "Social",
    };
  if (env.EMAIL_SETTINGS_KEY) {
    const row = await env.DB.prepare(
      "SELECT value FROM app_settings WHERE key='email'",
    ).first();
    if (row)
      return { provider: "sendpulse", ...(await unseal(env, row.value)) };
  }
  if (env.RESEND_API_KEY)
    return { provider: "resend", apiKey: env.RESEND_API_KEY };
  return null;
}
export async function emailConfigured(env) {
  return !!(await configuration(env));
}
export async function emailStatus(env) {
  const config = await configuration(env);
  const utc = new Date().toISOString();
  const hour = "hour:" + utc.slice(0, 13),
    month = "month:" + utc.slice(0, 7);
  const { results } = await env.DB.prepare(
    "SELECT bucket,count FROM email_usage WHERE bucket IN(?,?)",
  )
    .bind(hour, month)
    .all();
  return {
    configured: !!config,
    provider: config?.provider || "sendpulse",
    vault_ready: !!env.EMAIL_SETTINGS_KEY,
    sender: config?.senderEmail || null,
    sender_name: config?.senderName || null,
    hourly_limit: 50,
    monthly_limit: 12000,
    hourly_used: results.find((x) => x.bucket === hour)?.count || 0,
    monthly_used: results.find((x) => x.bucket === month)?.count || 0,
  };
}
export async function connectEmail(env, d) {
  assert(
    typeof d.api_key === "string" &&
      d.api_key.length >= 20 &&
      d.api_key.length <= 4096,
    400,
    "Enter a valid SendPulse API key.",
  );
  assert(
    typeof d.sender_email === "string" &&
      /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(d.sender_email),
    400,
    "Enter a verified sender email address.",
  );
  assert(
    typeof d.sender_name === "string" &&
      d.sender_name.length > 0 &&
      d.sender_name.length <= 80,
    400,
    "Enter a sender name up to 80 characters.",
  );
  await key(env);
  const result = await fetch("https://api.sendpulse.com/user/info", {
    headers: { Authorization: "Bearer " + d.api_key },
    signal: AbortSignal.timeout(15000),
  });
  assert(
    result.ok,
    400,
    "SendPulse rejected this key. Create a static API key in Settings → API keys.",
  );
  const packed = await seal(env, {
    apiKey: d.api_key,
    senderEmail: d.sender_email,
    senderName: d.sender_name,
  });
  await env.DB.prepare(
    "INSERT INTO app_settings(key,value,updated_at) VALUES('email',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at",
  )
    .bind(packed, Date.now())
    .run();
  return {
    connected: true,
    message:
      "Credentials stored privately. Activate SMTP and verify the sender in SendPulse before sending.",
  };
}
async function reserve(env) {
  const utc = new Date().toISOString();
  const limits = [
    ["hour:" + utc.slice(0, 13), 50, Date.now() + 3600000],
    ["month:" + utc.slice(0, 7), 12000, Date.now() + 32 * 86400000],
  ];
  const acquired = [];
  try {
    for (const [bucket, maximum, expiry] of limits) {
      const row = await env.DB.prepare(
        "INSERT INTO email_usage(bucket,count,expires_at) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1 WHERE count<? RETURNING count",
      )
        .bind(bucket, expiry, maximum)
        .first();
      assert(
        row,
        429,
        "Free email sending allowance reached. Please try again later.",
      );
      acquired.push(bucket);
    }
    return acquired;
  } catch (e) {
    for (const b of acquired)
      await env.DB.prepare(
        "UPDATE email_usage SET count=MAX(0,count-1) WHERE bucket=?",
      )
        .bind(b)
        .run();
    throw e;
  }
}
export async function deliverEmail(env, { to, subject, text, html, senderName, replyTo }) {
  const config = await configuration(env);
  assert(
    config,
    503,
    "Email service is not connected yet. Contact the site owner.",
  );
  const buckets = await reserve(env);
  try {
    let result;
    if (config.provider === "sendpulse") {
      result = await fetch("https://api.sendpulse.com/smtp/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + config.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: {
            subject,
            text,
            ...(html ? {html: b64(encoder.encode(html))} : {}),
            ...(replyTo ? {reply_to: {name: senderName || config.senderName, email: replyTo}} : {}),
            from: { name: senderName || config.senderName, email: config.senderEmail },
            to: [{ email: to }],
          },
        }),
        signal: AbortSignal.timeout(15000),
      });
      const body = await result.json().catch(() => ({}));
      assert(
        result.ok && body.result === true,
        503,
        "SendPulse has not accepted the email. Check SMTP activation, sender verification and sending limits.",
      );
      return { accepted: true, provider: "sendpulse" };
    }
    result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: env.EMAIL_FROM, to: [to], subject, text, ...(html ? {html} : {}), ...(replyTo ? {reply_to:replyTo} : {}) }),
      signal: AbortSignal.timeout(15000),
    });
    assert(result.ok, 503, "The email provider could not accept this email.");
    return { accepted: true, provider: "resend" };
  } catch (e) {
    for (const b of buckets)
      await env.DB.prepare(
        "UPDATE email_usage SET count=MAX(0,count-1) WHERE bucket=?",
      )
        .bind(b)
        .run();
    throw e;
  }
}
