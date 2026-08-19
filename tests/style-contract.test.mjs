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
