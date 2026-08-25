# Public GitHub Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the current UI board source to a public GitHub repository and make its existing hosted URL publicly accessible.

**Architecture:** Keep the vinext application and current Sites deployment unchanged. Add project documentation locally, publish the tracked Git tree to `guiping02-byte/ui-guidelines` on `main`, and update the existing Sites access policy to `public`.

**Tech Stack:** Git, GitHub, vinext, pnpm, OpenAI Sites

**Spec:** `docs/superpowers/specs/2026-08-25-public-github-publishing-design.md`

## Global Constraints

- GitHub owner is exactly `guiping02-byte`.
- Public repository slug is exactly `ui-guidelines`.
- Public site URL remains `https://blue-ui-board-lixujie.guiping02.chatgpt.site/`.
- Do not alter the rendered UI board while publishing.

---

### Task 1: Project Documentation

**Files:**
- Modify: `README.md`
- Test: `README.md`

**Interfaces:**
- Consumes: the existing package scripts and hosted URL.
- Produces: public project documentation used as the GitHub repository landing page.

- [ ] **Step 1: Replace starter copy with project documentation**

  Document the board purpose, public URL, covered design tokens, prerequisites,
  and the exact `pnpm install`, `pnpm dev`, `pnpm test`, and `pnpm lint` commands.

- [ ] **Step 2: Verify documentation links and commands**

  Confirm that the public URL and command names match the approved design and
  `package.json`.

- [ ] **Step 3: Commit documentation**

  Run `git add README.md docs/superpowers` followed by
  `git commit -m "docs: prepare public GitHub release"`.

### Task 2: Local Release Verification

**Files:**
- Test: `tests/palette.test.ts`
- Test: `tests/rendered-html.test.mjs`
- Test: `tests/style-contract.test.mjs`

**Interfaces:**
- Consumes: the current application source and package scripts.
- Produces: verified source ready to publish.

- [ ] **Step 1: Run the full test suite**

  Run `pnpm test` and require a zero exit code.

- [ ] **Step 2: Run lint**

  Run `pnpm lint` and require a zero exit code.

- [ ] **Step 3: Confirm a clean worktree**

  Run `git status --short` and require no output after committing documentation.

### Task 3: Public GitHub Repository

**Files:**
- Publish: every path returned by `git ls-files`

**Interfaces:**
- Consumes: verified local Git history.
- Produces: `https://github.com/guiping02-byte/ui-guidelines` with default branch `main`.

- [ ] **Step 1: Confirm repository availability**

  Check whether `guiping02-byte/ui-guidelines` already exists before creating or
  uploading anything.

- [ ] **Step 2: Create the public repository**

  Create `ui-guidelines` under `guiping02-byte`, set it public, and initialize a
  `main` branch if the repository does not exist.

- [ ] **Step 3: Upload the tracked source**

  Publish the committed local source and history to `main` without including
  ignored build outputs, dependencies, or environment files.

- [ ] **Step 4: Verify repository visibility and content**

  Fetch the repository metadata and README from GitHub and confirm public
  visibility, the `main` branch, and the expected project title.

### Task 4: Public Website Access

**Files:**
- External configuration: Sites project `appgprj_6a84204cfce8819182be3c25c15e8a4c`

**Interfaces:**
- Consumes: the existing Sites project and deployed version.
- Produces: anonymous public access at the existing website URL.

- [ ] **Step 1: Set the Sites access mode to public**

  Update project `appgprj_6a84204cfce8819182be3c25c15e8a4c`
  with access mode `public`.

- [ ] **Step 2: Verify public access metadata**

  Fetch the project state and confirm its access mode is `public` and its URL is
  unchanged.

- [ ] **Step 3: Open the public site**

  Load `https://blue-ui-board-lixujie.guiping02.chatgpt.site/` and confirm the
  board renders successfully.

