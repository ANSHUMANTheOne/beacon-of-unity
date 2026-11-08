import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fitDimensions,
  videoPlan,
  imageDimensions,
  optimizePhoto,
} from "../src/media-prepare.js";
test("media sizing preserves aspect ratio and video compression rejects impossible budgets", () => {
  assert.deepEqual(fitDimensions(4000, 3000, 2048), {
    width: 2048,
    height: 1536,
  });
  assert.deepEqual(fitDimensions(300, 200, 2048), { width: 300, height: 200 });
  assert.throws(() => fitDimensions(0, 200, 2048));
  assert.ok(videoPlan(90, 8 * 1024 ** 2).videoRate >= 160000);
  assert.throws(() => videoPlan(600, 8 * 1024 ** 2), /too long/);
  assert.throws(() => videoPlan(Infinity, 8 * 1024 ** 2), /duration/);
});
test("bounded media headers reject malformed and oversized images before browser decode", async () => {
  const bytes = new Uint8Array(24);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10]);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, 8000);
  view.setUint32(20, 8000);
  const image = new File([bytes], "large.png", { type: "image/png" });
  assert.deepEqual(await imageDimensions(image), { width: 8000, height: 8000 });
  await assert.rejects(
    optimizePhoto(image, { maxBytes: 8 * 1024 ** 2 }),
    /32 megapixels/,
  );
  await assert.rejects(
    imageDimensions(new File(["not a photo"], "x.png", { type: "image/png" })),
    /could not be read/,
  );
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(
    optimizePhoto(image, { maxBytes: 1000, signal: abort.signal }),
    { name: "AbortError" },
  );
});
