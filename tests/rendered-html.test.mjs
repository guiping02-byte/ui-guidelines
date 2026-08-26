import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the red maternal design board", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>红色母婴 UI 设计系统看板<\/title>/i);
  assert.match(html, /红色母婴设计系统看板/);
  assert.match(html, /直接修改色号，组件会实时更新/);
  assert.match(html, /品牌主色/);
  assert.match(html, /价格红/);
  assert.match(html, /促销亮红/);
  assert.match(html, /会员深红/);
  assert.match(html, /关怀浅粉/);
  assert.match(html, /辅助金色/);
  assert.doesNotMatch(html, /蓝色设计系统看板|codex-preview|Building your site/i);
});

test("renders the default semantic palette and representative components", async () => {
  const response = await render();
  const html = await response.text();

  for (const value of ["#D62F36", "#F04438", "#FF4D4F", "#8F1D22", "#FF7A90", "#DDB65E"]) {
    assert.match(html, new RegExp(value, "i"));
  }
  assert.match(html, /安心成长提醒/);
  assert.match(html, /会员专享/);
  assert.match(html, /限时优惠/);
  assert.match(html, /复制 CSS Tokens/);
});

test("renders a two-theme switcher with red selected by default", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /红色母婴/);
  assert.match(html, /蓝色通用/);
  assert.match(html, /<button[^>]*aria-pressed="true"[^>]*>[\s\S]*?红色母婴<\/button>/);
  assert.match(html, /<button[^>]*aria-pressed="false"[^>]*>[\s\S]*?蓝色通用<\/button>/);
});

test("marks the active theme so gradient styling stays blue-only", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /<main[^>]*data-theme="red"/);
});

test("renders selected and unselected choice controls", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /选择与筛选/);
  assert.match(html, /<button[^>]*aria-pressed="true"[^>]*>全职<\/button>/);
  assert.match(html, /<button[^>]*aria-pressed="false"[^>]*>兼职<\/button>/);
  assert.match(html, /<button[^>]*aria-pressed="true"[^>]*>运营<\/button>/);
  assert.match(html, /<button[^>]*aria-pressed="false"[^>]*>客服<\/button>/);
});

test("renders the approved red typography color hierarchy", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /字体规范/);
  for (const heading of ["示例", "字号 / 行高", "字重", "字体颜色", "用途"]) {
    assert.match(html, new RegExp(heading));
  }
  assert.match(html, /24px \/ 32px/);
  assert.match(html, /Medium \/ 600/);
  assert.match(html, /Regular \/ 400/);
  assert.match(html, /一级页面标题、详情页标题/);
  assert.match(html, /红色主题字体采用黑灰层级/);

  const expectedColors = new Map([
    ["页面标题", "#222222"],
    ["模块标题", "#222222"],
    ["区块标题", "#222222"],
    ["正文文字", "#666666"],
    ["辅助说明", "#999999"],
    ["按钮文字", "#222222"],
  ]);
  const rows = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((match) => match[1]);
  for (const [sample, color] of expectedColors) {
    const row = rows.find((candidate) => candidate.includes(sample));
    assert.ok(row, `missing typography row for ${sample}`);
    assert.match(row, new RegExp(color));
  }
  assert.doesNotMatch(html, /待定义/);
});

test("renders the approved red page background color", async () => {
  const response = await render();
  const html = await response.text();

  const block = html.match(/<section class="background-color-spec"[\s\S]*?<\/section>/)?.[0];
  assert.ok(block, "missing page background color specification");
  assert.match(block, /页面背景色/);
  assert.match(block, /#FAFAFA/);
  assert.match(block, /页面整体背景、内容区域底色/);
});

test("renders the approved 4px and 8px radius guidelines", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /圆角规范/);
  assert.match(html, /--radius-small/);
  assert.match(html, />4px</);
  assert.match(html, /--radius-medium/);
  assert.match(html, />8px</);
  assert.match(html, /促销标签、状态标识、小型信息块/);
  assert.match(html, /按钮、输入框、选择项、卡片内部容器/);
});

test("documents blue warm auxiliary colors with roles and reference examples", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /暖色辅助规范/);
  for (const value of ["#FF6A2A", "#FFF1E8", "#FFD666", "#FFF7E6"]) {
    assert.match(html, new RegExp(value, "i"));
  }
  assert.match(html, /\+9积分、去领取、85岁、预计累计收益/);
  assert.match(html, /奖励条、轻按钮、提示标签背景/);
  assert.match(html, /金币图标、金选理由、会员权益/);
  assert.match(html, /暖色只做局部强调，不能替代主蓝按钮与导航/);
});

test("places the warm auxiliary guidelines before the radius guidelines", async () => {
  const response = await render();
  const html = await response.text();

  const warmIndex = html.indexOf("暖色辅助规范");
  const radiusIndex = html.indexOf("圆角规范");

  assert.notEqual(warmIndex, -1, "missing warm auxiliary guidelines");
  assert.notEqual(radiusIndex, -1, "missing radius guidelines");
  assert.ok(warmIndex < radiusIndex, "warm auxiliary guidelines must render before radius guidelines");
});

test("merges red semantic details into the left editor without duplicate content", async () => {
  const response = await render();
  const html = await response.text();

  assert.doesNotMatch(html, /红色语义分层/);
  for (const role of ["品牌主红", "价格红", "促销亮红", "会员深红", "关怀浅粉", "辅助金色"]) {
    assert.equal((html.match(new RegExp(`<b>${role}</b>`, "g")) ?? []).length, 1);
  }
  assert.match(html, /选中导航、页签、主要按钮、关键入口/);
  assert.match(html, /参考：(?:<!-- -->)?爆料、卡券、立即使用、底部导航选中/);
  assert.match(html, /参考：(?:<!-- -->)?超级会员、升级、奖励、优惠标签/);
  assert.match(html, /红橙渐变仅限营销素材，不纳入红色组件 Token/);
});
