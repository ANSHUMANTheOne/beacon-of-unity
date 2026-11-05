import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { listPosts, updateProfile } from "../worker/community.js";
function setup() {
  const db = new DatabaseSync(":memory:");
  for (const file of [
    "0001_initial.sql",
    "0002_media_chunks.sql",
    "0003_interests_and_organizations.sql",
  ])
    db.exec(
      readFileSync(new URL("../migrations/" + file, import.meta.url), "utf8"),
    );
  const env = {
    DB: {
      prepare(sql) {
        return {
          bind(...args) {
            return {
              async first() {
                return db.prepare(sql).get(...args) || null;
              },
              async all() {
                return { results: db.prepare(sql).all(...args) };
              },
              async run() {
                return db.prepare(sql).run(...args);
              },
            };
          },
        };
      },
    },
  };
  for (const [id, name, type, interests] of [
    ["viewer", "viewer", "person", '["Music"]'],
    ["artist", "artist", "person", "[]"],
    ["coffee", "coffee", "organization", "[]"],
  ])
    db.prepare(
      "INSERT INTO users(id,email,username,display_name,password_hash,created_at,account_type,interests) VALUES(?,?,?,?,?,?,?,?)",
    ).run(
      id,
      id + "@example.test",
      name,
      name,
      "test-only",
      1,
      type,
      interests,
    );
  let timestamp = Date.now() - 1000;
  for (const [id, uid, topics] of [
    ["music", "artist", '["Music"]'],
    ["food", "artist", '["Food"]'],
    ["brand", "coffee", '["Music"]'],
  ]) {
    db.prepare("INSERT INTO media VALUES(?,?,?,?,?)").run(
      id,
      uid,
      "image/png",
      50,
      1,
    );
    db.prepare(
      "INSERT INTO posts(id,user_id,media_id,caption,kind,status,human_declared,created_at,topics) VALUES(?,?,?,?,'photo','approved',1,?,?)",
    ).run(id, uid, id, id, timestamp++, topics);
  }
  return {
    db,
    env,
    user: db.prepare("SELECT * FROM users WHERE id='viewer'").get(),
  };
}
test("Discover respects chosen interests and excludes unfollowed organizations", async () => {
  const { db, env, user } = setup();
  const result = await listPosts(
    env,
    user,
    new URL("https://example.test/social/api/posts?view=discover"),
    async () => true,
  );
  assert.deepEqual(
    result.posts.map((p) => p.id),
    ["music"],
  );
  db.prepare("INSERT INTO follows VALUES('viewer','coffee',1)").run();
  const following = await listPosts(
    env,
    user,
    new URL("https://example.test/social/api/posts?view=discover"),
    async () => true,
  );
  assert.deepEqual(
    following.posts.map((p) => p.id),
    ["brand", "music"],
  );
  const ownpage = await listPosts(
    env,
    user,
    new URL("https://example.test/social/api/posts?view=profile&owner=coffee"),
    async () => true,
  );
  assert.equal(ownpage.posts[0].id, "brand");
});
test("interest and organization profile updates preserve unrelated privacy settings", async () => {
  const { db, env, user } = setup();
  db.prepare("UPDATE users SET private=1 WHERE id='viewer'").run();
  const current = db.prepare("SELECT * FROM users WHERE id='viewer'").get();
  const result = await updateProfile(env, current, { interests: ["Food"] });
  assert.equal(result.private, true);
  assert.deepEqual(result.interests, ["Food"]);
  const org = await updateProfile(
    env,
    { ...current, interests: '["Food"]' },
    { account_type: "organization", website: "https://example.test/team" },
  );
  assert.equal(org.account_type, "organization");
  assert.equal(org.website, "https://example.test/team");
  await assert.rejects(
    () => updateProfile(env, current, { interests: ["Sponsored"] }),
    /available topics/,
  );
  await assert.rejects(
    () => updateProfile(env, current, { website: "javascript:alert(1)" }),
    /HTTPS/,
  );
});
