# Bumi Luhur Country Club — landing page

Static HTML + CSS built from the design export *Bumi Luhur Country Club.pdf* (1920px artboard).

## Files
- `index.html` — the page. The icon set is inlined as an SVG sprite at the top of `<body>` (one request, recolourable via `currentColor`).
- `main.js` — interactions (no dependencies): tabs, auto-rotating lifestyle tabs, club-experience carousel, video modal, FAQ accordion.
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
## Interactions (`main.js`)
- **Video (The Club at a Glance)** — the play button opens a YouTube player in a modal (Esc / backdrop / × to close, focus is trapped and restored).
  Change the video with `data-video-id="…"` on `.play` (currently a sample: `ctmrWgQ95uI`).
- **Category pills** — CSS hover: green background, icon/text/arrow turn white.
- **Every Part of Your Lifestyle** — `[data-autotabs]`: the four pillars rotate every `data-interval` ms (6000).
  The active tab's top line shows progress; it pauses while hovering the tabs/slider, for keyboard focus, and when off-screen.
  Each tab has its own 4-slice image set (`.strip__set`) that crossfades in with a stagger.
- **The Club Experience** — `[data-carousel]`: five category tabs, each with its own slides (`.carousel__panel`).
  Looping slider with prev/next, pagination dots, swipe and arrow keys; side cards are greyed "peek" cards like the design.
  The count badge shows the number of slides in the active tab.
- **FAQ** — four tabs, five questions each; one answer open at a time.
- All tabs follow the WAI-ARIA tabs pattern (arrow keys, Home/End). `prefers-reduced-motion` disables auto-rotation and animations.

## Photography
Photos in `assets/img/` come from the design. Facilities that had no photo in the design (Pilates, badminton, physiotherapy,
jacuzzi, salon, billiard, karaoke, game room, library, function room, playground, playroom, EV charging, hotel room)
use free photos from Unsplash (Unsplash License, not Unsplash+), hot-linked from `images.unsplash.com`.
For production, replace them with the club's own photography (or download and self-host them). Search the HTML for `images.unsplash.com`.
If a photo fails to load, the card/slice falls back to the brand green instead of a broken image.

## Content to confirm with the club
The FAQ answers and new facility descriptions are written from what the design says about the club. Confirm details such as
operating hours, guest and dress-code policies, the 24-hour cancellation rule and the booking windows before going live.
