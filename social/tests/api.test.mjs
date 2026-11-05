import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import worker from "../worker/index.js";
import { digest } from "../worker/security.js";
let env, db;
function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(
    readFileSync(
      new URL("../migrations/0001_initial.sql", import.meta.url),
      "utf8",
    ),
  );
  sqlite.exec(
    readFileSync(
      new URL("../migrations/0002_media_chunks.sql", import.meta.url),
      "utf8",
    ),
  );
  sqlite.exec(
    readFileSync(
      new URL(
        "../migrations/0003_interests_and_organizations.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  sqlite.exec(
    readFileSync(
      new URL("../migrations/0004_email_settings.sql", import.meta.url),
      "utf8",
    ),
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
      return sqlite.prepare(this.sql).get(...this.args) || null;
    }
    async all() {
      return { results: sqlite.prepare(this.sql).all(...this.args) };
    }
    async run() {
      const r = sqlite.prepare(this.sql).run(...this.args);
      return { success: true, meta: { changes: Number(r.changes) } };
    }
  }
  return {
    sqlite,
    prepare: (sql) => new Statement(sql),
    async batch(stmts) {
      sqlite.exec("BEGIN");
      try {
        const result = [];
        for (const s of stmts) result.push(await s.run());
        sqlite.exec("COMMIT");
        return result;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    },
  };
}
beforeEach(() => {
  db = database();
  env = {
    DB: db,
    APP_ORIGIN: "https://test.local",
    ASSETS: { fetch: async () => new Response("html") },
  };
});
async function req(
  path,
  {
    method = "GET",
    body,
    token,
    origin = "https://test.local",
    headers = {},
  } = {},
) {
  const h = { Origin: origin, ...headers };
  if (token) h.Cookie = token;
  if (body && !headers["Content-Type"]) h["Content-Type"] = "application/json";
  const request = new Request("https://test.local/social/api" + path, {
    method,
    headers: h,
    body:
      body instanceof Uint8Array
        ? body
        : body
          ? JSON.stringify(body)
          : undefined,
  });
  const response = await worker.fetch(request, env);
  let data;
  if (response.headers.get("Content-Type")?.includes("json"))
    data = await response.clone().json();
  return {
    response,
    data,
    status: response.status,
    token: response.headers.get("Set-Cookie")?.split(";")[0],
  };
}
async function member(name = "alice") {
  const r = await req("/auth/register", {
    method: "POST",
    body: {
      email: name + "@example.test",
      username: name,
      display_name: name,
      password: "very-strong-test-password",
      terms: true,
      role: "admin",
    },
  });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  return { ...r.data.user, token: r.token };
}
async function upload(u) {
  const bytes = Uint8Array.from(
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9ioAAAAASUVORK5CYII=",
      "base64",
    ),
  );
  const r = await req("/uploads", {
    method: "POST",
    token: u.token,
    body: bytes,
    headers: { "Content-Type": "image/png" },
  });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  return { id: r.data.id, bytes };
}
async function post(u) {
  const m = await upload(u);
  const r = await req("/posts", {
    method: "POST",
    token: u.token,
    body: {
      media_id: m.id,
      kind: "photo",
      caption: "A real moment",
      human_declared: true,
    },
  });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  return { ...m, pid: r.data.id };
}
test("accounts get member role, hashed passwords and opaque hashed sessions", async () => {
  const u = await member();
  assert.equal(u.role, "member");
  const row = await db
    .prepare("SELECT * FROM users WHERE id=?")
    .bind(u.id)
    .first();
  assert.match(row.password_hash, /^pbkdf2-sha256/);
  assert.notEqual(row.password_hash, "very-strong-test-password");
  const sessions = await db.prepare("SELECT * FROM sessions").all();
  assert.equal(
    sessions.results[0].token_hash,
    await digest(u.token.split("=")[1]),
  );
  const me = await req("/me", { token: u.token });
  assert.equal(me.data.user.username, "alice");
  assert.equal(me.data.user.password_hash, undefined);
  assert.equal((await req("/admin/overview", { token: u.token })).status, 403);
});
test("anonymous endpoints and cross-origin mutations are denied", async () => {
  assert.equal((await req("/posts")).status, 401);
  assert.equal((await req("/messages")).status, 401);
  const u = await member();
  assert.equal(
    (
      await req("/profile", {
        method: "PATCH",
        token: u.token,
        origin: "https://evil.test",
        body: { display_name: "stolen" },
      })
    ).status,
    403,
  );
  assert.equal(
    (await req("/me", { token: "social_session=" + "0".repeat(64) })).data.user,
    null,
  );
});
test("pending uploads and raw media are private; only admin approves", async () => {
  const a = await member(),
    b = await member("bob"),
    p = await post(a);
  assert.equal(
    (await req("/posts?view=discover", { token: b.token })).data.posts.length,
    0,
  );
  assert.equal((await req("/media/" + p.id, { token: b.token })).status, 404);
  assert.equal(
    (
      await req("/admin/moderate", {
        method: "POST",
        token: b.token,
        body: { target: p.pid, status: "approved" },
      })
    ).status,
    403,
  );
  await db.prepare("UPDATE users SET role='admin' WHERE id=?").bind(a.id).run();
  assert.equal(
    (
      await req("/admin/moderate", {
        method: "POST",
        token: a.token,
        body: { target: p.pid, status: "approved" },
      })
    ).status,
    200,
  );
  assert.equal(
    (await req("/posts?view=discover", { token: b.token })).data.posts.length,
    1,
  );
  assert.equal((await req("/media/" + p.id, { token: b.token })).status, 200);
});
test("private account follow approval gates posts and media; blocks revoke access", async () => {
  const a = await member(),
    b = await member("bob"),
    p = await post(a);
  await db
    .prepare("UPDATE posts SET status='approved' WHERE id=?")
    .bind(p.pid)
    .run();
  await req("/profile", {
    method: "PATCH",
    token: a.token,
    body: { display_name: "Alice", bio: "private", private: true },
  });
  assert.equal((await req("/media/" + p.id, { token: b.token })).status, 404);
  const follow = await req("/people/" + a.id + "/follow", {
    method: "POST",
    token: b.token,
  });
  assert.equal(follow.data.requested, true);
  assert.equal((await req("/media/" + p.id, { token: b.token })).status, 404);
  await req("/people/" + b.id + "/accept", { method: "POST", token: a.token });
  assert.equal((await req("/media/" + p.id, { token: b.token })).status, 200);
  await req("/people/" + b.id + "/block", { method: "POST", token: a.token });
  assert.equal((await req("/media/" + p.id, { token: b.token })).status, 404);
  assert.equal(
    (
      await req("/messages", {
        method: "POST",
        token: b.token,
        body: { recipient: a.id, body: "no" },
      })
    ).status,
    403,
  );
});
test("messages are visible only to the two participants, not a third user", async () => {
  const a = await member(),
    b = await member("bob"),
    c = await member("carol");
  assert.equal(
    (
      await req("/messages", {
        method: "POST",
        token: a.token,
        body: { recipient: b.id, body: "private hello" },
      })
    ).status,
    201,
  );
  assert.equal(
    (await req("/messages?peer=" + a.id, { token: b.token })).data.messages[0]
      .body,
    "private hello",
  );
  assert.equal(
    (await req("/messages?peer=" + a.id, { token: c.token })).data.messages
      .length,
    0,
  );
  assert.equal(
    (await req("/messages?peer=" + b.id, { token: c.token })).data.messages
      .length,
    0,
  );
  assert.equal((await req("/admin/overview", { token: c.token })).status, 403);
});
test("media byte ranges preserve bytes and reject invalid ranges", async () => {
  const a = await member(),
    m = await upload(a);
  const full = await req("/media/" + m.id, { token: a.token });
  assert.deepEqual(new Uint8Array(await full.response.arrayBuffer()), m.bytes);
  const range = await req("/media/" + m.id, {
    token: a.token,
    headers: { Range: "bytes=4-15" },
  });
  assert.equal(range.status, 206);
  assert.deepEqual(
    new Uint8Array(await range.response.arrayBuffer()),
    m.bytes.slice(4, 16),
  );
  assert.equal(
    (
      await req("/media/" + m.id, {
        token: a.token,
        headers: { Range: "bytes=99999-" },
      })
    ).status,
    416,
  );
});
test("focus survives a new session and server blocks account actions", async () => {
  const a = await member();
  const focus = await req("/focus", {
    method: "POST",
    token: a.token,
    body: { seconds: 3600 },
  });
  assert.ok(focus.data.lock_until > Date.now());
  assert.equal((await req("/posts", { token: a.token })).status, 423);
  const login = await req("/auth/login", {
    method: "POST",
    body: { email: a.email, password: "very-strong-test-password" },
  });
  assert.equal(login.status, 200);
  assert.equal((await req("/messages", { token: login.token })).status, 423);
  assert.ok(
    (await req("/me", { token: login.token })).data.user.lock_until >
      Date.now(),
  );
  assert.equal(
    (
      await req("/focus", {
        method: "POST",
        token: a.token,
        body: { seconds: 5 },
      })
    ).status,
    423,
  );
});
test("post deletion revokes reads and account deletion removes media and conversations", async () => {
  const a = await member(),
    b = await member("bob"),
    p = await post(a);
  await req("/messages", {
    method: "POST",
    token: a.token,
    body: { recipient: b.id, body: "will be deleted" },
  });
  await req("/posts/" + p.pid, { method: "DELETE", token: a.token });
  assert.equal(
    (await req("/posts?view=mine", { token: a.token })).data.posts.length,
    0,
  );
  assert.equal(
    (
      await req("/account", {
        method: "DELETE",
        token: a.token,
        body: { password: "incorrect" },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await req("/account", {
        method: "DELETE",
        token: a.token,
        body: { password: "very-strong-test-password" },
      })
    ).status,
    200,
  );
  assert.equal(
    (await db.prepare("SELECT COUNT(*) AS n FROM media_chunks").first()).n,
    0,
  );
  assert.equal(
    (await req("/messages?peer=" + a.id, { token: b.token })).data.messages
      .length,
    0,
  );
});
test("input validation rejects malformed uploads, SQL-like usernames and unsafe marketplace URLs", async () => {
  const a = await member();
  assert.equal(
    (
      await req("/uploads", {
        method: "POST",
        token: a.token,
        headers: { "Content-Type": "image/png" },
        body: new Uint8Array(40),
      })
    ).status,
    415,
  );
  assert.equal(
    (
      await req("/auth/register", {
        method: "POST",
        body: {
          email: "x@example.test",
          username: "a'; DROP TABLE users;--",
          display_name: "x",
          password: "very-strong-test-password",
          terms: true,
        },
      })
    ).status,
    400,
  );
  await db.prepare("UPDATE users SET role='admin' WHERE id=?").bind(a.id).run();
  assert.equal(
    (
      await req("/admin/product", {
        method: "POST",
        token: a.token,
        body: {
          target: "new",
          name: "X",
          brand: "Y",
          price_cents: 100,
          url: "javascript:alert(1)",
        },
      })
    ).status,
    400,
  );
});
test("email features fail honestly when mail service is not configured", async () => {
  const a = await member();
  assert.equal(
    (await req("/auth/verification", { method: "POST", token: a.token }))
      .status,
    503,
  );
  assert.equal(
    (await req("/auth/forgot", { method: "POST", body: { email: a.email } }))
      .status,
    503,
  );
});
test("chunked media supports ranges crossing chunk boundaries", async () => {
  const a = await member();
  const bytes = new Uint8Array(420000);
  for (let i = 0; i < bytes.length; i++) bytes[i] = i % 251;
  bytes.set([137, 80, 78, 71], 0);
  const r = await req("/uploads", {
    method: "POST",
    token: a.token,
    headers: { "Content-Type": "image/png" },
    body: bytes,
  });
  assert.equal(r.status, 201);
  const range = await req("/media/" + r.data.id, {
    token: a.token,
    headers: { Range: "bytes=190000-410000" },
  });
  assert.equal(range.status, 206);
  assert.deepEqual(
    new Uint8Array(await range.response.arrayBuffer()),
    bytes.slice(190000, 410001),
  );
});
test("database triggers enforce storage quotas atomically", async () => {
  const a = await member();
  await assert.rejects(
    () =>
      db
        .prepare("INSERT INTO media VALUES(?,?,?,?,?)")
        .bind("oversized", a.id, "image/png", 20971521, Date.now())
        .run(),
    /MEMBER_STORAGE_LIMIT/,
  );
  await db
    .prepare("INSERT INTO media VALUES(?,?,?,?,?)")
    .bind("reserved", a.id, "image/png", 20971520, Date.now())
    .run();
  await assert.rejects(
    () =>
      db
        .prepare("INSERT INTO media VALUES(?,?,?,?,?)")
        .bind("overflow", a.id, "image/png", 1, Date.now())
        .run(),
    /MEMBER_STORAGE_LIMIT/,
  );
});
test("username availability is public but lowercase rules are enforced on registration", async () => {
  const a = await member();
  assert.equal(
    (await req("/auth/username?username=alice")).data.available,
    false,
  );
  assert.equal(
    (await req("/auth/username?username=new_handle_23")).data.available,
    true,
  );
  assert.equal((await req("/auth/username?username=Anshuman")).status, 400);
  assert.equal(
    (
      await req("/auth/register", {
        method: "POST",
        body: {
          email: "other@example.test",
          username: "Anshuman",
          display_name: "Anshuman",
          password: "very-strong-test-password",
          terms: true,
        },
      })
    ).status,
    400,
  );
});
