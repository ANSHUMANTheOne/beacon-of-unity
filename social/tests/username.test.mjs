import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";
// Regression for the observed browser mismatch. Verify the actual form pattern,
// not a separately maintained copy of the rule.
test("username field explains and enforces lowercase handles", () => {
  const source = readFileSync(
    new URL("../src/main.jsx", import.meta.url),
    "utf8",
  );
  const pattern = /pattern="([^"]+)"/.exec(source)?.[1];
  assert.ok(pattern);
  const re = new RegExp(`^(?:${pattern})$`);
  for (const valid of ["anshuman", "anshuman.tripathy", "anshuman_23"])
    assert.equal(re.test(valid), true);
  for (const invalid of [
    "Anshuman",
    "ANSHUMAN",
    "an shuman",
    "1anshuman",
    "ab",
  ])
    assert.equal(re.test(invalid), false);
  assert.match(source, /Lowercase only/);
  assert.match(source, /I am 13 or older/);
  assert.doesNotThrow(() => transformSync(source, { loader: "jsx" }));
});
