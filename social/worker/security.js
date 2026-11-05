const encoder = new TextEncoder();
export const hex = (b) =>
  Array.from(new Uint8Array(b), (n) => n.toString(16).padStart(2, "0")).join(
    "",
  );
export const random = () => hex(crypto.getRandomValues(new Uint8Array(32)));
export const digest = async (s) =>
  hex(await crypto.subtle.digest("SHA-256", encoder.encode(s)));
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export function assert(condition, status, message) {
  if (!condition) throw new HttpError(status, message);
}
export async function hashPassword(password, salt = random()) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations: 100000,
      salt: encoder.encode(salt),
    },
    key,
    256,
  );
  return `pbkdf2-sha256$100000$${salt}$${hex(bits)}`;
}
export async function verifyPassword(password, stored) {
  const [algorithm, iterations, salt] = stored.split("$");
  if (algorithm !== "pbkdf2-sha256" || iterations !== "100000") return false;
  const actual = await hashPassword(password, salt);
  let delta = actual.length ^ stored.length;
  for (let i = 0; i < actual.length; i++)
    delta |= actual.charCodeAt(i) ^ (stored.charCodeAt(i) || 0);
  return delta === 0;
}
export function validatePassword(value) {
  assert(
    typeof value === "string" && value.length >= 12 && value.length <= 128,
    400,
    "Use a password between 12 and 128 characters.",
  );
}
export async function body(request, max = 16000) {
  const reader = request.body?.getReader();
  assert(reader, 400, "Request body required.");
  let chunks = [],
    size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      throw new HttpError(413, "Request too large.");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(size);
  let i = 0;
  for (const c of chunks) {
    out.set(c, i);
    i += c.length;
  }
  return out;
}
export async function jsonBody(request) {
  assert(
    request.headers.get("Content-Type")?.startsWith("application/json"),
    415,
    "Use application/json.",
  );
  try {
    return JSON.parse(new TextDecoder().decode(await body(request)));
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(400, "Invalid JSON.");
  }
}
export function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    display_name: u.display_name,
    bio: u.bio,
    private: !!u.private,
    account_type: u.account_type || "person",
    website: u.website || "",
  };
}
export function ownerUser(u) {
  return {
    ...publicUser(u),
    email: u.email,
    role: u.role,
    email_verified: !!u.email_verified,
    lock_until: u.lock_until,
    interests: JSON.parse(u.interests || "[]"),
  };
}
export function cookie(token, secure = true, age = 2592000) {
  return `social_session=${token}; Path=/social; HttpOnly; SameSite=Strict; Max-Age=${age}${secure ? "; Secure" : ""}`;
}
export function securityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://images.unsplash.com https://i.pravatar.cc; media-src 'self' blob: https://interactive-examples.mdn.mozilla.net; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  };
}
