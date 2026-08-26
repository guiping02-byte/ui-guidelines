import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";

async function readBuiltCss() {
  const cssDirectory = fileURLToPath(new URL("../dist/client/_next/static/css/", import.meta.url));
  const files = await readdir(cssDirectory);
  const cssFiles = files.filter((file) => file.endsWith(".css"));
  return Promise.all(cssFiles.map((file) => readFile(path.join(cssDirectory, file), "utf8"))).then((contents) => contents.join("\n"));
}

test("uses the editable blue gradient only for the active bottom navigation icon", async () => {
  const css = await readBuiltCss();

  assert.match(css, /\.nav-demo \.active i\{[^}]*background:var\(--brand\)/);
  assert.match(css, /\.app-shell\[data-theme=blue\] \.nav-demo \.active i\{[^}]*background:linear-gradient\(135deg,\s*var\(--gradient-start\),\s*var\(--gradient-end\)\)/);
});

test("uses the approved solid colors for normal and disabled blue large buttons", async () => {
  const css = await readBuiltCss();
  const primary = css.match(/\.app-shell\[data-theme=blue\] \.demo-primary\{[^}]*\}/)?.[0];
  const disabled = css.match(/\.app-shell\[data-theme=blue\] \.demo-disabled\{[^}]*\}/)?.[0];

  assert.ok(primary, "missing blue primary button rule");
  assert.match(primary, /background:#2c89ff/);
  assert.doesNotMatch(primary, /linear-gradient/);
  assert.ok(disabled, "missing blue disabled button rule");
  assert.match(disabled, /background:#7fb8ff/);
  assert.match(disabled, /grid-column:span 2/);
});

test("uses the approved pink for the disabled red large button", async () => {
  const css = await readBuiltCss();
  const disabled = css.match(/\.app-shell\[data-theme=red\] \.demo-disabled\{[^}]*\}/)?.[0];

  assert.ok(disabled, "missing red disabled button rule");
  assert.match(disabled, /background:#fda0b0/);
  assert.match(disabled, /color:#fff/);
  assert.match(disabled, /grid-column:span 2/);
});
