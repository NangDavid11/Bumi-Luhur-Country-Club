# Bumi Luhur Country Club — landing page

Static HTML + CSS built from the design export *Bumi Luhur Country Club.pdf* (1920px artboard).

## Files
- `index.html` — the page. The icon set is inlined as an SVG sprite at the top of `<body>` (one request, recolourable via `currentColor`).
- `styles.css` — all styles. Design tokens (colours, fonts, radii) are CSS variables at the top.
- `assets/img/` — photos and partner logos, extracted from the design file.
- `assets/icons/` — the same icons as standalone SVGs (vector paths taken from the design). `check.svg` is used by the CSS directly.

## Fonts
- Headings: **Gelasio** (Google Fonts) — matches the design.
- Body / eyebrow text: **Montserrat** (Google Fonts) — matches the design.
- Buttons, nav, tabs, lists, footer: the design uses **Gilroy**, which is a commercial font and is not embedded in the export.
  The stack is `"Gilroy", "Figtree", …`: Figtree is loaded as the free stand-in. If you have a Gilroy web licence,
  add its `@font-face` rules (500/600/700) and it will be used automatically.

## Breakpoints
- ≥1400px: the 1:1 reference layout (content column 1336px).
- ≤1400px: headline line breaks become natural, the carousel scales.
- ≤1200px: nav links collapse, the cards go to 2 columns, the plans stack.
- ≤860px: single-column mobile layout, horizontally scrollable tabs/carousel.

## Notes
- Rounded corners use `corner-shape: squircle` where supported (Figma corner smoothing) with a normal `border-radius` fallback.
- Tabs and the FAQ accordion have a small vanilla-JS click handler at the end of `index.html`; the FAQ uses native `<details>`.
