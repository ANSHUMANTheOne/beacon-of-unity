import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { generateKeyPair, exportJWK, SignJWT, createLocalJWKSet } from "jose";
import worker from "../worker/index.js";
import {
  verifyGoogleToken,
  connectGoogle,
  googleStatus,
} from "../worker/google.js";
import { digest } from "../worker/security.js";
import { unseal } from "../worker/email.js";

const pair = await generateKeyPair("RS256", { extractable: true });
const jwk = {
  ...(await exportJWK(pair.publicKey)),
  kid: "test-google",
  alg: "RS256",
  use: "sig",
};
const keySet = createLocalJWKSet({ keys: [jwk] });
const clientId = "unit-test.apps.googleusercontent.com";
const signing = async (claims = {}, options = {}) =>
  new SignJWT({
    sub: "google-subject",
    email: "google@example.test",
    email_verified: true,
    nonce: "test-nonce",
    ...claims,
  })
    .setProtectedHeader({ alg: "RS256", kid: "test-google" })
    .setIssuer(options.issuer || "https://accounts.google.com")
    .setAudience(options.audience || clientId)
    .setIssuedAt()
    .setExpirationTime(options.expires || "5m")
    .sign(pair.privateKey);

function setup() {
  const db = new DatabaseSync(":memory:");
  for (const file of readdirSync(new URL("../migrations/", import.meta.url))
    .filter((x) => x.endsWith(".sql"))
    .sort())
    db.exec(
      readFileSync(new URL("../migrations/" + file, import.meta.url), "utf8"),
    );
  class Statement {
    constructor(sql, args = []) {
      this.sql = sql;
      this.args = args;
    }
    bind(...args) {
      return new Statement(this.sql, args);
    }
    async first() {
      return db.prepare(this.sql).get(...this.args) || null;
    }
    async all() {
      return { results: db.prepare(this.sql).all(...this.args) };
    }
    async run() {
      return {
        meta: {
          changes: Number(db.prepare(this.sql).run(...this.args).changes),
        },
      };
    }
  }
  const env = {
    APP_ORIGIN: "https://test.local",
    GOOGLE_CLIENT_ID: clientId,
    GOOGLE_CLIENT_SECRET: "fake-unit-test-client-secret",
    DB: {
      prepare: (sql) => new Statement(sql),
      async batch(items) {
        db.exec("BEGIN");
        try {
          const out = [];
          for (const item of items) out.push(await item.run());
          db.exec("COMMIT");
          return out;
        } catch (e) {
          db.exec("ROLLBACK");
          throw e;
        }
      },
    },
  };
  const req = (
    path,
    { method = "GET", body, cookie = "", origin = env.APP_ORIGIN } = {},
  ) =>
    worker.fetch(
      new Request(env.APP_ORIGIN + "/social/api" + path, {
        method,
        headers: {
          Origin: origin,
          Cookie: cookie,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      }),
      env,
    );
  return { db, env, req };
}
async function begin(req, mode = "signin", cookie = "") {
  const response = await req("/auth/google/start", {
    method: "POST",
    body: { mode },
    cookie,
  });
  assert.equal(response.status, 200);
  return {
    url: new URL((await response.json()).url),
    cookie: response.headers.get("Set-Cookie").split(";")[0],
  };
}

test("Google token requires valid signature, audience, issuer, nonce, expiry and verified email", async () => {
  const nonce = await digest("test-nonce");
  assert.equal(
    (await verifyGoogleToken(await signing(), clientId, nonce, keySet)).subject,
    "google-subject",
  );
  for (const [claims, opts] of [
    [{ email_verified: false }],
    [{ nonce: "wrong" }],
    [{}, { audience: "another-client" }],
    [{}, { issuer: "https://attacker.test" }],
    [{}, { expires: "-60s" }],
  ]) {
    await assert.rejects(() =>
      signing(claims, opts).then((t) =>
        verifyGoogleToken(t, clientId, nonce, keySet),
      ),
    );
  }
  const token = await signing();
  const [header, payload, signature] = token.split(".");
  const mutated = (signature[0] === "A" ? "B" : "A") + signature.slice(1);
  await assert.rejects(() =>
    verifyGoogleToken(
      `${header}.${payload}.${mutated}`,
      clientId,
      nonce,
      keySet,
    ),
  );
});

test("Google setup is encrypted with a distinct context and secrets never appear in status", async () => {
  const { env, db } = setup();
  delete env.GOOGLE_CLIENT_ID;
  delete env.GOOGLE_CLIENT_SECRET;
  env.EMAIL_SETTINGS_KEY = "a".repeat(64);
  assert.equal((await googleStatus(env)).configured, false);
  await connectGoogle(env, {
    client_id: clientId,
    client_secret: "fake-private-google-secret",
  });
  const packed = db
    .prepare("SELECT value FROM app_settings WHERE key='google'")
    .get().value;
  assert.ok(!packed.includes("fake-private"));
  await assert.rejects(() => unseal(env, packed));
  assert.equal(
    (await unseal(env, packed, "social-google-v1")).clientId,
    clientId,
  );
  assert.equal((await googleStatus(env)).configured, true);
  assert.ok(!JSON.stringify(await googleStatus(env)).includes("secret"));
});

test("Google start enforces origin, PKCE and browser binding; callbacks reject mismatches and replay", async () => {
  const { req, env, db } = setup();
  assert.equal(
    (
      await req("/auth/google/start", {
        method: "POST",
        body: { mode: "signin" },
        origin: "https://attacker.test",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await req("/auth/google/start", {
        method: "POST",
        body: { mode: "link" },
      })
    ).status,
    403,
  );
  const start = await begin(req);
  assert.equal(start.url.origin, "https://accounts.google.com");
  assert.equal(start.url.searchParams.get("scope"), "openid email profile");
  assert.equal(start.url.searchParams.get("code_challenge_method"), "S256");
  assert.equal(start.url.searchParams.get("code_challenge").length, 43);
  assert.equal(start.url.searchParams.has("client_secret"), false);
  const callback =
    "/auth/google/callback?state=" +
    start.url.searchParams.get("state") +
    "&error=access_denied";
  assert.equal(
    (await req(callback)).headers.get("Location"),
    "/social/login#google=failed",
  );
  assert.equal(db.prepare("SELECT COUNT(*) n FROM oauth_states").get().n, 1);
  await req(callback, { cookie: start.cookie });
  assert.equal(db.prepare("SELECT COUNT(*) n FROM oauth_states").get().n, 0);
  assert.equal(
    (await req(callback, { cookie: start.cookie })).headers.get("Location"),
    "/social/login#google=failed",
  );
  delete env.GOOGLE_CLIENT_ID;
  delete env.GOOGLE_CLIENT_SECRET;
  assert.equal((await req("/auth/providers")).status, 200);
  assert.equal(
    (
      await req("/auth/google/start", {
        method: "POST",
        body: { mode: "signin" },
      })
    ).status,
    503,
  );
});

test("real signed callback requires new-user onboarding, preserves existing accounts and links explicitly", async () => {
  const { req, db } = setup(),
    original = globalThis.fetch;
  let nonce,
    email = "new-google@example.test",
    subject = "new-subject",
    tokenCalls = 0;
  globalThis.fetch = async (url, options) => {
    if (String(url) === "https://www.googleapis.com/oauth2/v3/certs")
      return Response.json({ keys: [jwk] });
    assert.equal(String(url), "https://oauth2.googleapis.com/token");
    assert.equal(options.body.get("grant_type"), "authorization_code");
    assert.equal(options.body.get("code_verifier").length, 64);
    tokenCalls++;
    return Response.json({
      id_token: await signing({ nonce, email, sub: subject }),
    });
  };
  const callback = async (mode = "signin", cookie = "") => {
    const start = await begin(req, mode, cookie);
    nonce = start.url.searchParams.get("nonce");
    const path =
      "/auth/google/callback?state=" +
      start.url.searchParams.get("state") +
      "&code=fake-authorization-code";
    return { start, path, response: await req(path, { cookie: start.cookie }) };
  };
  try {
    const first = await callback();
    assert.equal(first.response.headers.get("Referrer-Policy"), "no-referrer");
    assert.equal(first.response.headers.get("Location"), "/social/google");
    assert.equal(db.prepare("SELECT COUNT(*) n FROM users").get().n, 0);
    assert.equal((await req("/auth/google/pending")).status, 401);
    const invalid = await req("/auth/google/complete", {
      method: "POST",
      cookie: first.start.cookie,
      body: { username: "Uppercase", display_name: "Test", terms: true },
    });
    assert.equal(invalid.status, 400);
    assert.equal(
      (
        await req("/auth/google/complete", {
          method: "POST",
          cookie: first.start.cookie,
          body: { username: "newuser", display_name: "Test", terms: false },
        })
      ).status,
      400,
    );
    const finish = await req("/auth/google/complete", {
      method: "POST",
      cookie: first.start.cookie,
      body: {
        username: "newuser",
        display_name: "Test",
        terms: true,
        role: "admin",
      },
    });
    assert.equal(finish.status, 200);
    const user = (await finish.json()).user;
    assert.equal(user.role, "member");
    assert.equal(user.email_verified, true);
    assert.equal(
      (
        await req("/auth/google/complete", {
          method: "POST",
          cookie: first.start.cookie,
          body: { username: "newuser", display_name: "Test", terms: true },
        })
      ).status,
      401,
    );
    await req(first.path, { cookie: first.start.cookie });
    assert.equal(tokenCalls, 1);
    const returning = await callback();
    assert.equal(returning.response.headers.get("Location"), "/social/");
    const session = returning.response.headers
      .get("Set-Cookie")
      .match(/social_session=[a-f0-9]{64}/)[0];
    assert.equal((await req("/me", { cookie: session })).status, 200);
    subject = "different-google-same-email";
    assert.equal(
      (await callback()).response.headers.get("Location"),
      "/social/login#google=link-required",
    );
    assert.equal(
      db.prepare("SELECT COUNT(*) n FROM google_identities").get().n,
      1,
    );
    // Linking requires an authenticated session, and keeps the original account.
    db.exec("DELETE FROM google_identities");
    email = "another-google-email@example.test";
    const linked = await callback("link", session);
    assert.equal(
      linked.response.headers.get("Location"),
      "/social/settings#google=linked",
    );
    assert.equal(
      db.prepare("SELECT user_id FROM google_identities").get().user_id,
      user.id,
    );
    assert.equal(
      db.prepare("SELECT email FROM users").get().email,
      "new-google@example.test",
    );
    db.exec("DELETE FROM google_identities");
    // A pending link must be revoked when its originating app session ends.
    const linkStart = await begin(req, "link", session);
    nonce = linkStart.url.searchParams.get("nonce");
    db.exec("DELETE FROM sessions");
    const revoked = await req(
      "/auth/google/callback?code=fake&state=" +
        linkStart.url.searchParams.get("state"),
      { cookie: linkStart.cookie },
    );
    assert.equal(
      revoked.headers.get("Location"),
      "/social/settings#google=failed",
    );
    assert.equal(
      db.prepare("SELECT COUNT(*) n FROM google_identities").get().n,
      0,
    );
  } finally {
    globalThis.fetch = original;
  }
});
