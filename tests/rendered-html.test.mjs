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
  assert.match(html, /促销红/);
  assert.match(html, /会员深红/);
  assert.match(html, /关怀粉红/);
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

test("renders a complete typography specification with colors deferred", async () => {
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
  assert.equal((html.match(/待定义/g) ?? []).length, 6);
});
