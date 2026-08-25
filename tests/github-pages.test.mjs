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
    text("github-pages/index.html"),
    text("github-pages/main.tsx"),
  ]);

  assert.equal(
    JSON.parse(packageJson).scripts["build:pages"],
    "vite build --config vite.pages.config.ts",
  );
  assert.match(config, /base:\s*["']\/ui-guidelines\/["']/);
  assert.match(config, /root:\s*["']github-pages["']/);
  assert.match(config, /outDir:\s*["']\.\.\/dist-pages["']/);
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /src="\.\/main\.tsx"/);
  assert.match(entry, /from ["']\.\.\/app\/page["']/);
  assert.match(entry, /["']\.\.\/app\/globals\.css["']/);
  assert.match(entry, /createRoot/);
});

test("deploys main to GitHub Pages and documents the new public URL", async () => {
  const [workflow, readme, gitignore, eslintConfig, packageJson] =
    await Promise.all([
    text(".github/workflows/pages.yml"),
    text("README.md"),
    text(".gitignore"),
    text("eslint.config.mjs"),
    text("package.json"),
  ]);

  assert.match(workflow, /branches:\s*\[main\]/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /pnpm build:pages/);
  assert.match(workflow, /path:\s*dist-pages/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(readme, /https:\/\/guiping02-byte\.github\.io\/ui-guidelines\//);
  assert.match(readme, /main/);
  assert.doesNotMatch(
    readme,
    /blue-ui-board-lixujie\.guiping02\.chatgpt\.site/,
  );
  assert.match(gitignore, /^dist-pages\/$/m);
  assert.match(eslintConfig, /["']dist-pages\/\*\*["']/);
  assert.match(
    JSON.parse(packageJson).scripts.test,
    /node --experimental-strip-types --test/,
  );
});
