import { TOPICS } from "../src/topics.js";
import { assert, publicUser, ownerUser } from "./security.js";
export function cleanTopics(value, max = 12) {
  assert(
    Array.isArray(value) &&
      value.length <= max &&
      value.every((t) => TOPICS.includes(t)),
    400,
    "Choose valid interests from the available topics.",
  );
  return [...new Set(value)];
}
export async function updateProfile(env, u, d) {
  const name = d.display_name ?? u.display_name;
  assert(
    typeof name === "string" && name.trim().length > 0 && name.length <= 60,
    400,
    "Enter a display name up to 60 characters.",
  );
  const account = d.account_type ?? u.account_type;
  assert(
    ["person", "organization"].includes(account),
    400,
    "Choose a person or organization profile.",
  );
  const interests = d.interests
    ? cleanTopics(d.interests)
    : JSON.parse(u.interests || "[]");
  let website = d.website ?? u.website;
  if (website) {
    try {
      const url = new URL(website);
      assert(url.protocol === "https:", 400, "Website links must use HTTPS.");
      website = url.href;
    } catch {
      assert(false, 400, "Enter a valid HTTPS website link.");
    }
  }
  assert(!website || website.length <= 500, 400, "Website URL is too long.");
  await env.DB.prepare(
    "UPDATE users SET display_name=?,bio=?,private=?,account_type=?,interests=?,website=? WHERE id=?",
  )
    .bind(
      name.trim(),
      typeof d.bio === "string" ? d.bio.slice(0, 240) : u.bio,
      d.private === undefined ? u.private : d.private ? 1 : 0,
      account,
      JSON.stringify(interests),
      website || "",
      u.id,
    )
    .run();
  return ownerUser(
    await env.DB.prepare("SELECT * FROM users WHERE id=?").bind(u.id).first(),
  );
}
export async function listPosts(env, u, url, canRead) {
  const view = url.searchParams.get("view") || "feed",
    kind = url.searchParams.get("kind") || "photo",
    topic = url.searchParams.get("topic");
  assert(
    ["feed", "discover", "mine", "saved", "profile"].includes(view),
    400,
    "Invalid feed.",
  );
  assert(
    ["photo", "reel", "video", "story"].includes(kind),
    400,
    "Invalid post type.",
  );
  assert(!topic || TOPICS.includes(topic), 400, "Choose an available topic.");
  const before = Number(url.searchParams.get("before")) || Date.now() + 1;
  const args = [u.id, u.id, before, kind, u.id, Date.now()];
  let where = "";
  if (view === "mine") {
    where = "AND p.user_id=?";
    args.push(u.id);
  } else if (view === "saved") {
    where = "AND EXISTS(SELECT 1 FROM saves WHERE user_id=? AND post_id=p.id)";
    args.push(u.id);
  } else if (view === "profile") {
    where = "AND p.user_id=?";
    args.push(url.searchParams.get("owner") || "");
  } else if (view === "feed") {
    where =
      "AND (p.user_id=? OR EXISTS(SELECT 1 FROM follows f WHERE f.follower=? AND f.following=p.user_id AND f.accepted=1))";
    args.push(u.id, u.id);
  } else {
    where =
      "AND (u.account_type='person' OR EXISTS(SELECT 1 FROM follows f WHERE f.follower=? AND f.following=p.user_id AND f.accepted=1))";
    args.push(u.id);
    const choices = topic ? [topic] : JSON.parse(u.interests || "[]");
    if (choices.length) {
      where +=
        " AND EXISTS(SELECT 1 FROM json_each(p.topics) t WHERE t.value IN(SELECT value FROM json_each(?)))";
      args.push(JSON.stringify(choices));
    }
  }
  const { results } = await env.DB.prepare(
    `SELECT p.id,p.user_id,p.media_id,p.caption,p.kind,p.status,p.expires_at,p.created_at,p.topics,u.username,u.display_name,u.account_type,u.private,u.status AS owner_status,m.mime,(SELECT COUNT(*) FROM likes WHERE post_id=p.id) AS likes,(SELECT COUNT(*) FROM comments WHERE post_id=p.id) AS comments,EXISTS(SELECT 1 FROM likes WHERE post_id=p.id AND user_id=?) AS liked,EXISTS(SELECT 1 FROM saves WHERE post_id=p.id AND user_id=?) AS saved FROM posts p JOIN users u ON u.id=p.user_id JOIN media m ON m.id=p.media_id WHERE p.created_at<? AND p.kind=? AND (p.status='approved' OR p.user_id=?) AND (p.expires_at IS NULL OR p.expires_at>?) ${where} ORDER BY p.created_at DESC LIMIT 15`,
  )
    .bind(...args)
    .all();
  const posts = [];
  for (const p of results)
    if (await canRead(env, u, p))
      posts.push({ ...p, topics: JSON.parse(p.topics || "[]") });
  return {
    posts,
    next: results.length === 15 ? results.at(-1).created_at : null,
  };
}
