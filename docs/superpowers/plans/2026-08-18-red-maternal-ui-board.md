# Red Maternal UI Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing editable blue UI board into a legible, responsive red maternal mini-program design-system board and publish it as a private Sites link.

**Architecture:** Keep the existing single-route vinext application. `app/page.tsx` owns the palette model, local-browser persistence, token copying, and representative component markup; `app/globals.css` owns the responsive board presentation; `tests/rendered-html.test.mjs` verifies the built server output and source-level contracts that client state cannot expose in server HTML.

**Tech Stack:** React 19, TypeScript 5.9, vinext, Vite, CSS, Node test runner, OpenAI Sites.

**Spec:** `docs/superpowers/specs/2026-08-18-red-maternal-ui-board-design.md`

## Global Constraints

- Default colors are Brand Primary `#D62F36`, Price Red `#F04438`, Promo Red `#FF4D4F`, Member Dark Red `#8F1D22`, and Care Pink `#FF7A90`.
- Body text is at least 14px; supporting text is at least 12px; primary text uses `#1F2329`; secondary text uses `#646A73`.
- Do not add authentication, collaboration, cloud persistence, or additional routes.
- Store valid palette preferences only in browser local storage and fall back safely to defaults.
- Keep major mobile controls at least 44px tall and provide visible keyboard focus.

---

### Task 1: Replace obsolete starter tests with board contracts

**Files:**
- Modify: `tests/rendered-html.test.mjs`
- Test: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: built worker at `dist/server/index.js` and source files `app/page.tsx`, `app/layout.tsx`, `app/globals.css`
- Produces: regression checks for metadata, visible product copy, the five palette defaults, persistence key, copied CSS token names, responsive layout, and minimum readable type sizes

- [ ] **Step 1: Write failing tests for the red maternal board**

Replace the two starter-skeleton tests with three focused tests using the existing `render()` helper:

```js
test("server-renders the red maternal design board", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>红色母婴 UI 设计系统看板<\/title>/i);
  assert.match(html, /红色母婴设计系统看板/);
  assert.match(html, /直接修改色号，组件会实时更新/);
  assert.doesNotMatch(html, /蓝色设计系统看板|codex-preview|Building your site/i);
});

test("defines all editable maternal palette tokens", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const value of ["#D62F36", "#F04438", "#FF4D4F", "#8F1D22", "#FF7A90"]) {
    assert.match(page, new RegExp(value));
  }
  for (const token of ["--color-brand-primary", "--color-price", "--color-promo", "--color-member", "--color-care"]) {
    assert.match(page, new RegExp(token));
  }
  assert.match(page, /maternal-ui-palette/);
  assert.match(page, /localStorage\.getItem/);
  assert.match(page, /localStorage\.setItem/);
});

test("keeps the board readable and responsive", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /--text-primary:\s*#1f2329/i);
  assert.match(css, /--text-secondary:\s*#646a73/i);
  assert.match(css, /font-size:\s*14px/);
  assert.match(css, /font-size:\s*12px/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
  assert.match(css, /:focus-visible/);
});
```

- [ ] **Step 2: Run the tests to verify the new contract fails**

Run: `pnpm test`

Expected: FAIL because the current page title, blue defaults, token names, and copy do not satisfy the red maternal board contract.

- [ ] **Step 3: Commit the failing contract**

```bash
git add tests/rendered-html.test.mjs
git commit -m "test: define red maternal board contract"
```

---

### Task 2: Implement the editable maternal palette and component preview

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Test: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: the five default values and behavior defined in Task 1
- Produces: `Palette` with `brand`, `price`, `promo`, `member`, and `care`; `normalizeHex(value: string): string | null`; `mix(hex: string, target: string, amount: number): string`; and a single interactive `Home` page

- [ ] **Step 1: Replace the palette model and persistence key**

Use this exact state shape and defaults in `app/page.tsx`:

```ts
type Palette = {
  brand: string;
  price: string;
  promo: string;
  member: string;
  care: string;
};

const defaultPalette: Palette = {
  brand: "#D62F36",
  price: "#F04438",
  promo: "#FF4D4F",
  member: "#8F1D22",
  care: "#FF7A90",
};

const STORAGE_KEY = "maternal-ui-palette";
```

