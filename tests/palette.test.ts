import assert from "node:assert/strict";
import test from "node:test";

import {
  defaultPalette,
  normalizeHex,
  serializeTokens,
  validateStoredPalette,
} from "../app/palette.ts";

test("normalizes valid three and six digit hex colors", () => {
  assert.equal(normalizeHex("d62f36"), "#D62F36");
  assert.equal(normalizeHex("#f04"), "#FF0044");
  assert.equal(normalizeHex("red"), null);
});

test("accepts only complete valid stored palettes", () => {
  const valid = validateStoredPalette({
    brand: "#d62f36",
    price: "#f04438",
    promo: "#ff4d4f",
    member: "#8f1d22",
    care: "#ff7a90",
  });
  assert.deepEqual(valid, defaultPalette);
  assert.equal(validateStoredPalette({ brand: "#D62F36" }), null);
  assert.equal(validateStoredPalette({ ...defaultPalette, care: "pink" }), null);
});

test("serializes the current semantic palette as CSS tokens", () => {
  assert.equal(
    serializeTokens(defaultPalette),
    [
      "--color-brand-primary: #D62F36;",
      "--color-price: #F04438;",
      "--color-promo: #FF4D4F;",
      "--color-member: #8F1D22;",
      "--color-care: #FF7A90;",
    ].join("\n"),
  );
});
