# Design QA — 蓝色列表单选状态

## Comparison Target

- Source visual truth: `C:\Users\lixujie\AppData\Local\Temp\codex-clipboard-89d3979a-9200-486d-9ff8-69191bbc85c4.png`
- Browser-rendered implementation: `qa-implementation-blue-selection.png`
- Focused side-by-side comparison: `qa-comparison-blue-selection.png`
- State: 蓝色通用主题；海淀店选中，朝阳店未选中。
- Browser viewport: `1297 × 912 CSS px`，`devicePixelRatio: 1`。
- Source pixels: `383 × 257`；focused crop `343 × 88`，normalized to `390 × 100`。
- Implementation pixels: `1282 × 901`；focused crop `393 × 95`，normalized to `390 × 94`。

## Evidence

### Full-view comparison

`qa-implementation-blue-selection.png` shows the new full-width LIST SELECTION block inside the existing blue design board. The two option cards render side by side at desktop width and preserve the board's grid, spacing, and 8px radius system.

### Focused-region comparison

`qa-comparison-blue-selection.png` places the reference selected card on the left and the browser-rendered selected card on the right. A focused comparison was required because the radio control, border, background, typography, and information wrapping are too small to judge reliably from the full board.

## Required Fidelity Surfaces

- Fonts and typography: Chinese system sans-serif is consistent with the existing board. Store title uses 14px/22px bold text; account details use 12px/20px secondary text. Hierarchy and wrapping match the reference intent.
- Spacing and layout rhythm: selected rows use 14px padding, 12px control-to-copy spacing, 86px minimum height, 8px radius, and a two-column desktop/one-column mobile layout.
- Colors and visual tokens: selected border and native radio use `#2C89FF`; selected background uses `#F5FAFF`; unselected border uses `#E5E6EB`; title and detail colors use `#222222` and `#646464`.
- Image quality and asset fidelity: the reference contains no raster imagery or custom icon asset. The implementation uses a native radio control rather than a simulated CSS icon.
- Copy and content: realistic store names and account descriptions demonstrate the intended door/account/address/package selection use case.

## Findings

- No actionable P0, P1, or P2 mismatch remains.
- The initial narrow-column integration measured only 225px and caused excessive wrapping. It was replaced with a full-width example block containing two approximately 391px cards before the final capture.
- A temporary native focus outline appeared after interaction testing; focus was moved to another control and the base selected state was recaptured for the final comparison.

## Interaction And Accessibility Checks

- Clicking a different native radio changes the selected store and transfers the selected border/background state.
- Exactly one store remains selected in the radio group.
- The block is visible in the blue theme and hidden in the red theme.
- Browser console warnings/errors checked: none.

## Implementation Checklist

- [x] Selected and unselected list cards
- [x] Native accessible radio group
- [x] Blue-only visibility
- [x] Desktop and mobile layout rules
- [x] Browser interaction test
- [x] Focused visual comparison

## Comparison History

1. Live layout inspection found the first integration too narrow for realistic account copy (225px). The example was moved to a full-width board card with a two-column option grid.
2. Final browser capture measured each option at approximately `391 × 94 CSS px`; the selected state resolved to `#2C89FF` border, `#F5FAFF` background, and 8px radius.
3. Focused comparison confirmed the border, pale-blue surface, native radio indicator, title hierarchy, and two-line account copy are aligned with the reference pattern.

final result: passed
