# GitHub Pages Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the existing UI design-system board at GitHub Pages, automatically redeploy pushes to `main`, and permanently delete the former Sites project after the new website is verified.

**Architecture:** Reuse `app/page.tsx`, `app/palette.ts`, and `app/globals.css` as the single UI source. Add a separate static Vite entry and build configuration for GitHub Pages while leaving the existing Sites build intact until cutover; a GitHub Actions workflow builds and deploys the static artifact on every push to `main`.

**Tech Stack:** React 19, TypeScript, Vite 8, pnpm 11, GitHub Actions, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-08-25-github-pages-migration-design.md`

## Global Constraints

- Public repository is exactly `guiping02-byte/ui-guidelines`.
- Public website is exactly `https://guiping02-byte.github.io/ui-guidelines/`.
- GitHub Pages public base path is exactly `/ui-guidelines/`.
- Existing board visuals, controls, palette behavior, and browser-local persistence remain unchanged.
- Edits made in the live board remain browser-local and do not write to GitHub.
- Do not delete Sites project `appgprj_6a84204cfce8819182be3c25c15e8a4c` until every release verification passes.
- The former Sites project is permanently deleted after successful cutover and is not retained as a redirect or backup.

---

## File Structure

- `pages/index.html`: static document and React mount point for GitHub Pages.
- `pages/main.tsx`: browser entry that imports the shared stylesheet and mounts the existing board.
- `vite.pages.config.ts`: isolated static-build configuration with the repository base path.
- `tests/github-pages.test.mjs`: deployment-contract tests for the static entry, base path, scripts, workflow, and README.
- `.github/workflows/pages.yml`: official GitHub Pages build-and-deploy workflow.
- `package.json`: exposes the `build:pages` command.
- `README.md`: names GitHub Pages as the only public viewing link and documents automatic deployment behavior.

### Task 1: Static GitHub Pages Build

**Files:**
- Create: `tests/github-pages.test.mjs`
- Create: `pages/index.html`
- Create: `pages/main.tsx`
- Create: `vite.pages.config.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: default React component from `app/page.tsx` and styles from `app/globals.css`.
- Produces: `pnpm build:pages`, which emits a static website to `dist-pages/` with asset URLs rooted at `/ui-guidelines/`.

- [ ] **Step 1: Write the failing static-build contract test**

Create `tests/github-pages.test.mjs` with:

```js
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

  assert.equal(JSON.parse(packageJson).scripts["build:pages"], "vite build --config vite.pages.config.ts");
  assert.match(config, /base:\s*["']\/ui-guidelines\/["']/);
  assert.match(config, /outDir:\s*["']dist-pages["']/);
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /src="\.\/main\.tsx"/);
  assert.match(entry, /from ["']\.\.\/app\/page["']/);
  assert.match(entry, /["']\.\.\/app\/globals\.css["']/);
  assert.match(entry, /createRoot/);
});
```

- [ ] **Step 2: Run the contract test and verify failure**

Run: `node --test tests/github-pages.test.mjs`

Expected: FAIL because `vite.pages.config.ts`, `pages/index.html`, and `pages/main.tsx` do not exist.

- [ ] **Step 3: Add the minimal static entry and build configuration**

Create `pages/index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="红色母婴与蓝色通用小程序 UI 设计系统看板" />
    <title>UI 设计规范看板</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
```

Create `pages/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "../app/page";
import "../app/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root mount element");
}

createRoot(root).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);
```

Create `vite.pages.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/ui-guidelines/",
  root: "pages",
  plugins: [react()],
  build: {
    outDir: "../dist-pages",
    emptyOutDir: true,
  },
});
```

Add this exact script to `package.json`:

```json
"build:pages": "vite build --config vite.pages.config.ts"
```

- [ ] **Step 4: Run the focused test and static build**

Run: `node --test tests/github-pages.test.mjs`

Expected: PASS.

Run: `pnpm build:pages`

Expected: Vite exits with code 0 and creates `dist-pages/index.html` plus hashed assets under `dist-pages/assets/`.

- [ ] **Step 5: Verify generated asset paths**

Run:

```powershell
$pagesHtml = Get-Content -Raw dist-pages\index.html
if ($pagesHtml -notmatch '/ui-guidelines/assets/') { throw 'GitHub Pages asset base path is missing' }
```

Expected: exits successfully with no output.

- [ ] **Step 6: Commit the static build**

```powershell
git add package.json pages vite.pages.config.ts tests/github-pages.test.mjs
git commit -m "feat: add GitHub Pages static build"
```

### Task 2: Automatic GitHub Pages Deployment and Documentation

**Files:**
- Modify: `tests/github-pages.test.mjs`
- Create: `.github/workflows/pages.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: `pnpm build:pages` and output directory `dist-pages/` from Task 1.
- Produces: a GitHub Actions Pages deployment on pushes to `main` and a README whose only public website URL is the GitHub Pages URL.

- [ ] **Step 1: Extend the deployment-contract test and verify failure**

Append to `tests/github-pages.test.mjs`:

