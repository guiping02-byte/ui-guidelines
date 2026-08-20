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
      "--radius-small: 4px;",
      "--radius-medium: 8px;",
    ].join("\n"),
  );
});

test("serializes the approved radius scale for every theme", () => {
  for (const palette of Object.values(defaultPalettes)) {
    const tokens = serializeTokens(palette);
    assert.equal((tokens.match(/--radius-small: 4px;/g) ?? []).length, 1);
    assert.equal((tokens.match(/--radius-medium: 8px;/g) ?? []).length, 1);
  }
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
    gradientStart: "#22B8E6",
    gradientEnd: "#1677FF",
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
      ["gradientStart", "渐变起始色"],
      ["gradientEnd", "渐变结束色"],
    ],
  );
});

test("offers only the default red preset", () => {
  assert.deepEqual(
    getThemePresets("red").map((preset) => preset.name),
    ["规范默认"],
  );
});

test("adds editable gradient stops only to the blue theme", () => {
  assert.equal(defaultPalettes.red.gradientStart, undefined);
  assert.equal(defaultPalettes.red.gradientEnd, undefined);
  assert.equal(defaultPalettes.blue.gradientStart, "#22B8E6");
  assert.equal(defaultPalettes.blue.gradientEnd, "#1677FF");

  const getThemeColorControls = paletteModule.getThemeColorControls;
  assert.deepEqual(
    getThemeColorControls("blue").slice(-2).map((control) => [control.key, control.label]),
    [
      ["gradientStart", "渐变起始色"],
      ["gradientEnd", "渐变结束色"],
    ],
  );
  assert.equal(getThemeColorControls("red").some((control) => control.key.startsWith("gradient")), false);
});

test("serializes the blue gradient as reusable CSS tokens", () => {
  assert.equal(
    serializeTokens(defaultPalettes.blue),
    [
      "--color-brand-primary: #1677FF;",
      "--color-price: #D9363E;",
      "--color-promo: #FF6A2A;",
      "--color-member: #183B6B;",
      "--color-care: #22B8E6;",
      "--color-gradient-start: #22B8E6;",
      "--color-gradient-end: #1677FF;",
      "--gradient-primary: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));",
      "--radius-small: 4px;",
      "--radius-medium: 8px;",
    ].join("\n"),
  );
  assert.doesNotMatch(serializeTokens(defaultPalettes.red), /gradient/i);
});

test("persists complete gradient pairs and rejects incomplete ones", () => {
  assert.deepEqual(validateStoredPalette(defaultPalettes.blue), defaultPalettes.blue);

  assert.equal(validateStoredPalette({ ...defaultPalettes.blue, gradientEnd: undefined }), null);
  assert.equal(validateStoredPalette({ ...defaultPalettes.blue, gradientStart: "cyan" }), null);
});

test("maps the approved four-level neutral text palette to blue typography roles", () => {
  const getTypographySpecs = paletteModule.getTypographySpecs;
  assert.equal(typeof getTypographySpecs, "function");
  assert.deepEqual(
    getTypographySpecs?.("blue").map(({ sample, color, usage }) => [sample, color, usage]),
    [
      ["页面标题", "#323232", "一级页面标题、详情页标题"],
      ["模块标题", "#323232", "卡片标题、弹窗标题、运营区标题"],
      ["区块标题", "#646464", "表单分组、列表区块标题"],
      ["正文文字", "#646464", "商品信息、表单内容、列表正文"],
      ["辅助说明", "#969696", "注释、帮助、时间与状态说明"],
      ["按钮文字", "#646464", "主次按钮、筛选项和操作入口"],
      ["提示文字", "#C8C8C8", "输入框占位、禁用状态与弱提示"],
    ],
  );
});

test("provides the approved page background specification for the blue theme", () => {
  const getPageBackgroundSpec = paletteModule.getPageBackgroundSpec;
  assert.equal(typeof getPageBackgroundSpec, "function");
  assert.deepEqual(getPageBackgroundSpec?.("blue"), {
    color: "#FAFAFA",
    usage: "页面整体背景、内容区域底色",
  });
});
