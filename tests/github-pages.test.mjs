import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function text(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("defines a GitHub Pages static build for the repository base path", async () => {
  const [packageJson, config, html, entry] = await Promise.all([
    text("package.json"),
    text("vite.pages.config.ts"),
    text("pages/index.html"),
    text("pages/main.tsx"),
  ]);

  assert.equal(
    JSON.parse(packageJson).scripts["build:pages"],
    "vite build --config vite.pages.config.ts",
  );
  assert.match(config, /base:\s*["']\/ui-guidelines\/["']/);
  assert.match(config, /outDir:\s*["']\.\.\/dist-pages["']/);
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /src="\.\/main\.tsx"/);
  assert.match(entry, /from ["']\.\.\/app\/page["']/);
  assert.match(entry, /["']\.\.\/app\/globals\.css["']/);
  assert.match(entry, /createRoot/);
});