Validate all five saved values with `normalizeHex`; if any are missing or invalid, keep `defaultPalette`. Persist every valid state update under `STORAGE_KEY`.

- [ ] **Step 2: Wire semantic CSS variables and copied tokens**

Set these variables on the page shell:

```ts
const style = {
  "--brand": palette.brand,
  "--brand-soft": mix(palette.brand, "#FFFFFF", 0.88),
  "--brand-pale": mix(palette.brand, "#FFFFFF", 0.94),
  "--brand-deep": mix(palette.brand, "#000000", 0.22),
  "--price": palette.price,
  "--promo": palette.promo,
  "--member": palette.member,
  "--care": palette.care,
} as React.CSSProperties;
```

Copy exactly these current-value declarations:

```ts
[
  `--color-brand-primary: ${palette.brand};`,
  `--color-price: ${palette.price};`,
  `--color-promo: ${palette.promo};`,
  `--color-member: ${palette.member};`,
  `--color-care: ${palette.care};`,
].join("\n");
```

- [ ] **Step 3: Replace the visible board content**

Keep the two-column editor/preview structure. Use the title `红色母婴设计系统看板`, subtitle `直接修改色号，组件会实时更新`, editor labels `品牌主色`, `价格红`, `促销红`, `会员深红`, and `关怀粉红`, plus buttons `复制 CSS Tokens` and `恢复规范默认值`.

The preview must include:

- a ten-step brand color scale computed with `mix`;
- typography samples for 24/32, 20/28, 16/24, 14/22, and 12/20;
- default, hover/active-described, secondary, and disabled buttons;
- search input with default and focus styling;
- a maternal product card where price uses `--price`, promo uses `--promo`, and member benefit uses `--member`;
- a care reminder using `--care` on a pale care background;
- bottom navigation and status tags using success `#2BA471`, warning `#F5A524`, and danger `#D92D20` where semantically appropriate.

- [ ] **Step 4: Restyle for legibility and responsive use**

In `app/globals.css`, define:

```css
:root {
  --text-primary: #1f2329;
  --text-secondary: #646a73;
  --border: #e5e6eb;
  --background: #f7f8fa;
  --surface: #ffffff;
}
```

Use 14px/22px as the base content size, never go below 12px/20px for supporting copy, keep controls at 44px minimum height, add `button:focus-visible, input:focus-visible` outlines using `--brand`, and at `max-width: 760px` collapse the workspace and component grids to one column.

- [ ] **Step 5: Update page metadata**

Set `app/layout.tsx` metadata to:

```ts
export const metadata: Metadata = {
  title: "红色母婴 UI 设计系统看板",
  description: "可实时修改品牌、价格、促销、会员与关怀色号的母婴小程序 UI 设计系统看板。",
};
```

- [ ] **Step 6: Run tests and lint**

Run: `pnpm test`

Expected: PASS for all tests after a successful production build.

Run: `pnpm lint`

Expected: exit code 0 with no errors.

- [ ] **Step 7: Commit the implementation**

```bash
git add app/page.tsx app/globals.css app/layout.tsx
git commit -m "feat: build editable red maternal UI board"
```

---

### Task 3: Validate and publish the exact build

**Files:**
- Verify: `dist/server/index.js`
- Verify: `dist/.openai/hosting.json`
- Modify only if hosting returns a new value: `.openai/hosting.json`

**Interfaces:**
- Consumes: successful Task 2 build and existing Sites `project_id`
- Produces: a succeeded private Sites deployment URL for the exact validated source

- [ ] **Step 1: Confirm the repository is clean and the build is current**

Run: `git status --short`

Expected: no output.

Run: `pnpm build`

Expected: exit code 0 and both `dist/server/index.js` and `dist/.openai/hosting.json` present.

- [ ] **Step 2: Package and publish the validated build**

Use the Sites hosting workflow with the existing `project_id` from `.openai/hosting.json`: obtain a source write credential if the existing one is unavailable, push the current branch head, package the project with the Sites packaging helper, save one version, and deploy it privately.

Expected: the deployment status reaches `succeeded` and returns an HTTPS URL.

- [ ] **Step 3: Open and hand off the deployed link**

Open the successful deployed URL in the Codex Site tab and return it as the primary deliverable. State that the five color values can be changed directly and remain saved in the current browser.

