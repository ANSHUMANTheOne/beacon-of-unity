import { createRemoteJWKSet, jwtVerify } from "jose";
import {
  assert,
  digest,
  random,
  hashPassword,
  ownerUser,
  cookie,
  HttpError,
} from "./security.js";
import { seal, unseal } from "./email.js";

const keys = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);
const context = "social-google-v1";
const ttl = 10 * 60 * 1000;
const one = (env, sql, ...args) =>
  env.DB.prepare(sql)
    .bind(...args)
    .first();
const run = (env, sql, ...args) =>
  env.DB.prepare(sql)
    .bind(...args)
    .run();
const json = (data, headers = {}) =>
  new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
const binding = (request) =>
  request.headers
    .get("Cookie")
    ?.match(/(?:^|;\s*)social_google=([a-f0-9]{64})(?:;|$)/)?.[1];
const bindingCookie = (request, value, age = 600) =>
  `social_google=${value}; Path=/social/api/auth/google; HttpOnly; SameSite=Lax; Max-Age=${age}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
const callbackUrl = (env) =>
  `${env.APP_ORIGIN}/social/api/auth/google/callback`;
const redirect = (path, cookies = []) => {
  const headers = new Headers({
    Location: path,
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
  });
  for (const value of cookies) headers.append("Set-Cookie", value);
  return new Response(null, { status: 303, headers });
};

async function config(env) {
  if (env.EMAIL_SETTINGS_KEY) {
    const saved = await one(
      env,
      "SELECT value FROM app_settings WHERE key='google'",
    );
    if (saved) return unseal(env, saved.value, context);
  }
  if (env.GOOGLE_CLIENT_ID)
    return {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    };
  return null;
}
export async function googleStatus(env) {
  const c = await config(env);
  return {
    configured: !!c,
    client_id: c?.clientId || null,
    origin: env.APP_ORIGIN,
    callback_url: callbackUrl(env),
    vault_ready: !!env.EMAIL_SETTINGS_KEY,
  };
}
export async function connectGoogle(env, d) {
  assert(
    typeof d.client_id === "string" &&
      /^[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(d.client_id),
    400,
    "Enter the Google web application's client ID.",
  );
  if (d.client_secret)
    assert(
      typeof d.client_secret === "string" &&
        d.client_secret.length >= 16 &&
        d.client_secret.length <= 4096,
      400,
      "Enter a valid client secret.",
    );
  const value = await seal(
    env,
    {
      clientId: d.client_id,
      ...(d.client_secret ? { clientSecret: d.client_secret } : {}),
    },
    context,
  );
  await run(
    env,
    "INSERT INTO app_settings(key,value,updated_at) VALUES('google',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at",
    value,
    Date.now(),
  );
  return {
    message:
      "Google client ID saved. Test sign-in to confirm the Google configuration.",
  };
}

export async function verifyGoogleToken(
  token,
  clientId,
  nonceHash,
  keySet = keys,
) {
  const { payload } = await jwtVerify(token, keySet, {
    algorithms: ["RS256"],
    audience: clientId,
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    requiredClaims: ["sub", "exp", "iat", "nonce", "email", "email_verified"],
    maxTokenAge: "10m",
    clockTolerance: 30,
  });
  assert(
    payload.email_verified === true &&
      typeof payload.email === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) &&
      payload.email.length <= 254,
    400,
    "Google must verify your email before you can continue.",
  );
  assert(
    typeof payload.sub === "string" &&
      payload.sub.length > 0 &&
      payload.sub.length <= 255,
    400,
    "Google did not provide a valid account identity.",
  );
  assert(
    typeof payload.nonce === "string" &&
      (await digest(payload.nonce)) === nonceHash,
    400,
    "Google sign-in expired. Please start again.",
  );
  if (payload.azp !== undefined)
    assert(
      payload.azp === clientId,
      400,
      "Google sign-in was issued to another client.",
    );
  return {
    subject: payload.sub,
    email: payload.email.toLowerCase(),
    name: typeof payload.name === "string" ? payload.name.slice(0, 60) : "",
  };
}

export async function startGoogle(
  request,
  env,
  user = null,
  link = false,
  identityFlow = false,
) {
  const c = await config(env);
  assert(
    c,
    503,
    "Google sign-in is awaiting the owner's Google OAuth setup. You can still use email and password.",
  );
  if (link)
    assert(
      user && user.status === "active" && user.lock_until <= Date.now(),
      403,
      "Sign in to an unlocked account before linking Google.",
    );
  const state = random(),
    browser = random(),
    verifier = identityFlow ? "gis" : random(),
    nonce = random();
  const sessionToken = request.headers
    .get("Cookie")
    ?.match(/(?:^|;\s*)social_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  await run(
    env,
    "INSERT INTO oauth_states(state_hash,browser_hash,verifier,nonce_hash,user_id,session_hash,expires_at) VALUES(?,?,?,?,?,?,?)",
    await digest(state),
    await digest(browser),
    verifier,
    await digest(nonce),
    link ? user.id : null,
    link ? await digest(sessionToken || "") : null,
    Date.now() + ttl,
  );
  if (identityFlow)
    return json(
      { client_id: c.clientId, nonce, state },
      { "Set-Cookie": bindingCookie(request, browser) },
    );
  assert(c.clientSecret, 503, "Use the Google sign-in button to continue.");
  const challenge = btoa(
    String.fromCharCode(
      ...new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(verifier),
        ),
      ),
    ),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: c.clientId,
    redirect_uri: callbackUrl(env),
    response_type: "code",
    scope: "openid email profile",
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return json(
    { url: url.href },
    { "Set-Cookie": bindingCookie(request, browser) },
  );
}

async function createSessionRedirect(request, env, user, path) {
  assert(user?.status === "active", 403, "This account is unavailable.");
  const token = random();
  await run(
    env,
    "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)",
    await digest(token),
    user.id,
    Date.now() + 30 * 86400000,
  );
  return redirect(path, [
    cookie(token, new URL(request.url).protocol === "https:"),
    bindingCookie(request, "", 0),
  ]);
}

export async function googleCallback(request, env) {
  let linking = false;
  try {
    const url = new URL(request.url),
      browser = binding(request),
      state = url.searchParams.get("state");
    assert(
      browser && /^[a-f0-9]{64}$/.test(state || ""),
      400,
      "Missing sign-in state.",
    );
    const record = await one(
      env,
      "DELETE FROM oauth_states WHERE state_hash=? AND browser_hash=? AND expires_at>? RETURNING *",
      await digest(state),
      await digest(browser),
      Date.now(),
    );
    assert(record, 400, "Sign-in expired or already used.");
    assert(record.verifier !== "gis", 400, "Incorrect sign-in flow.");
    linking = !!record.user_id;
    assert(
      !url.searchParams.has("error"),
      400,
      "Google sign-in was cancelled.",
    );
    const code = url.searchParams.get("code");
    assert(code && code.length <= 4096, 400, "Missing authorization code.");
    const c = await config(env);
    assert(c, 503, "Google sign-in is not configured.");
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: c.clientId,
        client_secret: c.clientSecret,
        redirect_uri: callbackUrl(env),
        grant_type: "authorization_code",
        code_verifier: record.verifier,
      }),
      signal: AbortSignal.timeout(15000),
    });
    assert(response.ok, 400, "Google sign-in failed.");
    const tokens = await response.json();
    const identity = await verifyGoogleToken(
      tokens.id_token,
      c.clientId,
      record.nonce_hash,
    );
    return await finishGoogleIdentity(request, env, record, browser, identity);
  } catch {
    return redirect(
      linking
        ? "/social/settings#google=failed"
        : "/social/login#google=failed",
      [bindingCookie(request, "", 0)],
    );
  }
}

export async function googleCredential(request, env, d) {
  const browser = binding(request);
  assert(
    browser && /^[a-f0-9]{64}$/.test(d.state || ""),
    400,
    "Google sign-in expired. Reload and try again.",
  );
  assert(
    typeof d.credential === "string" && d.credential.length <= 12000,
    400,
    "Missing Google identity token.",
  );
  const record = await one(
    env,
    "DELETE FROM oauth_states WHERE state_hash=? AND browser_hash=? AND expires_at>? AND verifier='gis' RETURNING *",
    await digest(d.state),
    await digest(browser),
    Date.now(),
  );
  assert(
    record,
    400,
    "Google sign-in expired or was already completed. Reload and try again.",
  );
  const c = await config(env);
  assert(c, 503, "Google sign-in is not configured.");
  let identity;
  try {
    identity = await verifyGoogleToken(
      d.credential,
      c.clientId,
      record.nonce_hash,
    );
  } catch {
    throw new HttpError(
      401,
      "Google sign-in could not be verified. Reload and try again.",
    );
  }
  const response = await finishGoogleIdentity(
    request,
    env,
    record,
    browser,
    identity,
  );
  const headers = new Headers(response.headers);
  headers.set("Content-Type", "application/json");
  headers.delete("Location");
  return new Response(
    JSON.stringify({ redirect: response.headers.get("Location") }),
    { headers },
  );
}

export async function pendingGoogle(request, env) {
  const browser = binding(request);
  assert(browser, 401, "Google sign-in expired. Please start again.");
  const row = await one(
    env,
    "SELECT * FROM oauth_enrollments WHERE browser_hash=? AND expires_at>?",
    await digest(browser),
    Date.now(),
  );
  assert(row, 401, "Google sign-in expired. Please start again.");
  return { row, browser };
}
export async function completeGoogle(request, env, d) {
  const { row, browser } = await pendingGoogle(request, env);
  assert(
    d.terms === true,
    400,
    "Confirm you are at least 13 and accept the community rules.",
  );
  assert(
    typeof d.username === "string" &&
      /^[a-z][a-z0-9._]{2,23}$/.test(d.username),
    400,
    "Use 3–24 lowercase characters, starting with a letter.",
  );
  assert(
    typeof d.display_name === "string" &&
      d.display_name.trim().length > 0 &&
      d.display_name.trim().length <= 60,
    400,
    "Enter your name, up to 60 characters.",
  );
  assert(
    !(await one(
      env,
      "SELECT 1 FROM users WHERE username=? OR email=?",
      d.username,
      row.email,
    )),
    409,
    "Those account details are unavailable. Sign in to an existing account or choose another username.",
  );
  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(random());
  const consumed = await one(
    env,
    "DELETE FROM oauth_enrollments WHERE browser_hash=? AND expires_at>? RETURNING *",
    await digest(browser),
    Date.now(),
  );
  assert(consumed, 400, "Google sign-in expired or already completed.");
  try {
    await env.DB.batch([
      env.DB.prepare(
        "INSERT INTO users(id,email,username,display_name,password_hash,email_verified,created_at) VALUES(?,?,?,?,?,1,?)",
      ).bind(
        userId,
        consumed.email,
        d.username,
        d.display_name.trim(),
        passwordHash,
        Date.now(),
      ),
      env.DB.prepare(
        "INSERT INTO google_identities(subject,user_id,created_at) VALUES(?,?,?)",
      ).bind(consumed.subject, userId, Date.now()),
    ]);
  } catch (e) {
    if (/UNIQUE/i.test(e.message))
      throw new HttpError(409, "Account already exists. Start sign-in again.");
    throw e;
  }
  const user = await one(env, "SELECT * FROM users WHERE id=?", userId),
    token = random();
  await run(
    env,
    "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)",
    await digest(token),
    userId,
    Date.now() + 30 * 86400000,
  );
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  headers.append(
    "Set-Cookie",
    cookie(token, new URL(request.url).protocol === "https:"),
  );
  headers.append("Set-Cookie", bindingCookie(request, "", 0));
  return new Response(JSON.stringify({ user: ownerUser(user) }), { headers });
}

async function finishGoogleIdentity(request, env, record, browser, identity) {
  const linking = !!record.user_id;
  const existing = await one(
    env,
    "SELECT u.* FROM google_identities g JOIN users u ON u.id=g.user_id WHERE g.subject=?",
    identity.subject,
  );
  if (linking) {
    // Recheck the originating session; a logout, reset or suspension revokes a pending link.
    const owner = await one(
      env,
      "SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.user_id=? AND s.expires_at>? AND u.status='active'",
      record.session_hash,
      record.user_id,
      Date.now(),
    );
    assert(
      owner && owner.lock_until <= Date.now(),
      403,
      "The account session has ended.",
    );
    assert(
      !existing || existing.id === owner.id,
      409,
      "Google account already linked.",
    );
    assert(
      !(await one(
        env,
        "SELECT 1 FROM google_identities WHERE user_id=? AND subject<>?",
        owner.id,
        identity.subject,
      )),
      409,
      "Account already has a Google identity.",
    );
    if (!existing)
      await run(
        env,
        "INSERT INTO google_identities(subject,user_id,created_at) VALUES(?,?,?)",
        identity.subject,
        owner.id,
        Date.now(),
      );
    await run(
      env,
      "INSERT INTO audit(id,actor,action,target,created_at) VALUES(?,?,?,?,?)",
      crypto.randomUUID(),
      owner.id,
      "google.linked",
      owner.id,
      Date.now(),
    );
    return createSessionRedirect(
      request,
      env,
      owner,
      "/social/settings#google=linked",
    );
  }
  if (existing)
    return createSessionRedirect(request, env, existing, "/social/");
  const emailOwner = await one(
    env,
    "SELECT 1 FROM users WHERE email=?",
    identity.email,
  );
  if (emailOwner)
    return redirect("/social/login#google=link-required", [
      bindingCookie(request, "", 0),
    ]);
  await run(
    env,
    "INSERT INTO oauth_enrollments(browser_hash,subject,email,display_name,expires_at) VALUES(?,?,?,?,?) ON CONFLICT(browser_hash) DO UPDATE SET subject=excluded.subject,email=excluded.email,display_name=excluded.display_name,expires_at=excluded.expires_at",
    await digest(browser),
    identity.subject,
    identity.email,
    identity.name,
    Date.now() + ttl,
  );
  return redirect("/social/google", [bindingCookie(request, browser)]);
}
