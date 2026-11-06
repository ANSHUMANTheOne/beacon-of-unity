import {
  googleStatus,
  connectGoogle,
  startGoogle,
  googleCallback,
  pendingGoogle,
  completeGoogle,
} from "./google.js";
import {
  emailConfigured,
  emailStatus,
  connectEmail,
  deliverEmail,
} from "./email.js";
import { listPosts, updateProfile, cleanTopics } from "./community.js";
import { storeMedia, readMedia, MAX_UPLOAD } from "./media-store.js";
import {
  assert,
  HttpError,
  digest,
  random,
  hashPassword,
  verifyPassword,
  validatePassword,
  jsonBody,
  body,
  publicUser,
  ownerUser,
  cookie,
  securityHeaders,
} from "./security.js";
const id = () => crypto.randomUUID(),
  now = () => Date.now();
const one = (env, sql, ...args) =>
  env.DB.prepare(sql)
    .bind(...args)
    .first();
const run = (env, sql, ...args) =>
  env.DB.prepare(sql)
    .bind(...args)
    .run();
const all = async (env, sql, ...args) =>
  (
    await env.DB.prepare(sql)
      .bind(...args)
      .all()
  ).results;
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
const text = (v, max = 1000) => {
  assert(
    typeof v === "string" && v.trim().length > 0 && v.trim().length <= max,
    400,
    `Enter between 1 and ${max} characters.`,
  );
  return v.trim();
};
async function limit(env, key, max = 30, window = 60000) {
  const bucket = Math.floor(now() / window);
  const k = await digest(`${key}:${bucket}`);
  await run(
    env,
    "INSERT INTO rate_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1",
    k,
    now() + window,
  );
  const row = await one(env, "SELECT count FROM rate_limits WHERE key=?", k);
  assert(row.count <= max, 429, "Too many requests. Please try again later.");
}
async function session(request, env) {
  const token = request.headers
    .get("Cookie")
    ?.match(/(?:^|;\s*)social_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (!token) return null;
  return one(
    env,
    "SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.status='active'",
    await digest(token),
    now(),
  );
}
async function issue(env, user, secure) {
  const token = random();
  await run(
    env,
    "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)",
    await digest(token),
    user.id,
    now() + 30 * 86400000,
  );
  return json({ user: ownerUser(user) }, 200, {
    "Set-Cookie": cookie(token, secure),
  });
}
async function blocked(env, a, b) {
  return !!(await one(
    env,
    "SELECT 1 FROM blocks WHERE (blocker=? AND blocked=?) OR (blocker=? AND blocked=?)",
    a,
    b,
    b,
    a,
  ));
}
async function canRead(env, user, post) {
  if (!post) return false;
  if (post.status === "removed" && user.role !== "admin") return false;
  if (post.expires_at && post.expires_at < now()) return false;
  if (user.role === "admin" || post.user_id === user.id) return true;
  if (
    post.status !== "approved" ||
    post.owner_status !== "active" ||
    (await blocked(env, user.id, post.user_id))
  )
    return false;
  return (
    !post.private ||
    !!(await one(
      env,
      "SELECT 1 FROM follows WHERE follower=? AND following=? AND accepted=1",
      user.id,
      post.user_id,
    ))
  );
}
async function getPost(env, pid) {
  return one(
    env,
    "SELECT p.*,u.private,u.status AS owner_status FROM posts p JOIN users u ON u.id=p.user_id WHERE p.id=?",
    pid,
  );
}
async function requirePost(env, user, pid) {
  const p = await getPost(env, pid);
  assert(await canRead(env, user, p), 404, "Post not found.");
  return p;
}
async function sendEmail(env, u, purpose) {
  assert(
    await emailConfigured(env),
    503,
    "Email service is not configured yet. Contact the site owner.",
  );
  const token = random(),
    time = now();
  await run(
    env,
    "INSERT INTO email_tokens(token_hash,user_id,purpose,expires_at) VALUES(?,?,?,?)",
    await digest(token),
    u.id,
    purpose,
    time + 30 * 60000,
  );
  const url = `${env.APP_ORIGIN}/social/${purpose === "verify" ? "verify" : "reset"}#token=${token}`;
  try {
    await deliverEmail(env, {
      to: u.email,
      subject:
        purpose === "verify"
          ? "Confirm your Social email"
          : "Reset your Social password",
      text: `Open this link within 30 minutes: ${url}\nIf you did not request this, ignore this email.`,
    });
  } catch (e) {
    await run(
      env,
      "DELETE FROM email_tokens WHERE token_hash=?",
      await digest(token),
    );
    throw e;
  }
}
async function api(request, env) {
  assert(env.DB, 503, "Database setup is incomplete.");
  const url = new URL(request.url),
    path = url.pathname.slice("/social/api".length),
    method = request.method,
    secure = url.protocol === "https:";
  const write = !["GET", "HEAD"].includes(method);
  if (write) {
    const expected = env.APP_ORIGIN || url.origin;
    assert(
      request.headers.get("Origin") === expected ||
        (url.hostname === "127.0.0.1" &&
          request.headers.get("Origin") === url.origin),
      403,
      "Request origin rejected.",
    );
    await limit(
      env,
      `write:${request.headers.get("CF-Connecting-IP") || "local"}`,
      120,
    );
  }
  if (path === "/health" && method === "GET")
    return json({ ok: true, uploads: true, email: await emailConfigured(env) });
  if (path === "/auth/providers" && method === "GET")
    return json({ google: (await googleStatus(env)).configured });
  if (path === "/auth/google/start" && method === "POST") {
    await limit(
      env,
      `google:${request.headers.get("CF-Connecting-IP") || "local"}`,
      15,
      900000,
    );
    const d = await jsonBody(request);
    assert(
      d.mode === "signin" || d.mode === "link",
      400,
      "Choose sign-in or account linking.",
    );
    return startGoogle(
      request,
      env,
      await session(request, env),
      d.mode === "link",
    );
  }
  if (path === "/auth/google/callback" && method === "GET")
    return googleCallback(request, env);
  if (path === "/auth/google/pending" && method === "GET") {
    const { row } = await pendingGoogle(request, env);
    return json({ email: row.email, display_name: row.display_name });
  }
  if (path === "/auth/google/complete" && method === "POST") {
    await limit(
      env,
      `google-complete:${request.headers.get("CF-Connecting-IP") || "local"}`,
      10,
      900000,
    );
    return completeGoogle(request, env, await jsonBody(request));
  }
  if (path === "/auth/username" && method === "GET") {
    await limit(
      env,
      `username:${request.headers.get("CF-Connecting-IP") || "local"}`,
      60,
    );
    const username = url.searchParams.get("username") || "";
    assert(
      /^[a-z][a-z0-9._]{2,23}$/.test(username),
      400,
      "Use 3–24 lowercase characters, starting with a letter.",
    );
    return json({
      available: !(await one(
        env,
        "SELECT 1 FROM users WHERE username=?",
        username,
      )),
    });
  }
  if (path === "/auth/register" && method === "POST") {
    await limit(
      env,
      `register:${request.headers.get("CF-Connecting-IP") || "local"}`,
      5,
      3600000,
    );
    const d = await jsonBody(request);
    validatePassword(d.password);
    const email = text(d.email, 254).toLowerCase(),
      username = text(d.username, 24);
    assert(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      400,
      "Enter a valid email.",
    );
    assert(
      /^[a-z][a-z0-9._]{2,23}$/.test(username),
      400,
      "Username must be lowercase, 3–24 characters, and start with a letter. Use lowercase letters, numbers, dots or underscores.",
    );
    assert(
      d.terms === true,
      400,
      "Confirm you are at least 13 and accept the community rules to continue.",
    );
    const user = {
      id: id(),
      email,
      username,
      display_name: text(d.display_name, 60),
      password_hash: await hashPassword(d.password),
      created_at: now(),
    };
    try {
      await run(
        env,
        "INSERT INTO users(id,email,username,display_name,password_hash,created_at) VALUES(?,?,?,?,?,?)",
        ...Object.values(user),
      );
    } catch (e) {
      if (/UNIQUE/i.test(e.message))
        throw new HttpError(
          409,
          "Those account details are unavailable. Try signing in or use different details.",
        );
      throw e;
    }
    return issue(
      env,
      await one(env, "SELECT * FROM users WHERE id=?", user.id),
      secure,
    );
  }
  if (path === "/auth/login" && method === "POST") {
    await limit(
      env,
      `login:${request.headers.get("CF-Connecting-IP") || "local"}`,
      10,
      900000,
    );
    const d = await jsonBody(request),
      email = text(d.email, 254).toLowerCase();
    validatePassword(d.password);
    const u = await one(env, "SELECT * FROM users WHERE email=?", email);
    const ok = await verifyPassword(
      d.password,
      u?.password_hash ||
        (await hashPassword("dummy-password-for-timing", "fixed-dummy-salt")),
    );
    assert(
      ok && u?.status === "active",
      401,
      "Email or password is incorrect.",
    );
    return issue(env, u, secure);
  }
  if (path === "/auth/forgot" && method === "POST") {
    await limit(
      env,
      `forgot:${request.headers.get("CF-Connecting-IP") || "local"}`,
      5,
      3600000,
    );
    const d = await jsonBody(request);
    assert(
      await emailConfigured(env),
      503,
      "Password recovery is not configured yet. Contact the site owner.",
    );
    const u = await one(
      env,
      "SELECT * FROM users WHERE email=?",
      text(d.email, 254).toLowerCase(),
    );
    if (u) await sendEmail(env, u, "reset");
    return json({
      message: "If that account exists, a recovery email has been sent.",
    });
  }
  if (
    (path === "/auth/reset" || path === "/auth/verify") &&
    method === "POST"
  ) {
    const d = await jsonBody(request),
      purpose = path.endsWith("reset") ? "reset" : "verify";
    const token = await one(
      env,
      "SELECT * FROM email_tokens WHERE token_hash=? AND purpose=? AND expires_at>?",
      await digest(text(d.token, 64)),
      purpose,
      now(),
    );
    assert(token, 400, "This link has expired or has already been used.");
    const statements = [
      env.DB.prepare("DELETE FROM email_tokens WHERE token_hash=?").bind(
        token.token_hash,
      ),
    ];
    if (purpose === "reset") {
      validatePassword(d.password);
      statements.push(
        env.DB.prepare("UPDATE users SET password_hash=? WHERE id=?").bind(
          await hashPassword(d.password),
          token.user_id,
        ),
        env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(
          token.user_id,
        ),
      );
    } else
      statements.push(
        env.DB.prepare("UPDATE users SET email_verified=1 WHERE id=?").bind(
          token.user_id,
        ),
      );
    await env.DB.batch(statements);
    return json({
      message:
        purpose === "reset"
          ? "Password updated. Sign in again."
          : "Email verified.",
    });
  }
  const u = await session(request, env);
  if (path === "/me" && method === "GET")
    return json({ user: u ? ownerUser(u) : null });
  assert(u, 401, "Sign in to continue.");
  if (path === "/auth/logout" && method === "POST") {
    const token = request.headers
      .get("Cookie")
      ?.match(/social_session=([a-f0-9]{64})/)?.[1];
    if (token)
      await run(
        env,
        "DELETE FROM sessions WHERE token_hash=?",
        await digest(token),
      );
    return json({ ok: true }, 200, { "Set-Cookie": cookie("", secure, 0) });
  }
  assert(u.lock_until <= now(), 423, "Your focus session is active.");
  if (path === "/auth/google/status" && method === "GET")
    return json({
      configured: (await googleStatus(env)).configured,
      linked: !!(await one(
        env,
        "SELECT 1 FROM google_identities WHERE user_id=?",
        u.id,
      )),
    });
  if (path === "/auth/verification" && method === "POST") {
    await limit(env, `verify:${u.id}`, 3, 3600000);
    await sendEmail(env, u, "verify");
    return json({ message: "Check your email for the confirmation link." });
  }
  if (path === "/focus" && method === "POST") {
    const d = await jsonBody(request);
    assert(
      [5, 3600, 14400].includes(d.seconds),
      400,
      "Choose an available duration.",
    );
    const until = now() + d.seconds * 1000;
    await run(
      env,
      "UPDATE users SET lock_until=MAX(lock_until,?) WHERE id=?",
      until,
      u.id,
    );
    return json({ lock_until: until });
  }
  if (path === "/profile" && method === "PATCH") {
    const d = await jsonBody(request);
    return json({ user: await updateProfile(env, u, d) });
  }
  if (path === "/account" && method === "DELETE") {
    const d = await jsonBody(request);
    assert(
      await verifyPassword(d.password || "", u.password_hash),
      403,
      "Confirm your password.",
    );
    const files = await all(env, "SELECT id FROM media WHERE user_id=?", u.id);
    for (const f of files) await env.MEDIA?.delete(f.id);
    await run(env, "DELETE FROM users WHERE id=?", u.id);
    return json({ ok: true }, 200, { "Set-Cookie": cookie("", secure, 0) });
  }
  const profilePath = path.match(/^\/profiles\/([a-z][a-z0-9._]{2,23})$/);
  if (profilePath && method === "GET") {
    const target = await one(
      env,
      "SELECT * FROM users WHERE username=? AND status='active'",
      profilePath[1],
    );
    assert(
      target && !(await blocked(env, u.id, target.id)),
      404,
      "Profile not found.",
    );
    const f = await one(
      env,
      "SELECT accepted FROM follows WHERE follower=? AND following=?",
      u.id,
      target.id,
    );
    return json({
      profile: {
        ...publicUser(target),
        following: !!f,
        follow_accepted: !!f?.accepted,
      },
    });
  }
  if (path === "/people" && method === "GET") {
    const q = (url.searchParams.get("q") || "").slice(0, 40);
    return json({
      people: await all(
        env,
        `SELECT id,username,display_name,bio,private,account_type,EXISTS(SELECT 1 FROM follows f WHERE f.follower=? AND f.following=u.id) AS following FROM users u WHERE status='active' AND id<>? AND (username LIKE ? OR display_name LIKE ?) AND NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.blocker=? AND b.blocked=u.id) OR (b.blocked=? AND b.blocker=u.id)) ORDER BY username LIMIT 30`,
        u.id,
        u.id,
        `%${q}%`,
        `%${q}%`,
        u.id,
        u.id,
      ),
    });
  }
  if (path === "/follow-requests" && method === "GET")
    return json({
      people: await all(
        env,
        "SELECT u.id,u.username,u.display_name FROM follows f JOIN users u ON u.id=f.follower WHERE f.following=? AND f.accepted=0",
        u.id,
      ),
    });
  const follow = path.match(/^\/people\/([^/]+)\/(follow|accept|block)$/);
  if (follow && method === "POST") {
    const target = await one(
      env,
      "SELECT id,private FROM users WHERE id=? AND status='active'",
      follow[1],
    );
    assert(target && target.id !== u.id, 404, "Person not found.");
    const action = follow[2];
    if (action === "block") {
      await env.DB.batch([
        env.DB.prepare("INSERT OR IGNORE INTO blocks VALUES(?,?)").bind(
          u.id,
          target.id,
        ),
        env.DB.prepare(
          "DELETE FROM follows WHERE (follower=? AND following=?) OR (following=? AND follower=?)",
        ).bind(u.id, target.id, u.id, target.id),
      ]);
      return json({ blocked: true });
    }
    assert(!(await blocked(env, u.id, target.id)), 403, "Action unavailable.");
    if (action === "accept") {
      await run(
        env,
        "UPDATE follows SET accepted=1 WHERE follower=? AND following=?",
        target.id,
        u.id,
      );
      return json({ accepted: true });
    }
    const existing = await one(
      env,
      "SELECT 1 FROM follows WHERE follower=? AND following=?",
      u.id,
      target.id,
    );
    if (existing)
      await run(
        env,
        "DELETE FROM follows WHERE follower=? AND following=?",
        u.id,
        target.id,
      );
    else
      await run(
        env,
        "INSERT INTO follows VALUES(?,?,?)",
        u.id,
        target.id,
        target.private ? 0 : 1,
      );
    return json({
      following: !existing,
      requested: !existing && !!target.private,
    });
  }
  if (path === "/uploads" && method === "POST") {
    await limit(env, `upload:${u.id}`, 15, 3600000);
    const mime = request.headers.get("Content-Type")?.split(";")[0];
    assert(
      [
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/webm",
      ].includes(mime),
      415,
      "Choose JPG, PNG, WebP, MP4 or WebM.",
    );
    const bytes = await body(request, MAX_UPLOAD);
    assert(bytes.length > 16, 400, "Empty or invalid file.");
    const png =
      bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
    const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const signature = new TextDecoder().decode(bytes.slice(0, 16));
    assert(
      (mime === "image/png" && png) ||
        (mime === "image/jpeg" && jpg) ||
        (mime === "image/webp" &&
          signature.startsWith("RIFF") &&
          signature.slice(8, 12) === "WEBP") ||
        (mime === "video/mp4" && signature.slice(4, 8) === "ftyp") ||
        (mime === "video/webm" &&
          bytes[0] === 26 &&
          bytes[1] === 69 &&
          bytes[2] === 223 &&
          bytes[3] === 163),
      415,
      "File contents do not match its type.",
    );
    const mid = id();
    try {
      await storeMedia(env, mid, u.id, mime, bytes);
    } catch (e) {
      if (/STORAGE_LIMIT/.test(e.message))
        throw new HttpError(
          507,
          "Pilot storage limit reached. Delete older uploads or contact the owner.",
        );
      throw e;
    }
    return json({ id: mid, mime }, 201);
  }
  const media = path.match(/^\/media\/([\w-]+)$/);
  if (media && method === "GET") {
    const m = await one(env, "SELECT * FROM media WHERE id=?", media[1]);
    assert(m, 404, "Media not found.");
    if (m.user_id !== u.id && u.role !== "admin") {
      const post = await one(
        env,
        "SELECT id FROM posts WHERE media_id=?",
        m.id,
      );
      assert(post, 404, "Media not found.");
      await requirePost(env, u, post.id);
    }
    const result = await readMedia(env, m, request);
    assert(result, 404, "Media not found.");
    return result;
  }

  if (path === "/posts" && method === "POST") {
    const d = await jsonBody(request);
    assert(
      d.human_declared === true,
      400,
      "Confirm that you created this content without generative AI.",
    );
    assert(
      ["photo", "reel", "video", "story"].includes(d.kind),
      400,
      "Choose a post type.",
    );
    const m = await one(
      env,
      "SELECT * FROM media WHERE id=? AND user_id=?",
      d.media_id,
      u.id,
    );
    assert(m, 404, "Upload not found.");
    assert(
      d.kind === "photo"
        ? m.mime.startsWith("image/")
        : d.kind === "story" || m.mime.startsWith("video/"),
      400,
      "Choose the correct media type.",
    );
    const pid = id();
    await run(
      env,
      "INSERT INTO posts(id,user_id,media_id,caption,kind,human_declared,expires_at,created_at,topics) VALUES(?,?,?,?,?,?,?,?,?)",
      pid,
      u.id,
      m.id,
      typeof d.caption === "string" ? d.caption.slice(0, 2200) : "",
      d.kind,
      1,
      d.kind === "story" ? now() + 86400000 : null,
      now(),
      JSON.stringify(cleanTopics(d.topics || [], 3)),
    );
    return json({ id: pid, status: "pending" }, 201);
  }
  if (path === "/posts" && method === "GET")
    return json(await listPosts(env, u, url, canRead));
  const postAction = path.match(
    /^\/posts\/([^/]+)(?:\/(like|save|comments|report))?$/,
  );
  if (postAction) {
    const [, pid, action] = postAction,
      p = await requirePost(env, u, pid);
    if (!action && method === "DELETE") {
      assert(p.user_id === u.id, 403, "Only the owner can delete this post.");
      await env.MEDIA?.delete(p.media_id);
      await env.DB.batch([
        env.DB.prepare("DELETE FROM posts WHERE id=?").bind(pid),
        env.DB.prepare("DELETE FROM media WHERE id=? AND user_id=?").bind(
          p.media_id,
          u.id,
        ),
      ]);
      return json({ ok: true });
    }
    if (["like", "save"].includes(action) && method === "POST") {
      const table = action === "like" ? "likes" : "saves",
        exists = await one(
          env,
          `SELECT 1 FROM ${table} WHERE user_id=? AND post_id=?`,
          u.id,
          pid,
        );
      if (exists)
        await run(
          env,
          `DELETE FROM ${table} WHERE user_id=? AND post_id=?`,
          u.id,
          pid,
        );
      else await run(env, `INSERT INTO ${table} VALUES(?,?)`, u.id, pid);
      return json({ active: !exists });
    }
    if (action === "comments" && method === "GET")
      return json({
        comments: await all(
          env,
          "SELECT c.id,c.body,c.created_at,u.username FROM comments c JOIN users u ON u.id=c.user_id WHERE c.post_id=? AND u.status='active' AND NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.blocker=? AND b.blocked=u.id) OR (b.blocked=? AND b.blocker=u.id)) ORDER BY c.created_at DESC LIMIT 100",
          pid,
          u.id,
          u.id,
        ),
      });
    if (action === "comments" && method === "POST") {
      const d = await jsonBody(request);
      await run(
        env,
        "INSERT INTO comments VALUES(?,?,?,?,?)",
        id(),
        u.id,
        pid,
        text(d.body, 1000),
        now(),
      );
      return json({ ok: true }, 201);
    }
    if (action === "report" && method === "POST") {
      const d = await jsonBody(request);
      assert(
        [
          "AI-generated content",
          "Sexual content",
          "Spam or manipulation",
          "Harassment",
        ].includes(d.reason),
        400,
        "Choose a report reason.",
      );
      await run(
        env,
        "INSERT OR IGNORE INTO reports(id,reporter,post_id,reason,created_at) VALUES(?,?,?,?,?)",
        id(),
        u.id,
        pid,
        d.reason,
        now(),
      );
      return json({ ok: true });
    }
  }
  if (path === "/messages" && method === "GET") {
    const peer = url.searchParams.get("peer");
    if (peer) {
      assert(
        !(await blocked(env, u.id, peer)),
        403,
        "Conversation unavailable.",
      );
      return json({
        messages: await all(
          env,
          "SELECT id,sender,recipient,body,created_at FROM messages WHERE (sender=? AND recipient=?) OR (sender=? AND recipient=?) ORDER BY created_at DESC LIMIT 100",
          u.id,
          peer,
          peer,
          u.id,
        ),
      });
    }
    return json({
      conversations: await all(
        env,
        `SELECT u.id,u.username,u.display_name,(SELECT m.body FROM messages m WHERE (m.sender=? AND m.recipient=u.id) OR (m.recipient=? AND m.sender=u.id) ORDER BY m.created_at DESC LIMIT 1) AS preview FROM users u WHERE u.status='active' AND u.id IN(SELECT recipient FROM messages WHERE sender=? UNION SELECT sender FROM messages WHERE recipient=?) AND NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.blocker=? AND b.blocked=u.id) OR (b.blocked=? AND b.blocker=u.id))`,
        u.id,
        u.id,
        u.id,
        u.id,
        u.id,
        u.id,
      ),
    });
  }
  if (path === "/messages" && method === "POST") {
    await limit(env, `message:${u.id}`, 30);
    const d = await jsonBody(request),
      peer = await one(
        env,
        "SELECT id,private FROM users WHERE id=? AND status='active'",
        d.recipient,
      );
    assert(
      peer && peer.id !== u.id && !(await blocked(env, u.id, peer.id)),
      403,
      "Cannot send to this person.",
    );
    if (peer.private)
      assert(
        await one(
          env,
          "SELECT 1 FROM follows WHERE follower=? AND following=? AND accepted=1",
          u.id,
          peer.id,
        ),
        403,
        "This person accepts messages from approved followers.",
      );
    await run(
      env,
      "INSERT INTO messages VALUES(?,?,?,?,?)",
      id(),
      u.id,
      peer.id,
      text(d.body, 2000),
      now(),
    );
    return json({ ok: true }, 201);
  }
  if (path === "/products" && method === "GET")
    return json({
      products: await all(
        env,
        "SELECT id,name,brand,price_cents,url FROM products WHERE active=1 ORDER BY created_at DESC LIMIT 50",
      ),
    });
  if (path.startsWith("/admin")) {
    assert(u.role === "admin", 403, "Administrator access required.");
    if (path === "/admin/google" && method === "GET")
      return json(await googleStatus(env));
    if (path === "/admin/google" && method === "POST") {
      await limit(env, `google-settings:${u.id}`, 5, 3600000);
      const result = await connectGoogle(env, await jsonBody(request));
      await run(
        env,
        "INSERT INTO audit(id,actor,action,target,created_at) VALUES(?,?,?,?,?)",
        id(),
        u.id,
        "google.connected",
        "google",
        now(),
      );
      return json(result);
    }
    if (path === "/admin/email" && method === "GET")
      return json(await emailStatus(env));
    if (path === "/admin/email" && method === "POST") {
      await limit(env, `email-config:${u.id}`, 5, 3600000);
      const d = await jsonBody(request);
      const result = await connectEmail(env, d);
      await run(
        env,
        "INSERT INTO audit VALUES(?,?,?,?,?)",
        id(),
        u.id,
        "email.connected",
        "sendpulse",
        now(),
      );
      return json(result);
    }
    if (path === "/admin/email/test" && method === "POST") {
      await limit(env, `email-test:${u.id}`, 3, 3600000);
      await deliverEmail(env, {
        to: u.email,
        subject: "Social email connection test",
        text: "This test confirms the Social app can submit transactional email through its configured provider. If you received this, delivery to your mailbox succeeded.",
      });
      return json({
        message:
          "Test email accepted by the provider. Check your inbox and spam folder.",
      });
    }
    if (path === "/admin/overview" && method === "GET")
      return json({
        pending: await all(
          env,
          "SELECT p.id,p.caption,p.kind,p.media_id,p.created_at,m.mime,u.username FROM posts p JOIN users u ON u.id=p.user_id JOIN media m ON m.id=p.media_id WHERE p.status='pending' ORDER BY p.created_at LIMIT 100",
        ),
        reports: await all(
          env,
          "SELECT r.id,r.post_id,r.reason,p.caption,u.username FROM reports r JOIN posts p ON p.id=r.post_id JOIN users u ON u.id=p.user_id WHERE r.status='open' LIMIT 100",
        ),
        users: await all(
          env,
          "SELECT id,username,role,status,created_at FROM users ORDER BY created_at DESC LIMIT 100",
        ),
        audit: await all(
          env,
          "SELECT * FROM audit ORDER BY created_at DESC LIMIT 100",
        ),
      });
    if (method === "POST") {
      const d = await jsonBody(request),
        target = text(d.target, 80);
      if (path === "/admin/moderate") {
        assert(
          ["approved", "removed"].includes(d.status),
          400,
          "Invalid moderation action.",
        );
        await env.DB.batch([
          env.DB.prepare("UPDATE posts SET status=? WHERE id=?").bind(
            d.status,
            target,
          ),
          env.DB.prepare(
            "UPDATE reports SET status='resolved' WHERE post_id=?",
          ).bind(target),
          env.DB.prepare("INSERT INTO audit VALUES(?,?,?,?,?)").bind(
            id(),
            u.id,
            `post.${d.status}`,
            target,
            now(),
          ),
        ]);
        return json({ ok: true });
      }
      if (path === "/admin/suspend") {
        assert(target !== u.id, 400, "You cannot suspend yourself.");
        const targetUser = await one(
          env,
          "SELECT role FROM users WHERE id=?",
          target,
        );
        assert(
          targetUser?.role === "member",
          403,
          "Only member accounts can be suspended here.",
        );
        await env.DB.batch([
          env.DB.prepare("UPDATE users SET status='suspended' WHERE id=?").bind(
            target,
          ),
          env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(target),
          env.DB.prepare("INSERT INTO audit VALUES(?,?,?,?,?)").bind(
            id(),
            u.id,
            "user.suspended",
            target,
            now(),
          ),
        ]);
        return json({ ok: true });
      }
      if (path === "/admin/product") {
        const parsed = new URL(d.url);
        assert(parsed.protocol === "https:", 400, "Use a secure merchant URL.");
        assert(
          Number.isInteger(d.price_cents) &&
            d.price_cents > 0 &&
            d.price_cents < 100000000,
          400,
          "Invalid price.",
        );
        await run(
          env,
          "INSERT INTO products VALUES(?,?,?,?,?,1,?)",
          id(),
          text(d.name, 100),
          text(d.brand, 80),
          d.price_cents,
          parsed.href,
          now(),
        );
        return json({ ok: true }, 201);
      }
    }
  }
  throw new HttpError(404, "Endpoint not found.");
}
export default {
  async fetch(request, env) {
    let response;
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/social/api/"))
        response = await api(request, env);
      else if (
        url.pathname === "/social" ||
        url.pathname.startsWith("/social/") ||
        url.pathname === "/socialdemo" ||
        url.pathname.startsWith("/socialdemo/")
      ) {
        const isAsset = url.pathname.startsWith("/social/assets/");
        if (isAsset) response = await env.ASSETS.fetch(request);
        else {
          url.pathname = url.pathname.startsWith("/socialdemo")
            ? "/socialdemo/index.html"
            : "/social/index.html";
          response = await env.ASSETS.fetch(new Request(url, request));
        }
      } else response = new Response("Not found", { status: 404 });
    } catch (e) {
      response = json(
        {
          error:
            e instanceof HttpError
              ? e.message
              : "Something went wrong. Please try again.",
        },
        e instanceof HttpError ? e.status : 500,
      );
    }
    const out = new Response(response.body, response);
    for (const [key, value] of Object.entries(securityHeaders())) {
      if (key === "Referrer-Policy" && out.headers.get(key) === "no-referrer") continue;
      out.headers.set(key, value);
    }
    if (!out.headers.has("Cache-Control"))
      out.headers.set("Cache-Control", "no-store");
    return out;
  },
  async scheduled(event, env) {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM sessions WHERE expires_at<?").bind(now()),
      env.DB.prepare("DELETE FROM email_tokens WHERE expires_at<?").bind(now()),
      env.DB.prepare("DELETE FROM rate_limits WHERE expires_at<?").bind(now()),
      env.DB.prepare("DELETE FROM email_usage WHERE expires_at<?").bind(now()),
      env.DB.prepare("DELETE FROM oauth_states WHERE expires_at<?").bind(now()),
      env.DB.prepare("DELETE FROM oauth_enrollments WHERE expires_at<?").bind(
        now(),
      ),
    ]);
    const orphans = await all(
      env,
      "SELECT m.id FROM media m LEFT JOIN posts p ON p.media_id=m.id WHERE p.id IS NULL AND m.created_at<? LIMIT 100",
      now() - 86400000,
    );
    for (const m of orphans) {
      await env.MEDIA?.delete(m.id);
      await run(env, "DELETE FROM media WHERE id=?", m.id);
    }
  },
};