```js
test("deploys main to GitHub Pages and documents the new public URL", async () => {
  const [workflow, readme] = await Promise.all([
    text(".github/workflows/pages.yml"),
    text("README.md"),
  ]);

  assert.match(workflow, /branches:\s*\[main\]/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /pnpm build:pages/);
  assert.match(workflow, /path:\s*dist-pages/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(readme, /https:\/\/guiping02-byte\.github\.io\/ui-guidelines\//);
  assert.match(readme, /main/);
  assert.doesNotMatch(readme, /blue-ui-board-lixujie\.guiping02\.chatgpt\.site/);
});
```

Run: `node --test tests/github-pages.test.mjs`

Expected: FAIL because `.github/workflows/pages.yml` does not exist and README still links to the former site.

- [ ] **Step 2: Add the GitHub Pages workflow**

Create `.github/workflows/pages.yml`:

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 11.19.0
      - uses: actions/setup-node@v4
        with:
          node-version: 22.13.0
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - run: pnpm lint
      - run: pnpm build:pages
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist-pages
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Update the README**

Replace the online URL with `https://guiping02-byte.github.io/ui-guidelines/`.
Add a “发布更新” section stating that pushes to `main` automatically deploy,
deployment may take several minutes, and live color edits remain browser-local.
Remove `OpenAI Sites / Cloudflare Worker runtime` from the public hosting description.

- [ ] **Step 4: Run contract, full tests, static build, and lint**

Run:

```powershell
node --test tests/github-pages.test.mjs
pnpm test
pnpm build:pages
pnpm lint
```

Expected: all four commands exit with code 0.

- [ ] **Step 5: Commit deployment automation**

```powershell
git add .github/workflows/pages.yml README.md tests/github-pages.test.mjs
git commit -m "ci: deploy UI board to GitHub Pages"
```

### Task 3: Publish and Verify GitHub Pages

**Files:**
- Publish: current committed Git tree to `github/main`
- Verify: GitHub repository Pages settings and workflow run

**Interfaces:**
- Consumes: the validated commits from Tasks 1 and 2.
- Produces: a successful deployment at `https://guiping02-byte.github.io/ui-guidelines/`.

- [ ] **Step 1: Confirm the exact push target and clean tree**

Run:

```powershell
git status --short
git remote get-url github
git log -1 --oneline
```

Expected: clean status and remote URL `https://github.com/guiping02-byte/ui-guidelines.git`.

- [ ] **Step 2: Push the verified branch head to GitHub main**

Run: `git push github HEAD:main`

Expected: push succeeds without a non-fast-forward error.

- [ ] **Step 3: Ensure GitHub Pages uses GitHub Actions**

Inspect `repos/guiping02-byte/ui-guidelines/pages`. If Pages is absent, create
the Pages site with `build_type` set to `workflow`; if present, require its
build type to be `workflow`. Do not use branch-folder publishing.

- [ ] **Step 4: Wait for the deployment workflow**

Find the `Deploy GitHub Pages` run for the pushed commit and wait until it
reports `completed` with conclusion `success`. If it fails, inspect the failed
step, correct the source, rerun local verification, commit, and push again.

- [ ] **Step 5: Verify the public response and content**

Request `https://guiping02-byte.github.io/ui-guidelines/` and require HTTP 200.
Confirm the returned HTML contains the GitHub Pages asset base
`/ui-guidelines/assets/` and the page title `UI 设计规范看板`.

- [ ] **Step 6: Verify the rendered board in the browser**

Open the new URL and confirm the red and blue theme controls render, theme
switching works, a color edit survives a page reload through local storage, and
no assets return 404. The user-facing browser tab must finish on the new URL.

### Task 4: Permanently Delete the Former Sites Project

**Files:**
- External destructive target: Sites project `appgprj_6a84204cfce8819182be3c25c15e8a4c`
- Former URL: `https://blue-ui-board-lixujie.guiping02.chatgpt.site/`

**Interfaces:**
- Consumes: successful Task 3 deployment and browser verification.
- Produces: GitHub Pages as the only remaining public deployment.

- [ ] **Step 1: Recheck the cutover gate immediately before deletion**

Require all of the following in the same execution session:

```text
GitHub Pages workflow conclusion: success
GitHub Pages URL response: HTTP 200
Rendered board verification: passed
Target Sites project ID: appgprj_6a84204cfce8819182be3c25c15e8a4c
```

If any value differs, stop without deleting the Sites project.

- [ ] **Step 2: Permanently delete the exact Sites project**

Use the Sites hosting connector's project-deletion operation with exactly
`appgprj_6a84204cfce8819182be3c25c15e8a4c`. Do not delete by a computed slug or
URL and do not retry against another project ID.

- [ ] **Step 3: Verify removal and final public URL**

Confirm the deleted project is no longer returned as an active Sites project.
Request `https://guiping02-byte.github.io/ui-guidelines/` again and require HTTP
200. Report the GitHub Pages URL as the sole viewing link and state that the
former project was permanently deleted and cannot be restored.
