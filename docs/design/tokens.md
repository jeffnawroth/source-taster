# Design tokens

This is the token spec decided in "Which design tokens does the design system define?" ([#193](https://github.com/jeffnawroth/source-taster/issues/193)), part of the map "Wayfinder: Brand and design system for Source Taster" ([#181](https://github.com/jeffnawroth/source-taster/issues/181)). It lives on the unmerged branch `design/193-tokens`. The design-system ADR at the end of the map picks it up, and implementation issues are sliced from it there.

**Sources:**
- The chosen identity "Glass" from "Which visual identity direction does Source Taster take?" ([#191](https://github.com/jeffnawroth/source-taster/issues/191)): `apps/web/prototype/identity/round4/c-revised/` on branch `prototype/191-identity` (commit 63d1909).
- The colour-system research ([#185](https://github.com/jeffnawroth/source-taster/issues/185)).
- The foundation decision ([#188](https://github.com/jeffnawroth/source-taster/issues/188)).

**Reproducible:** every colour value, sRGB fallback and contrast ratio below comes from [`tokens-check/`](tokens-check/). Run `npm install` in that folder once, then `node gen.mjs gate|tables|prims|tints`. Culori 4.0.2 is the only dependency. That folder is the seed for the production generator. It is not the production generator itself.

**Out of scope here:**
- where the token package lives and how it reaches `source-taster-service` ("How do the design tokens and components reach the private repository?", [#189](https://github.com/jeffnawroth/source-taster/issues/189))
- breakpoints and panel-versus-web density ("How are the web app and side panel structured?", [#194](https://github.com/jeffnawroth/source-taster/issues/194))
- component specs

## 1. Layers and naming

There are three layers:

1. **Primitives.** These are OKLCH stops grouped into hue families and named by lightness × 1000, for example `cobalt-500` = L 0.5. They are **not regular scales**: there is one stop per value in use (so `neutral-172`, `neutral-195` …), because Q15 keeps the prototype's values. Snapping them to a regular `50…950` ladder would change values and is a possible follow-up, not part of this spec. They are private: no Tailwind utility exists for them, and only the semantic layer reads them.
2. **Semantic roles.** Each role is defined once per mode (light and dark). Every role points at a primitive, with an alpha value where it needs one. Components use **only** these roles.
3. **Component tokens.** These exist only where a component needs values no role covers. For now there are two: `button-primary-from` and `button-primary-to`.

Rules:

- **Names are English.** Verdict roles follow the English glossary labels: `correct`, `deviations` (Exists, with deviations), `mixed` (Mixed citation), `doi-conflict`, `not-found`, `not-verifiable`.
- **Tailwind 4 wiring:**
  - Reset every default namespace that has a replacement (`--color-*: initial`, `--font-*: initial`, `--text-*: initial`, `--radius-*: initial`, `--shadow-*: initial`, `--ease-*: initial`) so that `bg-blue-500` and the like do not exist.
  - Expose the roles through `@theme inline { --color-surface: var(--st-surface); … }`. Components then write `bg-surface`, `text-text-muted`, `border-border-strong` and `fill-verdict-not-found-mark`. The stutter in `text-text-*` is the accepted cost of keeping one name per role across CSS, the generated constants and the docs.
- **CSS variables:**
  - Roles are `--st-<role>`, and primitives are `--st-prim-<family>-<step>`.
  - Light is the default on `:root`.
  - Dark applies under `@media (prefers-color-scheme: dark) { :root:not([data-theme=light]) }` and under `:root[data-theme=dark]`. This is the Theme preference from ADR-0023, with System as the default.
  - Each mode block also sets `color-scheme`.
  - Components never use `dark:` utilities.
- **Tints are computed at build time**, never with `color-mix` inside components (see 2.4).
- **Source and outputs:** one TypeScript module is the source. A small generator emits:
  - the Tailwind `theme.css` (primitives, mode blocks and `@theme inline`);
  - resolved sRGB constants (hex) for email HTML and the PDF;
  - a failing check whenever a gated pair (section 7) drops below its threshold or a value falls outside sRGB.

  Culori 4 is the only dependency. Style Dictionary is not used. colorjs.io (0.7.1) is pre-1.0, so the ADR-0002 maturity rule excludes it.

## 2. Colour

### 2.1 Gamut

For now every token must lie inside **sRGB**. Where a prototype value fell outside, the generator keeps L and H and bisects to the largest chroma that is still displayable. Contrast is measured on exactly those values. The changed values are listed in 2.6. Display-P3 can come later as a progressive enhancement.

The visible effect is mainly the **dark cobalt**: `accent` goes from chroma 0.13 to 0.116, and `accent-text`/`focus-ring` from 0.12 to 0.10. If dark cobalt reads too pale in the build, P3 is the route back, not a hue shift.

### 2.2 Primitives

| Primitive | Value | sRGB |
|---|---|---|
| `amber-500` | `oklch(0.5 0.11 62)` | `#8f520d` |
| `amber-600` | `oklch(0.6 0.13 68)` | `#b26f06` |
| `amber-830` | `oklch(0.83 0.15 85)` | `#f4bf3f` |
| `amber-840` | `oklch(0.84 0.13 80)` | `#f7c15f` |
| `cobalt-320` | `oklch(0.32 0.06 265)` | `#243251` |
| `cobalt-360` | `oklch(0.36 0.15 266)` | `#18328a` |
| `cobalt-420` | `oklch(0.42 0.17 266)` | `#2141a8` |
| `cobalt-460` | `oklch(0.46 0.2 266)` | `#2347c5` |
| `cobalt-470` | `oklch(0.47 0.2 265)` | `#214bc9` |
| `cobalt-470-a` | `oklch(0.47 0.2 266)` | `#264ac9` |
| `cobalt-500` | `oklch(0.5 0.2 264)` | `#2456d3` |
| `cobalt-550` | `oklch(0.55 0.2 264)` | `#3266e4` |
| `cobalt-550-a` | `oklch(0.55 0.19 264)` | `#3567de` |
| `cobalt-550-b` | `oklch(0.55 0.2 263)` | `#2d67e4` |
| `cobalt-720` | `oklch(0.72 0.144 264)` | `#76a2fe` |
| `cobalt-770` | `oklch(0.77 0.116 262)` | `#8bb4fe` |
| `cobalt-800` | `oklch(0.8 0.1 262)` | `#9bbeff` |
| `cobalt-830` | `oklch(0.83 0.085 258)` | `#a5c9ff` |
| `cobalt-925` | `oklch(0.925 0.037 252)` | `#d5e8ff` |
| `cobalt-930` | `oklch(0.93 0.034 255)` | `#d9eaff` |
| `green-480` | `oklch(0.48 0.12 152)` | `#10703a` |
| `green-560` | `oklch(0.56 0.147 152)` | `#018c46` |
| `green-800` | `oklch(0.8 0.17 152)` | `#56dc85` |
| `green-800-a` | `oklch(0.8 0.15 152)` | `#69d98d` |
| `neutral-0` | `oklch(0 0 0)` | `#000000` |
| `neutral-50` | `oklch(0.05 0.01 265)` | `#000001` |
| `neutral-100` | `oklch(0.1 0.01 265)` | `#020306` |
| `neutral-150` | `oklch(0.15 0.017 266)` | `#080b12` |
| `neutral-160` | `oklch(0.16 0.02 265)` | `#090d16` |
| `neutral-170` | `oklch(0.17 0.04 265)` | `#070e21` |
| `neutral-172` | `oklch(0.172 0.017 266)` | `#0c1017` |
| `neutral-190` | `oklch(0.19 0.035 266)` | `#0c1323` |
| `neutral-195` | `oklch(0.195 0.019 266)` | `#11151e` |
| `neutral-200` | `oklch(0.2 0.035 265)` | `#0e1626` |
| `neutral-200-a` | `oklch(0.2 0.022 266)` | `#111620` |
| `neutral-205` | `oklch(0.205 0.022 266)` | `#121721` |
| `neutral-220` | `oklch(0.22 0.025 266)` | `#151a26` |
| `neutral-280` | `oklch(0.28 0.05 265)` | `#1d2842` |
| `neutral-300` | `oklch(0.3 0.03 265)` | `#262e3d` |
| `neutral-300-a` | `oklch(0.3 0.05 265)` | `#212d47` |
| `neutral-370` | `oklch(0.37 0.035 265)` | `#374053` |
| `neutral-380` | `oklch(0.38 0.05 265)` | `#35425d` |
| `neutral-400` | `oklch(0.4 0.03 265)` | `#404858` |
| `neutral-420` | `oklch(0.42 0.033 265)` | `#444d60` |
| `neutral-470` | `oklch(0.47 0.03 265)` | `#535b6c` |
| `neutral-520` | `oklch(0.52 0.025 265)` | `#626978` |
| `neutral-710` | `oklch(0.71 0.016 265)` | `#9da2ac` |
| `neutral-720` | `oklch(0.72 0.02 265)` | `#9ea5b2` |
| `neutral-780` | `oklch(0.78 0.012 265)` | `#b4b7bf` |
| `neutral-830` | `oklch(0.83 0.012 265)` | `#c3c7cf` |
| `neutral-880` | `oklch(0.88 0.01 265)` | `#d4d7de` |
| `neutral-925` | `oklch(0.925 0.012 265)` | `#e2e6ef` |
| `neutral-966` | `oklch(0.966 0.01 262)` | `#f0f4fb` |
| `neutral-970` | `oklch(0.97 0.004 265)` | `#f4f5f8` |
| `neutral-978` | `oklch(0.978 0.007 262)` | `#f5f8fd` |
| `neutral-1000` | `oklch(1 0 0)` | `#ffffff` |
| `red-470` | `oklch(0.47 0.188 18)` | `#ab0130` |
| `red-500` | `oklch(0.5 0.19 27)` | `#b7191c` |
| `red-540` | `oklch(0.54 0.21 28)` | `#cd1819` |
| `red-700` | `oklch(0.7 0.191 20)` | `#ff626b` |
| `red-720` | `oklch(0.72 0.174 28)` | `#ff7264` |
| `red-750` | `oklch(0.75 0.15 25)` | `#ff847d` |
| `rose-540` | `oklch(0.54 0.2 5)` | `#c41f5f` |
| `rose-740` | `oklch(0.74 0.167 5)` | `#ff789d` |
| `sky-400` | `oklch(0.4 0.072 220)` | `#025062` |
| `sky-460` | `oklch(0.46 0.083 220)` | `#036278` |
| `sky-500` | `oklch(0.5 0.091 220)` | `#006f87` |
| `sky-800` | `oklch(0.8 0.114 238)` | `#72c8fe` |
| `sky-840` | `oklch(0.84 0.09 238)` | `#92d4ff` |
| `sky-860` | `oklch(0.86 0.1 212)` | `#7ce3f7` |
| `sky-900` | `oklch(0.9 0.08 212)` | `#9eedfd` |
| `violet-400` | `oklch(0.4 0.15 300)` | `#562c8b` |
| `violet-420` | `oklch(0.42 0.17 300)` | `#5e2b9a` |
| `violet-440` | `oklch(0.44 0.15 300)` | `#613897` |
| `violet-820` | `oklch(0.82 0.098 292)` | `#c5b9ff` |
| `violet-860` | `oklch(0.86 0.075 292)` | `#d1c9ff` |

### 2.3 Usage rules

**Surfaces and text**

- `canvas` is the area outside the app frame. `bg` is the page, `surface` is opaque cards and controls, and `surface-sunken` is wells, segmented controls and kbd.
- `text`, `text-secondary` and `text-muted` are for opaque surfaces.
- **On glass only `text` and `text-on-glass-secondary` are allowed.** `text-muted` fails on glass in both modes, and dark `text-secondary` passes only by 0.01 (see 7.2). The dedicated role keeps the light fields as chosen, instead of muting the glass.

**Accent**

- `accent` is for fills and selected states, `accent-text` for links and accent text, and `on-accent` for text on accent fills.
- `accent-tint` is selected and hover washes, and `accent-glow` is the soft shadow under accent buttons.
- `focus-ring` is for focus only.

**Verdicts**

- `verdict-*-mark` colours glyphs, chart segments and verdict borders only. **It is never a text colour.** Each verdict is always glyph + label, never colour alone.
- `on-verdict-mark` is the inner symbol on a filled glyph.
- Greyscale distinctness rests on the six glyph shapes plus labels, not on a lightness ladder. This amends the colour-system decision from [#185](https://github.com/jeffnawroth/source-taster/issues/185), as agreed in [#193](https://github.com/jeffnawroth/source-taster/issues/193) Q3. The gate checks it with a glyph test instead of ΔL (section 7).

**Status** (running, cancelled, technical error, unchecked)

- A Status never uses a verdict colour or a verdict glyph.
- "Running" is `accent` with a pulse.
- Every other Status uses `text-muted` with a Lucide icon and a dashed `border-emphasis` contour instead of a filled glyph. A technical error gets a warning triangle plus text, never red.
- This keeps a technical error from reading as "Not found" and "Cancelled" from reading as "Not verifiable".

**Feedback**

- `feedback-danger`, `feedback-warning`, `feedback-success` and `feedback-info` are for form errors, destructive actions, the quota warning and toasts.
- They are text-capable (4.5:1 on `surface` and on their own `-tint`), always come with a Lucide icon and text, and never appear inside a results list.
- They are new values, since the prototype had none.

**Tracked-change correction**

- Deletions are a neutral strike: `correction-delete-text`, `-line` and `-bg`.
- Insertions are a cobalt wash plus a 2 px underline: `correction-insert-bg` and `-line`, with `text` on top. Never green.

**Charts**

- `chart-track` is the empty ring track. Segments use `verdict-*-mark`.

### 2.4 Role → primitive, per mode

Each role points at a primitive. The alpha follows the slash.

| Role | Light | Dark |
|---|---|---|
| `canvas` | `neutral-925` | `neutral-100` |
| `bg` | `neutral-978` | `neutral-150` |
| `bg-glow` | `cobalt-925 / 0.85` | `cobalt-360 / 0.5` |
| `surface` | `neutral-1000` | `neutral-195` |
| `surface-sunken` | `neutral-966` | `neutral-172` |
| `border` | `neutral-280 / 0.11` | `neutral-1000 / 0.085` |
| `border-strong` | `neutral-280 / 0.19` | `neutral-1000 / 0.14` |
| `border-emphasis` | `neutral-380 / 0.62` | `neutral-1000 / 0.42` |
| `text` | `neutral-200` | `neutral-970` |
| `text-secondary` | `neutral-370` | `neutral-830` |
| `text-muted` | `neutral-470` | `neutral-710` |
| `text-on-glass-secondary` | `neutral-420` | `neutral-880` |
| `accent` | `cobalt-500` | `cobalt-770` |
| `accent-text` | `cobalt-470` | `cobalt-800` |
| `on-accent` | `neutral-1000` | `neutral-170` |
| `accent-tint` | `cobalt-500 / 0.08` | `cobalt-770 / 0.11` |
| `accent-glow` | `cobalt-550 / 0.26` | `cobalt-770 / 0.32` |
| `focus-ring` | `cobalt-500` | `cobalt-800` |
| `verdict-correct-mark` | `green-560` | `green-800` |
| `verdict-deviations-mark` | `amber-600` | `amber-830` |
| `verdict-mixed-mark` | `rose-540` | `rose-740` |
| `verdict-doi-conflict-mark` | `red-540` | `red-720` |
| `verdict-not-found-mark` | `red-470` | `red-700` |
| `verdict-not-verifiable-mark` | `neutral-520` | `neutral-720` |
| `on-verdict-mark` | `neutral-1000` | `neutral-160` |
| `feedback-danger` | `red-500` | `red-750` |
| `feedback-warning` | `amber-500` | `amber-840` |
| `feedback-success` | `green-480` | `green-800-a` |
| `feedback-info` | `cobalt-470` | `cobalt-800` |
| `correction-delete-text` | `neutral-400` | `neutral-780` |
| `correction-delete-line` | `neutral-400 / 0.9` | `neutral-780 / 0.85` |
| `correction-delete-bg` | `neutral-300 / 0.06` | `neutral-1000 / 0.05` |
| `correction-insert-bg` | `cobalt-550-a / 0.13` | `cobalt-720 / 0.2` |
| `correction-insert-line` | `cobalt-500` | `cobalt-800` |
| `chart-track` | `neutral-1000 / 0.55` | `neutral-1000 / 0.08` |
| `glass-base` | `neutral-1000 / 0.56` | `neutral-220 / 0.62` |
| `glass-base-overlay` | `neutral-1000 / 0.64` | `neutral-200-a / 0.84` |
| `glass-base-strong` | `neutral-1000 / 0.82` | `neutral-205 / 0.88` |
| `glass-border` | `cobalt-320 / 0.14` | `neutral-0 / 0.6` |
| `glass-rim-1` | `neutral-1000 / 0.98` | `neutral-1000 / 0.36` |
| `glass-rim-2` | `neutral-1000 / 0.1` | `neutral-1000 / 0.04` |
| `glass-rim-3` | `neutral-1000 / 0.75` | `cobalt-800 / 0.3` |
| `glass-sheen` | `neutral-1000 / 0.42` | `neutral-1000 / 0.08` |
| `glass-pointer-light` | `neutral-1000 / 0.3` | `neutral-1000 / 0.06` |
| `glass-field-1` | `sky-840 / 0.85` | `cobalt-420 / 0.6` |
| `glass-field-2` | `violet-860 / 0.75` | `violet-440 / 0.5` |
| `glass-field-3` | `sky-900 / 0.8` | `sky-460 / 0.5` |
| `hero-base` | `cobalt-930` | `neutral-190` |
| `hero-field-1` | `sky-800 / 0.95` | `cobalt-460 / 0.95` |
| `hero-field-2` | `violet-820 / 0.9` | `violet-420 / 0.8` |
| `hero-field-3` | `sky-860 / 0.9` | `sky-500 / 0.65` |
| `scrim` | `neutral-300-a / 0.2` | `neutral-50 / 0.55` |
| `button-primary-from` | `cobalt-550-b` | `cobalt-830` |
| `button-primary-to` | `cobalt-470-a` | `cobalt-720` |
| `bg-glow-2` | – | `sky-400 / 0.14` |
| `bg-glow-3` | – | `violet-400 / 0.1` |
| `bg-grain` | – | `neutral-1000 / 0.07` |

### 2.5 Computed tints

Tints are computed at build time as `color-mix(in oklch, <mark or feedback colour> p%, surface)`, with the surface's powerless hue taking the mark's hue:

| Step | Mix | Use |
|---|---|---|
| `-tint` | 10 % | chips, rows, feedback banners |
| `-tint-strong` | 15 % | summary tiles, detail header |
| `-border` | 28 % | hairline around a tinted element |

They replace the prototype's runtime mixes at 7, 10, 13, 15, 26, 28 and 36 %.

| Token | Light | Light sRGB | Dark | Dark sRGB |
|---|---|---|---|---|
| `verdict-correct-tint` | `oklch(0.956 0.014 152)` | `#eaf3ec` | `oklch(0.256 0.034 152)` | `#16281b` |
| `verdict-correct-tint-strong` | `oklch(0.934 0.022 152)` | `#dfeee2` | `oklch(0.286 0.041 152)` | `#1a3020` |
| `verdict-correct-border` | `oklch(0.877 0.041 152)` | `#c3dfc9` | `oklch(0.364 0.061 152)` | `#23472e` |
| `verdict-deviations-tint` | `oklch(0.96 0.013 68)` | `#f8f0e9` | `oklch(0.259 0.032 85)` | `#2b2311` |
| `verdict-deviations-tint-strong` | `oklch(0.94 0.019 68)` | `#f4e9de` | `oklch(0.29 0.038 85)` | `#342a14` |
| `verdict-deviations-border` | `oklch(0.888 0.036 68)` | `#ebd6c1` | `oklch(0.373 0.055 85)` | `#4e3e1c` |
| `verdict-mixed-tint` | `oklch(0.954 0.02 5)` | `#fdebee` | `oklch(0.25 0.033 5)` | `#2f1b1f` |
| `verdict-mixed-tint-strong` | `oklch(0.931 0.03 5)` | `#fbe0e5` | `oklch(0.277 0.041 5)` | `#391f25` |
| `verdict-mixed-border` | `oklch(0.871 0.056 5)` | `#f6c6cf` | `oklch(0.348 0.06 5)` | `#542c36` |
| `verdict-doi-conflict-tint` | `oklch(0.954 0.021 28)` | `#feebe8` | `oklch(0.248 0.034 28)` | `#301b18` |
| `verdict-doi-conflict-tint-strong` | `oklch(0.931 0.031 28)` | `#fce1dd` | `oklch(0.274 0.042 28)` | `#3a1f1c` |
| `verdict-doi-conflict-border` | `oklch(0.871 0.058 28)` | `#f9c7c0` | `oklch(0.342 0.062 28)` | `#542b26` |
| `verdict-not-found-tint` | `oklch(0.947 0.018 18)` | `#f9e9e9` | `oklch(0.246 0.036 20)` | `#301919` |
| `verdict-not-found-tint-strong` | `oklch(0.921 0.028 18)` | `#f7dede` | `oklch(0.271 0.044 20)` | `#391d1e` |
| `verdict-not-found-border` | `oklch(0.852 0.052 18)` | `#efc1c2` | `oklch(0.336 0.067 20)` | `#542728` |
| `verdict-not-verifiable-tint` | `oklch(0.952 0.002 265)` | `#eeeff0` | `oklch(0.248 0.019 265)` | `#1d212a` |
| `verdict-not-verifiable-tint-strong` | `oklch(0.928 0.003 265)` | `#e6e7e9` | `oklch(0.274 0.019 265)` | `#232731` |
| `verdict-not-verifiable-border` | `oklch(0.866 0.007 265)` | `#d1d3d8` | `oklch(0.342 0.019 265)` | `#343843` |
| `feedback-danger-tint` | `oklch(0.95 0.019 27)` | `#fbeae8` | `oklch(0.251 0.032 25)` | `#301c1a` |
| `feedback-warning-tint` | `oklch(0.95 0.011 62)` | `#f4ede7` | `oklch(0.26 0.03 80)` | `#2c2213` |
| `feedback-success-tint` | `oklch(0.948 0.012 152)` | `#e8f0ea` | `oklch(0.256 0.032 152)` | `#17281b` |
| `feedback-info-tint` | `oklch(0.947 0.02 265)` | `#e7eefb` | `oklch(0.256 0.027 262)` | `#1c2330` |
| `__glass` | `oklch(undefined undefined NaN)` | `#000000` | `oklch(undefined undefined NaN)` | `#000000` |

### 2.6 All resolved values (OKLCH and sRGB)

The sRGB column is what the email and PDF constants get. Translucent values carry their alpha as the last hex pair. Many mail clients do not render 8-digit hex, so email and PDF must use translucent roles only **pre-composited onto a named backdrop** (see section 9). Values marked ¹ were reduced in chroma to fit sRGB.

| Role | Light | Light sRGB | Dark | Dark sRGB |
|---|---|---|---|---|
| `canvas` | `oklch(0.925 0.012 265)` | `#e2e6ef` | `oklch(0.1 0.01 265)` | `#020306` |
| `bg` | `oklch(0.978 0.007 262)` | `#f5f8fd` | `oklch(0.15 0.017 266)` | `#080b12` |
| `bg-glow` | `oklch(0.925 0.037 252 / 0.85)` ¹ | `#d5e8ffd9` | `oklch(0.36 0.15 266 / 0.5)` | `#18328a80` |
| `surface` | `oklch(1 0 0)` | `#ffffff` | `oklch(0.195 0.019 266)` | `#11151e` |
| `surface-sunken` | `oklch(0.966 0.01 262)` | `#f0f4fb` | `oklch(0.172 0.017 266)` | `#0c1017` |
| `border` | `oklch(0.28 0.05 265 / 0.11)` | `#1d28421c` | `oklch(1 0 0 / 0.085)` | `#ffffff16` |
| `border-strong` | `oklch(0.28 0.05 265 / 0.19)` | `#1d284230` | `oklch(1 0 0 / 0.14)` | `#ffffff24` |
| `border-emphasis` | `oklch(0.38 0.05 265 / 0.62)` | `#35425d9e` | `oklch(1 0 0 / 0.42)` | `#ffffff6b` |
| `text` | `oklch(0.2 0.035 265)` | `#0e1626` | `oklch(0.97 0.004 265)` | `#f4f5f8` |
| `text-secondary` | `oklch(0.37 0.035 265)` | `#374053` | `oklch(0.83 0.012 265)` | `#c3c7cf` |
| `text-muted` | `oklch(0.47 0.03 265)` | `#535b6c` | `oklch(0.71 0.016 265)` | `#9da2ac` |
| `text-on-glass-secondary` | `oklch(0.42 0.033 265)` | `#444d60` | `oklch(0.88 0.01 265)` | `#d4d7de` |
| `accent` | `oklch(0.5 0.2 264)` | `#2456d3` | `oklch(0.77 0.116 262)` ¹ | `#8bb4fe` |
| `accent-text` | `oklch(0.47 0.2 265)` | `#214bc9` | `oklch(0.8 0.1 262)` ¹ | `#9bbeff` |
| `on-accent` | `oklch(1 0 0)` | `#ffffff` | `oklch(0.17 0.04 265)` | `#070e21` |
| `accent-tint` | `oklch(0.5 0.2 264 / 0.08)` | `#2456d314` | `oklch(0.77 0.116 262 / 0.11)` ¹ | `#8bb4fe1c` |
| `accent-glow` | `oklch(0.55 0.2 264 / 0.26)` | `#3266e442` | `oklch(0.77 0.116 262 / 0.32)` ¹ | `#8bb4fe52` |
| `focus-ring` | `oklch(0.5 0.2 264)` | `#2456d3` | `oklch(0.8 0.1 262)` ¹ | `#9bbeff` |
| `verdict-correct-mark` | `oklch(0.56 0.147 152)` ¹ | `#018c46` | `oklch(0.8 0.17 152)` | `#56dc85` |
| `verdict-deviations-mark` | `oklch(0.6 0.13 68)` | `#b26f06` | `oklch(0.83 0.15 85)` | `#f4bf3f` |
| `verdict-mixed-mark` | `oklch(0.54 0.2 5)` | `#c41f5f` | `oklch(0.74 0.167 5)` ¹ | `#ff789d` |
| `verdict-doi-conflict-mark` | `oklch(0.54 0.21 28)` | `#cd1819` | `oklch(0.72 0.174 28)` ¹ | `#ff7264` |
| `verdict-not-found-mark` | `oklch(0.47 0.188 18)` ¹ | `#ab0130` | `oklch(0.7 0.191 20)` ¹ | `#ff626b` |
| `verdict-not-verifiable-mark` | `oklch(0.52 0.025 265)` | `#626978` | `oklch(0.72 0.02 265)` | `#9ea5b2` |
| `on-verdict-mark` | `oklch(1 0 0)` | `#ffffff` | `oklch(0.16 0.02 265)` | `#090d16` |
| `feedback-danger` | `oklch(0.5 0.19 27)` | `#b7191c` | `oklch(0.75 0.15 25)` | `#ff847d` |
| `feedback-warning` | `oklch(0.5 0.11 62)` | `#8f520d` | `oklch(0.84 0.13 80)` | `#f7c15f` |
| `feedback-success` | `oklch(0.48 0.12 152)` | `#10703a` | `oklch(0.8 0.15 152)` | `#69d98d` |
| `feedback-info` | `oklch(0.47 0.2 265)` | `#214bc9` | `oklch(0.8 0.1 262)` ¹ | `#9bbeff` |
| `correction-delete-text` | `oklch(0.4 0.03 265)` | `#404858` | `oklch(0.78 0.012 265)` | `#b4b7bf` |
| `correction-delete-line` | `oklch(0.4 0.03 265 / 0.9)` | `#404858e6` | `oklch(0.78 0.012 265 / 0.85)` | `#b4b7bfd9` |
| `correction-delete-bg` | `oklch(0.3 0.03 265 / 0.06)` | `#262e3d0f` | `oklch(1 0 0 / 0.05)` | `#ffffff0d` |
| `correction-insert-bg` | `oklch(0.55 0.19 264 / 0.13)` | `#3567de21` | `oklch(0.72 0.144 264 / 0.2)` ¹ | `#76a2fe33` |
| `correction-insert-line` | `oklch(0.5 0.2 264)` | `#2456d3` | `oklch(0.8 0.1 262)` ¹ | `#9bbeff` |
| `chart-track` | `oklch(1 0 0 / 0.55)` | `#ffffff8c` | `oklch(1 0 0 / 0.08)` | `#ffffff14` |
| `glass-base` | `oklch(1 0 0 / 0.56)` | `#ffffff8f` | `oklch(0.22 0.025 266 / 0.62)` | `#151a269e` |
| `glass-base-overlay` | `oklch(1 0 0 / 0.64)` | `#ffffffa3` | `oklch(0.2 0.022 266 / 0.84)` | `#111620d6` |
| `glass-base-strong` | `oklch(1 0 0 / 0.82)` | `#ffffffd1` | `oklch(0.205 0.022 266 / 0.88)` | `#121721e0` |
| `glass-border` | `oklch(0.32 0.06 265 / 0.14)` | `#24325124` | `oklch(0 0 0 / 0.6)` | `#00000099` |
| `glass-rim-1` | `oklch(1 0 0 / 0.98)` | `#fffffffa` | `oklch(1 0 0 / 0.36)` | `#ffffff5c` |
| `glass-rim-2` | `oklch(1 0 0 / 0.1)` | `#ffffff1a` | `oklch(1 0 0 / 0.04)` | `#ffffff0a` |
| `glass-rim-3` | `oklch(1 0 0 / 0.75)` | `#ffffffbf` | `oklch(0.8 0.1 262 / 0.3)` | `#9bbeff4d` |
| `glass-sheen` | `oklch(1 0 0 / 0.42)` | `#ffffff6b` | `oklch(1 0 0 / 0.08)` | `#ffffff14` |
| `glass-pointer-light` | `oklch(1 0 0 / 0.3)` | `#ffffff4d` | `oklch(1 0 0 / 0.06)` | `#ffffff0f` |
| `glass-field-1` | `oklch(0.84 0.09 238 / 0.85)` ¹ | `#92d4ffd9` | `oklch(0.42 0.17 266 / 0.6)` | `#2141a899` |
| `glass-field-2` | `oklch(0.86 0.075 292 / 0.75)` ¹ | `#d1c9ffbf` | `oklch(0.44 0.15 300 / 0.5)` | `#61389780` |
| `glass-field-3` | `oklch(0.9 0.08 212 / 0.8)` | `#9eedfdcc` | `oklch(0.46 0.083 220 / 0.5)` ¹ | `#03627880` |
| `hero-base` | `oklch(0.93 0.034 255)` ¹ | `#d9eaff` | `oklch(0.19 0.035 266)` | `#0c1323` |
| `hero-field-1` | `oklch(0.8 0.114 238 / 0.95)` ¹ | `#72c8fef2` | `oklch(0.46 0.2 266 / 0.95)` | `#2347c5f2` |
| `hero-field-2` | `oklch(0.82 0.098 292 / 0.9)` ¹ | `#c5b9ffe6` | `oklch(0.42 0.17 300 / 0.8)` | `#5e2b9acc` |
| `hero-field-3` | `oklch(0.86 0.1 212 / 0.9)` | `#7ce3f7e6` | `oklch(0.5 0.091 220 / 0.65)` ¹ | `#006f87a6` |
| `scrim` | `oklch(0.3 0.05 265 / 0.2)` | `#212d4733` | `oklch(0.05 0.01 265 / 0.55)` | `#0000018c` |
| `button-primary-from` | `oklch(0.55 0.2 263)` | `#2d67e4` | `oklch(0.83 0.085 258)` ¹ | `#a5c9ff` |
| `button-primary-to` | `oklch(0.47 0.2 266)` | `#264ac9` | `oklch(0.72 0.144 264)` ¹ | `#76a2fe` |
| `verdict-correct-tint` | `oklch(0.956 0.014 152)` | `#eaf3ec` | `oklch(0.256 0.034 152)` | `#16281b` |
| `verdict-correct-tint-strong` | `oklch(0.934 0.022 152)` | `#dfeee2` | `oklch(0.286 0.041 152)` | `#1a3020` |
| `verdict-correct-border` | `oklch(0.877 0.041 152)` | `#c3dfc9` | `oklch(0.364 0.061 152)` | `#23472e` |
| `verdict-deviations-tint` | `oklch(0.96 0.013 68)` | `#f8f0e9` | `oklch(0.259 0.032 85)` | `#2b2311` |
| `verdict-deviations-tint-strong` | `oklch(0.94 0.019 68)` | `#f4e9de` | `oklch(0.29 0.038 85)` | `#342a14` |
| `verdict-deviations-border` | `oklch(0.888 0.036 68)` | `#ebd6c1` | `oklch(0.373 0.055 85)` | `#4e3e1c` |
| `verdict-mixed-tint` | `oklch(0.954 0.02 5)` | `#fdebee` | `oklch(0.25 0.033 5)` | `#2f1b1f` |
| `verdict-mixed-tint-strong` | `oklch(0.931 0.03 5)` | `#fbe0e5` | `oklch(0.277 0.041 5)` | `#391f25` |
| `verdict-mixed-border` | `oklch(0.871 0.056 5)` | `#f6c6cf` | `oklch(0.348 0.06 5)` | `#542c36` |
| `verdict-doi-conflict-tint` | `oklch(0.954 0.021 28)` | `#feebe8` | `oklch(0.248 0.034 28)` | `#301b18` |
| `verdict-doi-conflict-tint-strong` | `oklch(0.931 0.031 28)` | `#fce1dd` | `oklch(0.274 0.042 28)` | `#3a1f1c` |
| `verdict-doi-conflict-border` | `oklch(0.871 0.058 28)` | `#f9c7c0` | `oklch(0.342 0.062 28)` | `#542b26` |
| `verdict-not-found-tint` | `oklch(0.947 0.018 18)` | `#f9e9e9` | `oklch(0.246 0.036 20)` | `#301919` |
| `verdict-not-found-tint-strong` | `oklch(0.921 0.028 18)` | `#f7dede` | `oklch(0.271 0.044 20)` | `#391d1e` |
| `verdict-not-found-border` | `oklch(0.852 0.052 18)` | `#efc1c2` | `oklch(0.336 0.067 20)` | `#542728` |
| `verdict-not-verifiable-tint` | `oklch(0.952 0.002 265)` | `#eeeff0` | `oklch(0.248 0.019 265)` | `#1d212a` |
| `verdict-not-verifiable-tint-strong` | `oklch(0.928 0.003 265)` | `#e6e7e9` | `oklch(0.274 0.019 265)` | `#232731` |
| `verdict-not-verifiable-border` | `oklch(0.866 0.007 265)` | `#d1d3d8` | `oklch(0.342 0.019 265)` | `#343843` |
| `feedback-danger-tint` | `oklch(0.95 0.019 27)` | `#fbeae8` | `oklch(0.251 0.032 25)` | `#301c1a` |
| `feedback-warning-tint` | `oklch(0.95 0.011 62)` | `#f4ede7` | `oklch(0.26 0.03 80)` | `#2c2213` |
| `feedback-success-tint` | `oklch(0.948 0.012 152)` | `#e8f0ea` | `oklch(0.256 0.032 152)` | `#17281b` |
| `feedback-info-tint` | `oklch(0.947 0.02 265)` | `#e7eefb` | `oklch(0.256 0.027 262)` | `#1c2330` |
| `__glass` | `oklch(undefined undefined NaN)` | `#000000` | `oklch(undefined undefined NaN)` | `#000000` |
| `bg-glow-2` | – | – | `oklch(0.4 0.072 220 / 0.14)` ¹ | `#02506224` |
| `bg-glow-3` | – | – | `oklch(0.4 0.15 300 / 0.1)` | `#562c8b1a` |
| `bg-grain` | – | – | `oklch(1 0 0 / 0.07)` | `#ffffff12` |

## 3. Glass

Glass is the material for **floating layers only**: top bar, summary hero, ⌘K command bar, toasts and the detail pager. Work surfaces are never glass.

**Construction, from bottom to top:**

1. **Backdrop filter.** `blur(var(--st-glass-blur)) saturate(var(--st-glass-saturate))`, where `--st-glass-blur: 28px` and `--st-glass-saturate: 1.8`. The scrim under modal glass uses `blur(4px) saturate(1.1)`.
2. **Base fill.** It depends on the variant (see the table below).
3. **Light field.** Three radial gradients of `glass-field-1..3`. Their positions are animated through registered custom properties (`@property`, `<percentage>`). The field strength depends on the variant.
4. **Sheen.** A fixed radial highlight, `glass-sheen`, at the top left.
5. **Pointer light.** A 240 px radial `glass-pointer-light` that follows the pointer.
6. **Edges.**
   - A 1 px `glass-border` hairline outside.
   - A 1 px refraction rim inside, as a 158° gradient: `glass-rim-1` → `glass-rim-2` at 26 % → transparent at 52 % → `glass-rim-2` at 76 % → `glass-rim-3`.
   - The `shadow-glass` elevation.

**Variants:**

| Variant | Base | Field strength (1/2/3) | Used by |
|---|---|---|---|
| `glass` | `glass-base` | 100 / 100 / 100 % | top bar, toasts, pager |
| `glass-strong` | `glass-base-strong` | 50 / 50 / 0 % | summary hero lens (over `hero-base` + `hero-field-1..3`) |
| `glass-overlay` | `glass-base-overlay` | light 100 / 100 / 100 %, dark 36 / 26 / 0 % | ⌘K command bar (the dark field stays a hint, not a light show) |

**The hero lens** is an opaque `hero-base` with its own three `hero-field-*` gradients, under one sheet of `glass-strong`.

**Fallbacks and preferences:**

- **No `backdrop-filter` support:** every variant falls back to `glass-base-strong` with no field.
- **`prefers-reduced-transparency: reduce`:** the same opaque fallback. Chromium supports this media query since version 118. Firefox and Safari do not as of this writing, so it is a progressive enhancement.
- **`forced-colors: active`:** glass becomes a plain `Canvas` fill with a `CanvasText` 1 px border. There is no field, sheen, rim or shadow.
- **`prefers-reduced-motion: reduce`:** the field stops drifting and the pointer light is removed. The glass itself stays.
- **Extension side panel:** the blur stays, but the field is static, with no drift and no pointer light. This saves GPU work in a narrow panel that is always open. The web app drifts.

## 4. Typography

**Families**

- **UI:** `--st-font-sans: 'Atkinson Hyperlegible Next', ui-sans-serif, system-ui, sans-serif`
- **Evidence:** `--st-font-mono: 'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace`

Both fonts are self-hosted. Web and extension use variable WOFF2, and the PDF uses static TTF cuts with the Noto fallback (see [#184](https://github.com/jeffnawroth/source-taster/issues/184)).

**Weights**

- Sans: 400 regular, 500 medium, 700 bold, 800 heavy (display numerals only).
- Mono: 400, 500, 600.

**Mono scale and figures**

- Mono text sits **half a step smaller** than the sans step it accompanies. The token is `--st-font-mono-scale: 0.94`, applied as `0.94em`, so Plex Mono does not look bigger than Atkinson next to it.
- Counts, tables, page ranges and timings use `font-variant-numeric: tabular-nums`.

**Scale.** Root is 16 px, and every size is in rem. Each step pairs a size with a line height and tracking:

| Token | Size | px | Line height | Tracking | Typical use |
|---|---|---|---|---|---|
| `text-2xs` | 0.6875rem | 11 | 1.45 | 0.01em | kbd, mono micro labels |
| `text-xs` | 0.75rem | 12 | 1.5 | 0 | meta, captions, mono source names |
| `text-sm` | 0.84375rem | 13.5 | 1.45 | −0.005em | secondary UI, chips, table cells |
| `text-base` | 0.9375rem | 15 | 1.5 | 0 | body, controls |
| `text-md` | 1.0625rem | 17 | 1.4 | −0.01em | card titles, lede in the panel |
| `text-lg` | 1.25rem | 20 | 1.3 | −0.015em | section headings |
| `text-xl` | 1.5rem | 24 | 1.2 | −0.02em | view headings in the panel |
| `text-2xl` | 2rem | 32 | 1.15 | −0.025em | view headings on the web, summary sentence |
| `text-3xl` | 2.5rem | 40 | 1.06 | −0.03em | intake headline |
| `text-display-sm` | 3.375rem | 54 | 0.86 | −0.06em | hero numeral in the 360 px panel (800) |
| `text-display` | 8rem | 128 | 0.8 | −0.07em | hero numeral on the web (800) |

**Overline (eyebrow) labels:** uppercase, `text-2xs` or `text-xs`, weight 600, tracking `--st-tracking-caps: 0.08em`.

**From the prototype:** its roughly 30 sizes between 10.5 and 128 px snap to the nearest step. For example, 10.5 and 11.5 → `2xs`/`xs`, 12.5 and 13 → `sm`, 14 and 14.5 → `base` (controls) or `sm`, 15.5–16.5 → `md`, 18 and 22 → `lg`/`xl`, 26–28 → `xl`/`2xl`, 34 → `2xl`, and 72 and 96 → `display`.

## 5. Spacing, radius, elevation, focus, layers

**Spacing:** Tailwind's 4 px grid, `--spacing: 0.25rem`. The prototype already sits almost entirely on it. Its few odd values (5, 7, 9 px) round to the grid.

**Radius:**

| Token | Value | From the prototype | Typical use |
|---|---|---|---|
| `radius-xs` | 4px | 3–4 | underlines, tiny marks |
| `radius-sm` | 8px | 6–9 | kbd, small chips, focus outline |
| `radius-md` | 12px | 10–14 | inputs, menu items, rows |
| `radius-lg` | 16px | 16–20 | cards inside cards, panels |
| `radius-xl` | 22px | 22–24 | cards |
| `radius-2xl` | 28px | 28 | hero, command bar, sheets |
| `radius-full` | 9999px | 99 | buttons, pills, segmented nav |

A nested element's radius is the outer radius minus the padding between them, and never less than `radius-xs`.

**Elevation.** Opaque surfaces have three levels, and glass has its own. The shadow colours are tokens per mode. They are not contrast-gated because they carry no information.

| Token | Light | Dark |
|---|---|---|
| `shadow-flat` | none (border only) | none (border only) |
| `shadow-raised` | `0 1px 2px oklch(0.3 0.06 265 / 0.05), 0 12px 30px -18px oklch(0.3 0.08 265 / 0.2)` | `0 0 0 1px oklch(0 0 0 / 0.45), 0 20px 44px -28px oklch(0 0 0 / 0.9)` |
| `shadow-lifted` (hover, drag, hero) | `0 2px 4px oklch(0.3 0.06 265 / 0.05), 0 26px 50px -24px oklch(0.3 0.1 265 / 0.3)` | `0 0 0 1px oklch(0 0 0 / 0.5), 0 34px 70px -30px oklch(0.35 0.15 266 / 0.45)` |
| `shadow-glass` | `inset 0 -10px 22px -18px oklch(0.4 0.12 265 / 0.22), 0 1px 1px oklch(0.3 0.08 265 / 0.08), 0 10px 24px -12px oklch(0.32 0.12 265 / 0.22), 0 40px 70px -30px oklch(0.32 0.12 265 / 0.36)` | `inset 0 -12px 24px -18px oklch(0.6 0.15 266 / 0.2), 0 10px 24px -12px oklch(0 0 0 / 0.7), 0 40px 80px -24px oklch(0 0 0 / 0.85)` |
| `highlight-inset` (top catch-light on raised surfaces) | `inset 0 1px 0 oklch(1 0 0)` | `inset 0 1px 0 oklch(1 0 0 / 0.06)` |

All shadow colours were checked and lie inside sRGB.

**Focus:** 2 px `focus-ring` outline with a 2 px offset, following the element's radius. Under `forced-colors` it uses `Highlight`.

**Layers (z-index):**

| Token | Value |
|---|---|
| `z-base` | 0 |
| `z-raised` | 1 |
| `z-sticky` | 10 |
| `z-topbar` | 20 |
| `z-pager` | 30 |
| `z-overlay` (scrim) | 40 |
| `z-command` | 50 |
| `z-toast` | 60 |

## 6. Motion

Motion is CSS-native only: `linear()` springs, `@starting-style` and the View Transitions API, with no animation library (see [#188](https://github.com/jeffnawroth/source-taster/issues/188)).

**Curves:**

| Token | Value | Use |
|---|---|---|
| `ease-spring` | `linear(0, 0.009, 0.035 2.1%, 0.141, 0.281 6.7%, 0.723 12.9%, 0.938 16.7%, 1.017, 1.077, 1.121, 1.149 24.3%, 1.159, 1.163 27%, 1.154, 1.129 32.8%, 1.051 39.6%, 1.017 43.1%, 0.991, 0.977 51%, 0.975 57.1%, 0.997 69.8%, 1.003 76.9%, 1)` | small objects: chips popping in, button press, glyphs |
| `ease-spring-soft` | `linear(0, 0.06 2%, 0.23 5.5%, 0.5 10.5%, 0.75 16%, 0.9 21.5%, 0.985 27%, 1.02 32.5%, 1.03 38%, 1.022 45%, 1.008 55%, 0.999 68%, 1)` | large surfaces: ring segments, row → detail morph, tracked-change accept |
| `ease-standard` | `cubic-bezier(.2, .8, .2, 1)` | colour, opacity and border changes |
| `ease-exit` | `cubic-bezier(.4, 0, 1, 1)` | exits. It accelerates, so it is named for its job. The prototype's "ease-out" name was wrong. |

**Durations:**

| Token | Value | From the prototype |
|---|---|---|
| `duration-instant` | 100ms | `.1s`/`.12s` press feedback |
| `duration-fast` | 160ms | exits, small fades (`.16s`) |
| `duration-base` | 240ms | colour, border and background transitions (`.2s`–`.3s`) |
| `duration-spring` | 500ms | `ease-spring` moves (`.5s`–`.65s`) |
| `duration-slow` | 700ms | `ease-spring-soft` surfaces (`.7s`–`.8s`) |
| `stagger` | 45ms | delay between consecutive items (streamed rows, evidence lines) |
| `duration-ambient-drift` | 46s | glass light-field drift (web only) |
| `duration-ambient-float` | 9s | hero lens float |

**Reduced motion.** Under `prefers-reduced-motion: reduce`:
- every duration token becomes `0ms`;
- the ambient animations are removed;
- view transitions are skipped;
- count-ups render their final value.

The final state renders directly. Streaming never reorders rows or moves focus, in either mode.

## 7. Contrast gate

### 7.1 What is gated

The gate uses the WCAG 2.2 contrast ratio. APCA is advisory only (see [#185](https://github.com/jeffnawroth/source-taster/issues/185)). Translucent layers are composited source-over in sRGB, as the browser paints them. Every pair is checked in light **and** dark:

- **Text, 4.5:1:**
  - `text`, `text-secondary` and `text-muted` on `bg`, `surface`, `surface-sunken` and the glass fallback;
  - `accent-text` on `surface` and `accent-tint`;
  - `on-accent` on `accent` and on **both** primary-button stops;
  - each `feedback-*` on `surface` and on its own `-tint`;
  - `text` on `correction-insert-bg`, and `correction-delete-text` on `correction-delete-bg`;
  - `text` and `text-on-glass-secondary` on each glass variant's **worst case**.
- **Glass worst case.** Every backdrop is combined with every single field at its peak alpha, with and without sheen plus pointer light, and the lowest ratio counts. The backdrops are:
  - for `glass`: `bg`, `surface`, `surface-sunken` and `bg` + `bg-glow`;
  - for `glass-strong`: `hero-base` + each hero field;
  - for `glass-overlay`: the scrim over `bg`, `surface` and `bg-glow`.
- **Non-text, 3:1:**
  - each `verdict-*-mark` on `surface`, `bg`, its own `-tint` and `-tint-strong`, and the `glass-strong` worst case (the hero ring and legend);
  - `focus-ring` on `bg`, `surface`, `surface-sunken`, `accent-tint` and each glass variant's worst case (command-bar options and toast buttons take focus on glass);
  - `on-verdict-mark` on each `verdict-*-mark` (the inner symbol of a filled glyph);
  - `border-emphasis` (input boundary) on `surface`;
  - `correction-insert-line` on `correction-insert-bg`.
- **Also gated, outside the generator:**
  - **Rendered pixels on glass.** An E2E check measures text on glass on rendered pixels (Playwright, transparent-text capture, as in the prototype).
  - **Greyscale glyph test.** The six verdict glyphs at 16 px in greyscale must stay pairwise distinguishable by shape.
  - **axe in E2E** for everything else. axe does not check 1.4.11.

### 7.2 Results

| Mode | Foreground | Background | Min | Ratio | |
|---|---|---|---|---|---|
| light | `text` | bg | 4.5 | 17.02 | ✓ |
| light | `text` | surface | 4.5 | 18.13 | ✓ |
| light | `text` | surface-sunken | 4.5 | 16.43 | ✓ |
| light | `text` | glass-base-strong, the fallback (over bg) | 4.5 | 17.93 | ✓ |
| light | `text-secondary` | bg | 4.5 | 9.81 | ✓ |
| light | `text-secondary` | surface | 4.5 | 10.45 | ✓ |
| light | `text-secondary` | surface-sunken | 4.5 | 9.47 | ✓ |
| light | `text-secondary` | glass-base-strong, the fallback (over bg) | 4.5 | 10.33 | ✓ |
| light | `text-muted` | bg | 4.5 | 6.41 | ✓ |
| light | `text-muted` | surface | 4.5 | 6.83 | ✓ |
| light | `text-muted` | surface-sunken | 4.5 | 6.19 | ✓ |
| light | `text-muted` | glass-base-strong, the fallback (over bg) | 4.5 | 6.76 | ✓ |
| light | `accent-text` | surface | 4.5 | 7.20 | ✓ |
| light | `accent-text` | accent-tint (over surface) | 4.5 | 6.40 | ✓ |
| light | `on-accent` | accent | 4.5 | 6.29 | ✓ |
| light | `on-accent` | button-primary-from | 4.5 | 5.05 | ✓ |
| light | `on-accent` | button-primary-to | 4.5 | 7.22 | ✓ |
| light | `feedback-danger` | surface | 4.5 | 6.62 | ✓ |
| light | `feedback-danger` | feedback-danger-tint | 4.5 | 5.69 | ✓ |
| light | `feedback-warning` | surface | 4.5 | 6.20 | ✓ |
| light | `feedback-warning` | feedback-warning-tint | 4.5 | 5.35 | ✓ |
| light | `feedback-success` | surface | 4.5 | 6.17 | ✓ |
| light | `feedback-success` | feedback-success-tint | 4.5 | 5.33 | ✓ |
| light | `feedback-info` | surface | 4.5 | 7.20 | ✓ |
| light | `feedback-info` | feedback-info-tint | 4.5 | 6.17 | ✓ |
| light | `text` | correction-insert-bg (over surface) | 4.5 | 15.23 | ✓ |
| light | `correction-delete-text` | correction-delete-bg (over surface) | 4.5 | 8.27 | ✓ |
| light | `text` | glass worst case (bg + bg-glow + field-1) | 4.5 | 11.94 | ✓ |
| light | `text-secondary` | glass worst case (bg + bg-glow + field-1) | (not allowed) | 6.88 | info |
| light | `text-muted` | glass worst case (bg + bg-glow + field-1) | (not allowed) | 4.50 | info |
| light | `text-on-glass-secondary` | glass worst case (bg + bg-glow + field-1) | 4.5 | 5.58 | ✓ |
| light | `text` | glass-strong worst case (hero-field-1 + field-1) | 4.5 | 13.98 | ✓ |
| light | `text-secondary` | glass-strong worst case (hero-field-1 + field-1) | (not allowed) | 8.05 | info |
| light | `text-muted` | glass-strong worst case (hero-field-1 + field-1) | (not allowed) | 5.27 | info |
| light | `text-on-glass-secondary` | glass-strong worst case (hero-field-1 + field-1) | 4.5 | 6.53 | ✓ |
| light | `verdict-correct-mark` | glass-strong worst case (hero-field-1 + field-1) | 3 | 3.35 | ✓ |
| light | `verdict-deviations-mark` | glass-strong worst case (hero-field-1 + field-1) | 3 | 3.13 | ✓ |
| light | `verdict-mixed-mark` | glass-strong worst case (hero-field-1 + field-1) | 3 | 4.36 | ✓ |
| light | `verdict-doi-conflict-mark` | glass-strong worst case (hero-field-1 + field-1) | 3 | 4.34 | ✓ |
| light | `verdict-not-found-mark` | glass-strong worst case (hero-field-1 + field-1) | 3 | 5.83 | ✓ |
| light | `verdict-not-verifiable-mark` | glass-strong worst case (hero-field-1 + field-1) | 3 | 4.25 | ✓ |
| light | `text` | glass-overlay worst case (scrim over bg-glow + field-1) | 4.5 | 11.73 | ✓ |
| light | `text-secondary` | glass-overlay worst case (scrim over bg-glow + field-1) | (not allowed) | 6.76 | info |
| light | `text-muted` | glass-overlay worst case (scrim over bg-glow + field-1) | (not allowed) | 4.42 | info |
| light | `text-on-glass-secondary` | glass-overlay worst case (scrim over bg-glow + field-1) | 4.5 | 5.48 | ✓ |
| light | `verdict-correct-mark` | surface | 3 | 4.35 | ✓ |
| light | `verdict-correct-mark` | bg | 3 | 4.08 | ✓ |
| light | `verdict-correct-mark` | verdict-correct-tint | 3 | 3.85 | ✓ |
| light | `verdict-correct-mark` | verdict-correct-tint-strong | 3 | 3.61 | ✓ |
| light | `verdict-deviations-mark` | surface | 3 | 4.07 | ✓ |
| light | `verdict-deviations-mark` | bg | 3 | 3.82 | ✓ |
| light | `verdict-deviations-mark` | verdict-deviations-tint | 3 | 3.62 | ✓ |
| light | `verdict-deviations-mark` | verdict-deviations-tint-strong | 3 | 3.40 | ✓ |
| light | `verdict-mixed-mark` | surface | 3 | 5.65 | ✓ |
| light | `verdict-mixed-mark` | bg | 3 | 5.31 | ✓ |
| light | `verdict-mixed-mark` | verdict-mixed-tint | 3 | 4.91 | ✓ |
| light | `verdict-mixed-mark` | verdict-mixed-tint-strong | 3 | 4.56 | ✓ |
| light | `verdict-doi-conflict-mark` | surface | 3 | 5.64 | ✓ |
| light | `verdict-doi-conflict-mark` | bg | 3 | 5.29 | ✓ |
| light | `verdict-doi-conflict-mark` | verdict-doi-conflict-tint | 3 | 4.90 | ✓ |
| light | `verdict-doi-conflict-mark` | verdict-doi-conflict-tint-strong | 3 | 4.55 | ✓ |
| light | `verdict-not-found-mark` | surface | 3 | 7.56 | ✓ |
| light | `verdict-not-found-mark` | bg | 3 | 7.10 | ✓ |
| light | `verdict-not-found-mark` | verdict-not-found-tint | 3 | 6.44 | ✓ |
| light | `verdict-not-found-mark` | verdict-not-found-tint-strong | 3 | 5.93 | ✓ |
| light | `verdict-not-verifiable-mark` | surface | 3 | 5.51 | ✓ |
| light | `verdict-not-verifiable-mark` | bg | 3 | 5.17 | ✓ |
| light | `verdict-not-verifiable-mark` | verdict-not-verifiable-tint | 3 | 4.79 | ✓ |
| light | `verdict-not-verifiable-mark` | verdict-not-verifiable-tint-strong | 3 | 4.46 | ✓ |
| light | `focus-ring` | bg | 3 | 5.91 | ✓ |
| light | `focus-ring` | surface | 3 | 6.29 | ✓ |
| light | `focus-ring` | surface-sunken | 3 | 5.70 | ✓ |
| light | `focus-ring` | accent-tint (over surface) | 3 | 5.59 | ✓ |
| light | `focus-ring` | glass worst case (bg + bg-glow + field-1) | 3 | 4.14 | ✓ |
| light | `focus-ring` | glass-strong worst case (hero-field-1 + field-1) | 3 | 4.85 | ✓ |
| light | `focus-ring` | glass-overlay worst case (scrim over bg-glow + field-1) | 3 | 4.07 | ✓ |
| light | `on-verdict-mark` | verdict-correct-mark | 3 | 4.35 | ✓ |
| light | `on-verdict-mark` | verdict-deviations-mark | 3 | 4.07 | ✓ |
| light | `on-verdict-mark` | verdict-mixed-mark | 3 | 5.65 | ✓ |
| light | `on-verdict-mark` | verdict-doi-conflict-mark | 3 | 5.64 | ✓ |
| light | `on-verdict-mark` | verdict-not-found-mark | 3 | 7.56 | ✓ |
| light | `on-verdict-mark` | verdict-not-verifiable-mark | 3 | 5.51 | ✓ |
| light | `border-emphasis (over surface)` | surface | 3 | 3.48 | ✓ |
| light | `correction-insert-line` | correction-insert-bg (over surface) | 3 | 5.28 | ✓ |
| dark | `text` | bg | 4.5 | 18.04 | ✓ |
| dark | `text` | surface | 4.5 | 16.78 | ✓ |
| dark | `text` | surface-sunken | 4.5 | 17.48 | ✓ |
| dark | `text` | glass-base-strong, the fallback (over bg) | 4.5 | 16.66 | ✓ |
| dark | `text-secondary` | bg | 4.5 | 11.65 | ✓ |
| dark | `text-secondary` | surface | 4.5 | 10.83 | ✓ |
| dark | `text-secondary` | surface-sunken | 4.5 | 11.29 | ✓ |
| dark | `text-secondary` | glass-base-strong, the fallback (over bg) | 4.5 | 10.76 | ✓ |
| dark | `text-muted` | bg | 4.5 | 7.64 | ✓ |
| dark | `text-muted` | surface | 4.5 | 7.11 | ✓ |
| dark | `text-muted` | surface-sunken | 4.5 | 7.41 | ✓ |
| dark | `text-muted` | glass-base-strong, the fallback (over bg) | 4.5 | 7.06 | ✓ |
| dark | `accent-text` | surface | 4.5 | 9.76 | ✓ |
| dark | `accent-text` | accent-tint (over surface) | 4.5 | 8.05 | ✓ |
| dark | `on-accent` | accent | 4.5 | 9.19 | ✓ |
| dark | `on-accent` | button-primary-from | 4.5 | 11.35 | ✓ |
| dark | `on-accent` | button-primary-to | 4.5 | 7.62 | ✓ |
| dark | `feedback-danger` | surface | 4.5 | 7.72 | ✓ |
| dark | `feedback-danger` | feedback-danger-tint | 4.5 | 6.80 | ✓ |
| dark | `feedback-warning` | surface | 4.5 | 11.08 | ✓ |
| dark | `feedback-warning` | feedback-warning-tint | 4.5 | 9.42 | ✓ |
| dark | `feedback-success` | surface | 4.5 | 10.37 | ✓ |
| dark | `feedback-success` | feedback-success-tint | 4.5 | 8.82 | ✓ |
| dark | `feedback-info` | surface | 4.5 | 9.76 | ✓ |
| dark | `feedback-info` | feedback-info-tint | 4.5 | 8.39 | ✓ |
| dark | `text` | correction-insert-bg (over surface) | 4.5 | 11.90 | ✓ |
| dark | `correction-delete-text` | correction-delete-bg (over surface) | 4.5 | 8.10 | ✓ |
| dark | `text` | glass worst case (bg + bg-glow + field-3 + sheen + pointer) | 4.5 | 6.98 | ✓ |
| dark | `text-secondary` | glass worst case (bg + bg-glow + field-3 + sheen + pointer) | (not allowed) | 4.51 | info |
| dark | `text-muted` | glass worst case (bg + bg-glow + field-3 + sheen + pointer) | (not allowed) | 2.96 | info |
| dark | `text-on-glass-secondary` | glass worst case (bg + bg-glow + field-3 + sheen + pointer) | 4.5 | 5.30 | ✓ |
| dark | `text` | glass-strong worst case (hero-field-1 + field-1 + sheen + pointer) | 4.5 | 8.65 | ✓ |
| dark | `text-secondary` | glass-strong worst case (hero-field-1 + field-1 + sheen + pointer) | (not allowed) | 5.59 | info |
| dark | `text-muted` | glass-strong worst case (hero-field-1 + field-1 + sheen + pointer) | (not allowed) | 3.67 | info |
| dark | `text-on-glass-secondary` | glass-strong worst case (hero-field-1 + field-1 + sheen + pointer) | 4.5 | 6.57 | ✓ |
| dark | `verdict-correct-mark` | glass-strong worst case (hero-field-1 + field-1 + sheen + pointer) | 3 | 5.39 | ✓ |
| dark | `verdict-deviations-mark` | glass-strong worst case (hero-field-1 + field-1 + sheen + pointer) | 3 | 5.54 | ✓ |
| dark | `verdict-mixed-mark` | glass-strong worst case (hero-field-1 + field-1 + sheen + pointer) | 3 | 3.78 | ✓ |
| dark | `verdict-doi-conflict-mark` | glass-strong worst case (hero-field-1 + field-1 + sheen + pointer) | 3 | 3.53 | ✓ |
| dark | `verdict-not-found-mark` | glass-strong worst case (hero-field-1 + field-1 + sheen + pointer) | 3 | 3.23 | ✓ |
| dark | `verdict-not-verifiable-mark` | glass-strong worst case (hero-field-1 + field-1 + sheen + pointer) | 3 | 3.80 | ✓ |
| dark | `text` | glass-overlay worst case (scrim over bg-glow + field-1 + sheen + pointer) | 4.5 | 9.93 | ✓ |
| dark | `text-secondary` | glass-overlay worst case (scrim over bg-glow + field-1 + sheen + pointer) | (not allowed) | 6.41 | info |
| dark | `text-muted` | glass-overlay worst case (scrim over bg-glow + field-1 + sheen + pointer) | (not allowed) | 4.20 | info |
| dark | `text-on-glass-secondary` | glass-overlay worst case (scrim over bg-glow + field-1 + sheen + pointer) | 4.5 | 7.54 | ✓ |
| dark | `verdict-correct-mark` | surface | 3 | 10.45 | ✓ |
| dark | `verdict-correct-mark` | bg | 3 | 11.23 | ✓ |
| dark | `verdict-correct-mark` | verdict-correct-tint | 3 | 8.87 | ✓ |
| dark | `verdict-correct-mark` | verdict-correct-tint-strong | 3 | 8.04 | ✓ |
| dark | `verdict-deviations-mark` | surface | 3 | 10.74 | ✓ |
| dark | `verdict-deviations-mark` | bg | 3 | 11.55 | ✓ |
| dark | `verdict-deviations-mark` | verdict-deviations-tint | 3 | 9.16 | ✓ |
| dark | `verdict-deviations-mark` | verdict-deviations-tint-strong | 3 | 8.30 | ✓ |
| dark | `verdict-mixed-mark` | surface | 3 | 7.34 | ✓ |
| dark | `verdict-mixed-mark` | bg | 3 | 7.89 | ✓ |
| dark | `verdict-mixed-mark` | verdict-mixed-tint | 3 | 6.49 | ✓ |
| dark | `verdict-mixed-mark` | verdict-mixed-tint-strong | 3 | 6.01 | ✓ |
| dark | `verdict-doi-conflict-mark` | surface | 3 | 6.85 | ✓ |
| dark | `verdict-doi-conflict-mark` | bg | 3 | 7.36 | ✓ |
| dark | `verdict-doi-conflict-mark` | verdict-doi-conflict-tint | 3 | 6.09 | ✓ |
| dark | `verdict-doi-conflict-mark` | verdict-doi-conflict-tint-strong | 3 | 5.65 | ✓ |
| dark | `verdict-not-found-mark` | surface | 3 | 6.27 | ✓ |
| dark | `verdict-not-found-mark` | bg | 3 | 6.74 | ✓ |
| dark | `verdict-not-found-mark` | verdict-not-found-tint | 3 | 5.61 | ✓ |
| dark | `verdict-not-found-mark` | verdict-not-found-tint-strong | 3 | 5.23 | ✓ |
| dark | `verdict-not-verifiable-mark` | surface | 3 | 7.37 | ✓ |
| dark | `verdict-not-verifiable-mark` | bg | 3 | 7.93 | ✓ |
| dark | `verdict-not-verifiable-mark` | verdict-not-verifiable-tint | 3 | 6.49 | ✓ |
| dark | `verdict-not-verifiable-mark` | verdict-not-verifiable-tint-strong | 3 | 6.00 | ✓ |
| dark | `focus-ring` | bg | 3 | 10.50 | ✓ |
| dark | `focus-ring` | surface | 3 | 9.76 | ✓ |
| dark | `focus-ring` | surface-sunken | 3 | 10.17 | ✓ |
| dark | `focus-ring` | accent-tint (over surface) | 3 | 8.05 | ✓ |
| dark | `focus-ring` | glass worst case (bg + bg-glow + field-3 + sheen + pointer) | 3 | 4.06 | ✓ |
| dark | `focus-ring` | glass-strong worst case (hero-field-1 + field-1 + sheen + pointer) | 3 | 5.03 | ✓ |
| dark | `focus-ring` | glass-overlay worst case (scrim over bg-glow + field-1 + sheen + pointer) | 3 | 5.77 | ✓ |
| dark | `on-verdict-mark` | verdict-correct-mark | 3 | 11.09 | ✓ |
| dark | `on-verdict-mark` | verdict-deviations-mark | 3 | 11.40 | ✓ |
| dark | `on-verdict-mark` | verdict-mixed-mark | 3 | 7.79 | ✓ |
| dark | `on-verdict-mark` | verdict-doi-conflict-mark | 3 | 7.27 | ✓ |
| dark | `on-verdict-mark` | verdict-not-found-mark | 3 | 6.65 | ✓ |
| dark | `on-verdict-mark` | verdict-not-verifiable-mark | 3 | 7.82 | ✓ |
| dark | `border-emphasis (over surface)` | surface | 3 | 4.09 | ✓ |
| dark | `correction-insert-line` | correction-insert-bg (over surface) | 3 | 6.92 | ✓ |

156 gated pairs, 0 failing; 12 informational rows for roles that are not allowed on glass

The rows marked "info" are roles that section 2.3 bans from glass. They are listed to show why the ban exists.

**Tightest gated pairs:**
- light `verdict-deviations-mark` on the `glass-strong` worst case, 3.13;
- dark `verdict-not-found-mark` on the `glass-strong` worst case, 3.23;
- light `verdict-correct-mark` on the `glass-strong` worst case, 3.35;
- light `verdict-deviations-mark` on `-tint-strong`, 3.40;
- light `on-accent` on the upper primary-button stop, 5.05.

Do not lighten the light amber.

## 8. Changes from the prototype, and why

**Renames** (Q2):
- `outer` → `canvas`, `surface-2` → `surface-sunken`
- `line`/`line-2`/`line-strong` → `border`/`border-strong`/`border-emphasis`
- `ink`/`ink-2`/`ink-3` → `text`/`text-secondary`/`text-muted`
- `accent-ink` → `on-accent`, `accent-soft` → `accent-tint`, `accent-ring` → `accent-glow`, `focus` → `focus-ring`
- `ok`/`diff`/`mixed`/`doi`/`miss`/`unk` → `verdict-<label>-mark`, `on` → `on-verdict-mark`
- `del-*`/`ins-*` → `correction-delete-*`/`correction-insert-*`
- `glass-strong` → `glass-base-strong`, `glass-line` → `glass-border`, `rim-a/b/c` → `glass-rim-1..3`
- `f1..f3` → `glass-field-1..3`, `hero-1..3` → `hero-field-1..3`
- `--ease-out` → `ease-exit`

**Primary button.** The tokens take the stops that were actually rendered and measured: light `oklch(0.55 0.2 263)` → `oklch(0.47 0.2 266)`. The prototype's `--accent-hi`/`--accent-lo` are dropped. In light mode, white on `--accent-hi` (L 0.6) is only **4.06:1**. The measured 5.03:1 came from a hard-coded override.

**Gamut.** 24 values lost chroma at constant L and H (Q12):

- light bg-glow: oklch(0.925 0.055 252) → oklch(0.925 0.037 252 / 0.85)
- light verdict-correct-mark: oklch(0.56 0.15 152) → oklch(0.56 0.147 152)
- light verdict-not-found-mark: oklch(0.47 0.19 18) → oklch(0.47 0.188 18)
- light glass-field-1: oklch(0.84 0.1 238) → oklch(0.84 0.09 238 / 0.85)
- light glass-field-2: oklch(0.86 0.1 292) → oklch(0.86 0.075 292 / 0.75)
- light hero-base: oklch(0.93 0.04 255) → oklch(0.93 0.034 255)
- light hero-field-1: oklch(0.8 0.13 238) → oklch(0.8 0.114 238 / 0.95)
- light hero-field-2: oklch(0.82 0.12 292) → oklch(0.82 0.098 292 / 0.9)
- dark bg-glow-2: oklch(0.4 0.14 220) → oklch(0.4 0.072 220 / 0.14)
- dark accent: oklch(0.77 0.13 262) → oklch(0.77 0.116 262)
- dark accent-text: oklch(0.8 0.12 262) → oklch(0.8 0.1 262)
- dark accent-tint: oklch(0.77 0.13 262) → oklch(0.77 0.116 262 / 0.11)
- dark accent-glow: oklch(0.77 0.13 262) → oklch(0.77 0.116 262 / 0.32)
- dark focus-ring: oklch(0.8 0.12 262) → oklch(0.8 0.1 262)
- dark verdict-mixed-mark: oklch(0.74 0.18 5) → oklch(0.74 0.167 5)
- dark verdict-doi-conflict-mark: oklch(0.72 0.19 28) → oklch(0.72 0.174 28)
- dark verdict-not-found-mark: oklch(0.7 0.2 20) → oklch(0.7 0.191 20)
- dark feedback-info: oklch(0.8 0.12 262) → oklch(0.8 0.1 262)
- dark correction-insert-bg: oklch(0.72 0.15 264) → oklch(0.72 0.144 264 / 0.2)
- dark correction-insert-line: oklch(0.8 0.12 262) → oklch(0.8 0.1 262)
- dark glass-field-3: oklch(0.46 0.1 220) → oklch(0.46 0.083 220 / 0.5)
- dark hero-field-3: oklch(0.5 0.12 220) → oklch(0.5 0.091 220 / 0.65)
- dark button-primary-from: oklch(0.83 0.1 258) → oklch(0.83 0.085 258)
- dark button-primary-to: oklch(0.72 0.15 264) → oklch(0.72 0.144 264)

**No merges.** Values that differ only by a hair (for example the button hues 263/266 against `accent` 264) stay as the prototype had them (Q15). That is why the primitive layer has one stop per value.

**Changed because the gate rejected them** (Q15):
- Dark `verdict-not-found-mark` L 0.68 → **0.70**. On the hero glass it was 2.98:1. That pair (verdict marks on the `glass-strong` worst case) was added to the gate after Q11, for the hero ring and legend. It stays below `doi-conflict` (0.72).
- New role `text-on-glass-secondary` (light L 0.42, dark L 0.88) instead of muted text on glass (Q16).

**New, not in the prototype:**
- `feedback-*` with tints
- the Status rules
- the fixed tint steps (Q13)
- `chart-track`, `glass-sheen`, `glass-pointer-light`, `glass-base-overlay`, `bg-glow-2/3` and `bg-grain` as named tokens (Q14)

**Dropped** (Q14), all prototype scenery or AI glow:
- the avatar gradient
- the mocked browser tab bar
- the verdict glow around finished rows (`0 0 36px … var(--c)`)
- the dev bar

**Consolidated:**
- about 30 font sizes into 11 steps (Q5)
- 13 radii into 7 (Q6)
- runtime tint mixes into 3 fixed steps (Q13)

**Brand mark.** The logo gradient (`oklch(0.66 0.17 252)` → `0.52 0.21 263` → `0.42 0.2 274`) and drop highlight are asset colours in the project-owned SVG, not UI roles. The highlight stop `oklch(0.93 0.035 262)` is outside sRGB and must be mapped when the asset is produced.

## 9. Handed on

- **Package location, licence and transport** to the private repository: [#189](https://github.com/jeffnawroth/source-taster/issues/189).
- **Breakpoints, panel density** and whether the panel uses the same type steps one size down: [#194](https://github.com/jeffnawroth/source-taster/issues/194).
- **Per-component token use** (button, field, chip, tile, toast …): the component inventory and specs.
- **Email and PDF mapping** of the sRGB constants (no glass, no motion; verdict marks as inline SVG): the email/PDF fog patch. Translucent roles must be pre-composited onto a named backdrop there, because many mail clients do not render 8-digit hex.
- **Regular primitive scales.** Snapping the per-value stops to a `50…950` ladder, if wanted, means changing values and re-running the gate.
- **Production re-verification.** The prototype's rendered-pixel measurements and this generator's numbers must be re-run on the built tokens.
