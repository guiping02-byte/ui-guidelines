# Design QA — 红色商品卡片

## Comparison Target

- Source visual truth: `C:\Users\lixujie\AppData\Local\Temp\codex-clipboard-352ff9ca-85ab-4b50-9abf-e96935f33bc8.png`
- Browser-rendered implementation: `qa-red-product-card-viewport.png`
- Focused side-by-side comparison: `qa-product-card-comparison.png`
- Local route: `http://localhost:4174/ui-guidelines/?v=product-card`
- State: red theme, default product-card state, no card selected.
- Browser viewport screenshot: `1265 × 712 px`, device pixel ratio `1`.
- Source pixels: `384 × 273`.
- Focused implementation crop: `390 × 262`, normalized to `384 × 273` for comparison.

## Findings

- No actionable P0, P1, or P2 mismatch remains.
- The real branded package shown in the reference was intentionally replaced with the requested generic, unbranded product-package icon. This is a product requirement rather than fidelity drift.
- The implementation preserves the reference hierarchy: quiet image surface, one-line name, price emphasis, red pill CTA, 10px outer radius, and light elevation.

## Required Fidelity Surfaces

- Fonts and typography: product names use compact 13px body text; prices use 18px bold red numerals; CTA labels use 12px bold white text. The hierarchy and single-line truncation follow the reference.
- Spacing and layout rhythm: two cards sit in a 10px grid gap. Each card uses a 170px image area, compact 8px/12px content padding, 10px radius, and restrained shadow. Mobile keeps two equal columns with a slightly shorter image area.
- Colors and visual tokens: card surface is white on `#F7F7F7` imagery; price uses `var(--price)` and CTA uses editable `var(--brand)`. The blue theme hides this entire new guideline.
- Image quality and asset fidelity: both cards use the generated `generic-product-icon.png` raster asset. It is sharp at the rendered thumbnail size and contains no logo, text, or real-product cues.
- Copy and content: generic names “成长营养组合” and “亲子呵护组合” avoid brand/product claims while demonstrating realistic truncation, price, and action placement.

## Interaction And Accessibility Checks

- Clicking “去砍价” sets exactly one button to `aria-pressed="true"` and gives the selected card a visible brand-color outline.
- Switching to “蓝色通用” hides the new product-card guideline; switching back restores the red-theme component.
- Both generic product images load successfully at `512 × 512` natural pixels.
- Browser console warnings/errors checked: none.

## Comparison History

1. The first local capture exposed a missing image: Vite used `github-pages/public` because the Pages build root is `github-pages`, while the generated asset lived in the repository `public` directory.
2. The Pages configuration was corrected to use `publicDir: "../public"`; the asset then loaded as `image/png` with a successful response.
3. The final focused comparison confirms the two-card proportions, neutral image treatment, price/CTA alignment, 10px radius, and visual density match the reference pattern.

## Implementation Checklist

- [x] Red-only product-card guideline
- [x] Two compact product-card examples
- [x] Generic unbranded raster product icon
- [x] Editable red price and CTA tokens
- [x] Clickable selected state
- [x] 10px large radius token
- [x] Browser interaction and console verification
- [x] Focused source-to-implementation comparison

final result: passed
