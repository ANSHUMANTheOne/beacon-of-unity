import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import {
  seal,
  unseal,
  connectEmail,
  deliverEmail,
  emailStatus,
} from "../worker/email.js";
function setup() {
  const db = new DatabaseSync(":memory:");
  db.exec(
    readFileSync(
      new URL("../migrations/0004_email_settings.sql", import.meta.url),
      "utf8",
    ),
  );
  return {
    db,
    env: {
      EMAIL_SETTINGS_KEY: "a".repeat(64),
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
            async first() {
              return db.prepare(sql).get() || null;
            },
          };
        },
      },
    },
  };
}
test("provider credentials are encrypted with a separate server key", async () => {
  const { env } = setup();
  const secret = {
    apiKey: "fake-key-for-unit-test-only",
    senderEmail: "hello@example.test",
    senderName: "Test",
  };
  const packed = await seal(env, secret);
  assert.ok(!packed.includes(secret.apiKey));
  assert.deepEqual(await unseal(env, packed), secret);
  const data = JSON.parse(packed);
  data.data = (data.data[0] === "A" ? "B" : "A") + data.data.slice(1);
  await assert.rejects(() => unseal(env, JSON.stringify(data)));
  await assert.rejects(() =>
    unseal({ ...env, EMAIL_SETTINGS_KEY: "b".repeat(64) }, packed),
  );
});
test("connection validates the key and status never exposes credentials", async () => {
  const { env, db } = setup();
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response("{}", { status: 200 });
    await connectEmail(env, {
      api_key: "fake-key-for-unit-test-only",
      sender_email: "hello@example.test",
      sender_name: "Test",
    });
    const row = db
      .prepare("SELECT value FROM app_settings WHERE key='email'")
      .get();
    assert.ok(!row.value.includes("fake-key"));
    const status = await emailStatus(env);
    assert.equal(status.configured, true);
    assert.equal(status.sender, "hello@example.test");
    assert.equal(JSON.stringify(status).includes("fake-key"), false);
  } finally {
    globalThis.fetch = original;
  }
});
test("delivery respects the free hourly ceiling and rolls back failed sends", async () => {
  const { env, db } = setup();
  env.SENDPULSE_API_KEY = "fake-key-for-unit-test-only";
  const original = globalThis.fetch;
  let called = 0;
  try {
    globalThis.fetch = async (url, options) => {
      called++;
      assert.equal(url, "https://api.sendpulse.com/smtp/emails");
      assert.equal(
        JSON.parse(options.body).email.to[0].email,
        "owner@example.test",
      );
      return new Response('{"result":true,"id":"test"}');
    };
    await deliverEmail(env, {
      to: "owner@example.test",
      subject: "Test",
      text: "Verification test",
    });
    assert.equal(called, 1);
    assert.equal((await emailStatus(env)).hourly_used, 1);
    db.prepare(
      "UPDATE email_usage SET count=50 WHERE bucket LIKE 'hour:%'",
    ).run();
    await assert.rejects(
      () =>
        deliverEmail(env, {
          to: "owner@example.test",
          subject: "Test",
          text: "No send",
        }),
      /allowance/,
    );
    assert.equal(called, 1);
    db.prepare("UPDATE email_usage SET count=0").run();
    globalThis.fetch = async () =>
      new Response('{"result":false}', { status: 403 });
    await assert.rejects(
      () =>
        deliverEmail(env, {
          to: "owner@example.test",
          subject: "Test",
          text: "No send",
        }),
      /not accepted/,
    );
    assert.equal((await emailStatus(env)).hourly_used, 0);
    assert.equal((await emailStatus(env)).monthly_used, 0);
  } finally {
    globalThis.fetch = original;
  }
});
