import assert from "node:assert/strict";
import test from "node:test";
import * as paletteModule from "../app/palette.ts";

import {
  defaultPalette,
  defaultPalettes,
  getThemePresets,
  normalizeHex,
  serializeTokens,
  storageKeyForTheme,
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
  assert.deepEqual(valid, {
    brand: "#D62F36",
    price: "#F04438",
    promo: "#FF4D4F",
    member: "#8F1D22",
    care: "#FF7A90",
  });
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
      "--color-accent: #DDB65E;",
    ].join("\n"),
  );
});

test("adds the approved auxiliary gold only to the red theme", () => {
  assert.equal(defaultPalettes.red.accent, "#DDB65E");
  assert.equal(defaultPalettes.blue.accent, undefined);
});

test("keeps red and blue palettes in separate storage slots", () => {
  assert.deepEqual(defaultPalettes.red, {
    brand: "#D62F36",
    price: "#F04438",
    promo: "#FF4D4F",
    member: "#8F1D22",
    care: "#FF7A90",
    accent: "#DDB65E",
  });
  assert.deepEqual(defaultPalettes.blue, {
    brand: "#1677FF",
    price: "#D9363E",
    promo: "#FF6A2A",
    member: "#183B6B",
    care: "#22B8E6",
  });
  assert.equal(storageKeyForTheme("red"), "maternal-ui-palette:red");
  assert.equal(storageKeyForTheme("blue"), "maternal-ui-palette:blue:fintech-v1");
});

test("offers one reference-matched fintech blue preset", () => {
  assert.deepEqual(
    getThemePresets("blue").map((preset) => preset.name),
    ["金融科技蓝"],
  );
});

test("uses reference-matched semantic labels for the blue editor", () => {
  const getThemeColorControls = paletteModule.getThemeColorControls;
  assert.equal(typeof getThemeColorControls, "function");
  assert.deepEqual(
    getThemeColorControls?.("blue").map((control) => [control.key, control.label]),
    [
      ["brand", "主蓝"],
      ["price", "收益红"],
      ["promo", "奖励橙"],
      ["member", "金融深蓝"],
      ["care", "科技青"],
    ],
  );
});

test("offers only the default red preset", () => {
  assert.deepEqual(
    getThemePresets("red").map((preset) => preset.name),
    ["规范默认"],
  );
});
