# Design tokens

This is the token spec decided in "Which design tokens does the design system define?" ([#193](https://github.com/jeffnawroth/source-taster/issues/193)), part of the map "Wayfinder: Brand and design system for Source Taster" ([#181](https://github.com/jeffnawroth/source-taster/issues/181)). This is its consolidated current form on `design/181-system`; the immutable seed is recorded in [sources.md](sources.md). It was **amended in "Which components does the design system define, and how do they behave and look?" ([#195](https://github.com/jeffnawroth/source-taster/issues/195))**: the calm colour rule removed the scenery and verdict tints, and glass lost its light field. Section 8 records the current consolidation and links preserve the original history. Read with [ADR-0027](../adr/0027-design-system.md), [styleguide.md](styleguide.md) and the [implementation plan](implementation-plan.md).

**Sources:**
- The chosen identity "Glass" from "Which visual identity direction does Source Taster take?" ([#191](https://github.com/jeffnawroth/source-taster/issues/191)): `apps/web/prototype/identity/round4/c-revised/` on branch `prototype/191-identity` (commit 63d1909).
- The colour-system research ([#185](https://github.com/jeffnawroth/source-taster/issues/185)).
- The foundation decision ([#188](https://github.com/jeffnawroth/source-taster/issues/188)).

**Reproducible:** every colour value, sRGB fallback and contrast ratio below comes from [`tokens-check/`](tokens-check/). Run `npm install` in that folder once, then `node gen.mjs gate|tables|prims|tints`. Culori 4.0.2 is the only dependency. That folder is the seed for the production generator. It is not the production generator itself.

**Scope:** normative colour/type/shape/motion roles. Distribution is fixed by ADR-0027 and #189; surface composition is in the styleguide. This folder is a documentation/check seed, not the production token package.

## 1. Layers and naming

There are three layers:

1. **Primitives.** These are OKLCH stops grouped into hue families and named by lightness × 1000, for example `cobalt-500` = L 0.5. They are **not regular scales**: there is one stop per value in use (so `neutral-172`, `neutral-195` …), because Q15 keeps the prototype's values. Snapping them to a regular `50…950` ladder would change values and is a possible follow-up, not part of this spec. They are private: no Tailwind utility exists for them, and only the semantic layer reads them.
2. **Semantic roles.** Each role is defined once per mode (light and dark). Every role points at a primitive, with an alpha value where it needs one. Components use **only** these roles.
3. **Component tokens.** These exist only where a component needs values no role covers. For now there are none. The primary-button gradient stops were removed in #195; the primary button is a flat `accent` fill.

Rules:

- **Names are English.** Verdict roles follow the English glossary labels: `correct`, `deviations` (Exists, with deviations), `mixed` (Mixed citation), `doi-conflict`, `not-found`, `not-verifiable`.
- **Tailwind 4 wiring:**
  - Reset every default namespace that has a replacement (`--color-*: initial`, `--font-*: initial`, `--text-*: initial`, `--radius-*: initial`, `--shadow-*: initial`, `--ease-*: initial`) so that `bg-blue-500` and the like do not exist.
  - Expose the roles through `@theme inline { --color-surface: var(--st-surface); … }`. Components then write `bg-surface`, `text-text-muted`, `border-border-strong` and `fill-verdict-not-found-mark`. The stutter in `text-text-*` is the accepted cost of keeping one name per role across CSS, the generated constants and the docs.
- **CSS variables:**
  - Roles are `--st-<role>`, and primitives are `--st-prim-<family>-<step>`.
  - Light is the default on `:root`.
  - Dark applies under `@media (prefers-color-scheme: dark) { :root:not([data-theme=light]) }` and under `:root[data-theme=dark]`. This supports both appearances with System as the default. A persistent manual Theme preference remains a should under ADR-0023; this token rule does not promote it to a launch must.
  - Each mode block also sets `color-scheme`.
  - Components never use `dark:` utilities.
- **Tints are computed at build time**, never with `color-mix` inside components (see 2.5).
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
| `cobalt-470` | `oklch(0.47 0.2 265)` | `#214bc9` |
| `cobalt-500` | `oklch(0.5 0.2 264)` | `#2456d3` |
| `cobalt-550` | `oklch(0.55 0.2 264)` | `#3266e4` |
| `cobalt-770` | `oklch(0.77 0.116 262)` | `#8bb4fe` |
| `cobalt-800` | `oklch(0.8 0.1 262)` | `#9bbeff` |
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
| `neutral-195` | `oklch(0.195 0.019 266)` | `#11151e` |
| `neutral-200` | `oklch(0.2 0.035 265)` | `#0e1626` |
| `neutral-200-a` | `oklch(0.2 0.022 266)` | `#111620` |
| `neutral-205` | `oklch(0.205 0.022 266)` | `#121721` |
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

### 2.3 Usage rules

**Surfaces and text**

- `canvas` is the area outside the app frame. `bg` is the page, `surface` is opaque cards and controls, and `surface-sunken` is wells, segmented controls and kbd.
- `text`, `text-secondary` and `text-muted` are for opaque surfaces.
- **On glass only `text` and `text-on-glass-secondary` are allowed.** Since #195 the glass has no light field, and `text-secondary` and `text-muted` clear 4.5:1 on the flat composite (see 7.2). The gate does not model blur over real content, though, so the rule stays.

**Accent**

- `accent` is for fills and selected states, `accent-text` for links and accent text, and `on-accent` for text on accent fills.
- `accent-tint` is selected and hover washes, and `accent-glow` is retained as a source role for compatibility, but is not used as an ambient or button glow in the calm presentation. Focus uses the explicit focus-ring outline.
- `focus-ring` is for focus only.

**Verdicts**

- `verdict-*-mark` colours the **verdict glyph only**. **It is never a text colour**, and since #195 there are no verdict tints, verdict borders or chart segments: chips, rows and headers around a verdict stay neutral. Each verdict is always glyph + label, never colour alone. The one exception, in the 360 px compact strip, is set in [`components.md`](components.md).
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
- Insertions use a neutral background plus a 2 px underline: `correction-insert-bg` and `-line`, with `text` on top. Never green.

**Tracks**

- ProgressBar and Meter tracks use `surface-sunken` with a `border` hairline. `chart-track` was removed in #195 together with the hero ring.

### 2.4 Role → primitive, per mode

Each role points at a primitive. The alpha follows the slash.

| Role | Light | Dark |
|---|---|---|
| `canvas` | `neutral-925` | `neutral-100` |
| `bg` | `neutral-978` | `neutral-150` |
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
| `correction-insert-bg` | `neutral-300 / 0.06` | `neutral-1000 / 0.05` |
| `correction-insert-line` | `neutral-400 / 0.9` | `neutral-780 / 0.85` |
| `glass-base-overlay` | `neutral-1000 / 0.64` | `neutral-200-a / 0.84` |
| `glass-base` | `neutral-1000 / 0.82` | `neutral-205 / 0.88` |
| `glass-border` | `cobalt-320 / 0.14` | `neutral-0 / 0.6` |
| `glass-rim-1` | `neutral-1000 / 0.98` | `neutral-1000 / 0.36` |
| `glass-rim-2` | `neutral-1000 / 0.1` | `neutral-1000 / 0.04` |
| `glass-rim-3` | `neutral-1000 / 0.75` | `cobalt-800 / 0.3` |
| `scrim` | `neutral-300-a / 0.2` | `neutral-50 / 0.55` |

### 2.5 Computed tints

Tints are computed at build time as `color-mix(in oklch, <feedback colour> p%, surface)`, with the surface's powerless hue taking the mark's hue:

| Step | Mix | Use |
|---|---|---|
| `-tint` | 10 % | feedback banners, invalid fields |

They replace the prototype's runtime mixes at 7, 10, 13, 15, 26, 28 and 36 %. Until #195 the verdicts had tints too, plus a `-tint-strong` (15 %) and a `-border` (28 %) step; the calm colour rule removed all three.

| Token | Light | Light sRGB | Dark | Dark sRGB |
|---|---|---|---|---|
| `feedback-danger-tint` | `oklch(0.95 0.019 27)` | `#fbeae8` | `oklch(0.251 0.032 25)` | `#301c1a` |
| `feedback-warning-tint` | `oklch(0.95 0.011 62)` | `#f4ede7` | `oklch(0.26 0.03 80)` | `#2c2213` |
| `feedback-success-tint` | `oklch(0.948 0.012 152)` | `#e8f0ea` | `oklch(0.256 0.032 152)` | `#17281b` |
| `feedback-info-tint` | `oklch(0.947 0.02 265)` | `#e7eefb` | `oklch(0.256 0.027 262)` | `#1c2330` |

### 2.6 All resolved values (OKLCH and sRGB)

The sRGB column is what the email and PDF constants get. Translucent values carry their alpha as the last hex pair. Many mail clients do not render 8-digit hex, so email and PDF must use translucent roles only **pre-composited onto a named backdrop** (see [email-and-pdf.md](email-and-pdf.md)). Values marked ¹ were reduced in chroma to fit sRGB.

| Role | Light | Light sRGB | Dark | Dark sRGB |
|---|---|---|---|---|
| `canvas` | `oklch(0.925 0.012 265)` | `#e2e6ef` | `oklch(0.1 0.01 265)` | `#020306` |
| `bg` | `oklch(0.978 0.007 262)` | `#f5f8fd` | `oklch(0.15 0.017 266)` | `#080b12` |
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
| `correction-insert-bg` | `oklch(0.3 0.03 265 / 0.06)` | `#262e3d0f` | `oklch(1 0 0 / 0.05)` | `#ffffff0d` |
| `correction-insert-line` | `oklch(0.4 0.03 265 / 0.9)` | `#404858e6` | `oklch(0.78 0.012 265 / 0.85)` | `#b4b7bfd9` |
| `glass-base-overlay` | `oklch(1 0 0 / 0.64)` | `#ffffffa3` | `oklch(0.2 0.022 266 / 0.84)` | `#111620d6` |
| `glass-base` | `oklch(1 0 0 / 0.82)` | `#ffffffd1` | `oklch(0.205 0.022 266 / 0.88)` | `#121721e0` |
| `glass-border` | `oklch(0.32 0.06 265 / 0.14)` | `#24325124` | `oklch(0 0 0 / 0.6)` | `#00000099` |
| `glass-rim-1` | `oklch(1 0 0 / 0.98)` | `#fffffffa` | `oklch(1 0 0 / 0.36)` | `#ffffff5c` |
| `glass-rim-2` | `oklch(1 0 0 / 0.1)` | `#ffffff1a` | `oklch(1 0 0 / 0.04)` | `#ffffff0a` |
| `glass-rim-3` | `oklch(1 0 0 / 0.75)` | `#ffffffbf` | `oklch(0.8 0.1 262 / 0.3)` | `#9bbeff4d` |
| `scrim` | `oklch(0.3 0.05 265 / 0.2)` | `#212d4733` | `oklch(0.05 0.01 265 / 0.55)` | `#0000018c` |
| `feedback-danger-tint` | `oklch(0.95 0.019 27)` | `#fbeae8` | `oklch(0.251 0.032 25)` | `#301c1a` |
| `feedback-warning-tint` | `oklch(0.95 0.011 62)` | `#f4ede7` | `oklch(0.26 0.03 80)` | `#2c2213` |
| `feedback-success-tint` | `oklch(0.948 0.012 152)` | `#e8f0ea` | `oklch(0.256 0.032 152)` | `#17281b` |
| `feedback-info-tint` | `oklch(0.947 0.02 265)` | `#e7eefb` | `oklch(0.256 0.027 262)` | `#1c2330` |

Changed by gamut mapping:
- light verdict-correct-mark: oklch(0.56 0.15 152) → oklch(0.56 0.147 152)
- light verdict-not-found-mark: oklch(0.47 0.19 18) → oklch(0.47 0.188 18)
- dark accent: oklch(0.77 0.13 262) → oklch(0.77 0.116 262)
- dark accent-text: oklch(0.8 0.12 262) → oklch(0.8 0.1 262)
- dark accent-tint: oklch(0.77 0.13 262) → oklch(0.77 0.116 262 / 0.11)
- dark accent-glow: oklch(0.77 0.13 262) → oklch(0.77 0.116 262 / 0.32)
- dark focus-ring: oklch(0.8 0.12 262) → oklch(0.8 0.1 262)
- dark verdict-mixed-mark: oklch(0.74 0.18 5) → oklch(0.74 0.167 5)
- dark verdict-doi-conflict-mark: oklch(0.72 0.19 28) → oklch(0.72 0.174 28)
- dark verdict-not-found-mark: oklch(0.7 0.2 20) → oklch(0.7 0.191 20)
- dark feedback-info: oklch(0.8 0.12 262) → oklch(0.8 0.1 262)

## 3. Glass

Glass is the material for **floating layers only**: the top bar, the summary strip while it is sticky, toasts, the detail drawer header, and the ⌘K command bar. Work surfaces are never glass. Since #195 glass is calm: blur, a translucent base and its edges, with no light field, sheen or pointer light.

**Construction, from bottom to top:**

1. **Backdrop filter.** `blur(var(--st-glass-blur)) saturate(var(--st-glass-saturate))`, where `--st-glass-blur: 28px` and `--st-glass-saturate: 1.8`. The scrim under modal glass uses `blur(4px) saturate(1.1)`.
2. **Base fill.** It depends on the variant (see the table below).
3. **Edges.**
   - A 1 px `glass-border` hairline outside.
   - A 1 px refraction rim inside, as a 158° gradient: `glass-rim-1` → `glass-rim-2` at 26 % → transparent at 52 % → `glass-rim-2` at 76 % → `glass-rim-3`.
   - The `shadow-glass` elevation.

**Variants:**

| Variant | Base | Used by |
|---|---|---|
| `glass` | `glass-base` | top bar, sticky summary strip, toasts, detail drawer header |
| `glass-overlay` | `glass-base-overlay` | ⌘K command bar, over the scrim |

`glass-base` took the value of the former `glass-base-strong` (light `oklch(1 0 0 / 0.82)`, dark `oklch(0.205 0.022 266 / 0.88)`). Without a light field the thinner base had nothing left to show through.

**Fallbacks and preferences:**

- **No `backdrop-filter` support:** every variant falls back to opaque `surface`.
- **`prefers-reduced-transparency: reduce`:** the same opaque fallback. Chromium supports this media query since version 118. Firefox and Safari do not as of this writing, so it is a progressive enhancement.
- **`forced-colors: active`:** glass becomes a plain `Canvas` fill with a `CanvasText` 1 px border. There is no rim or shadow.
- **`prefers-reduced-motion: reduce`:** nothing changes; calm glass does not move.
- **Extension side panel:** the same glass as the web app.

## 4. Typography

**Families**

- **UI:** `--st-font-sans: 'Atkinson Hyperlegible Next', ui-sans-serif, system-ui, sans-serif`
- **Evidence:** `--st-font-mono: 'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace`

Both fonts are self-hosted. Web and extension use variable WOFF2, and the PDF uses static TTF cuts with the Noto fallback (see [#184](https://github.com/jeffnawroth/source-taster/issues/184)).

**Weights**

- Sans: 400 regular, 500 medium, 700 bold. (800 heavy was for the hero numerals, removed in #195.)
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

**Overline (eyebrow) labels:** uppercase, `text-2xs` or `text-xs`, weight 600, tracking `--st-tracking-caps: 0.08em`.

**From the prototype:** its roughly 30 sizes between 10.5 and 128 px snap to the nearest step. For example, 10.5 and 11.5 → `2xs`/`xs`, 12.5 and 13 → `sm`, 14 and 14.5 → `base` (controls) or `sm`, 15.5–16.5 → `md`, 18 and 22 → `lg`/`xl`, 26–28 → `xl`/`2xl`, 34 → `2xl`. The 54–128 px hero numerals have no step since #195. The panel and the web use the same steps; only view headings differ (`text-xl` in the panel, `text-2xl` on the web).

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
| `radius-2xl` | 28px | 28 | command bar, sheets, dialogs |
| `radius-full` | 9999px | 99 | buttons, pills, segmented nav |

A nested element's radius is the outer radius minus the padding between them, and never less than `radius-xs`.

**Elevation.** Opaque surfaces have three levels, and glass has its own. The shadow colours are tokens per mode. They are not contrast-gated because they carry no information.

| Token | Light | Dark |
|---|---|---|
| `shadow-flat` | none (border only) | none (border only) |
| `shadow-raised` | `0 1px 2px oklch(0.3 0.06 265 / 0.05), 0 12px 30px -18px oklch(0.3 0.08 265 / 0.2)` | `0 0 0 1px oklch(0 0 0 / 0.45), 0 20px 44px -28px oklch(0 0 0 / 0.9)` |
| `shadow-lifted` (hover, drag) | `0 2px 4px oklch(0.3 0.06 265 / 0.05), 0 26px 50px -24px oklch(0.3 0.1 265 / 0.3)` | `0 0 0 1px oklch(0 0 0 / 0.5), 0 34px 70px -30px oklch(0.35 0.15 266 / 0.45)` |
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
| `z-overlay` (scrim) | 40 |
| `z-command` | 50 |
| `z-toast` | 60 |

## 6. Motion

Motion is CSS-native only: `linear()` springs, `@starting-style` and the View Transitions API, with no animation library (see [#188](https://github.com/jeffnawroth/source-taster/issues/188)).

**Curves:**

| Token | Value | Use |
|---|---|---|
| `ease-spring` | `linear(0, 0.009, 0.035 2.1%, 0.141, 0.281 6.7%, 0.723 12.9%, 0.938 16.7%, 1.017, 1.077, 1.121, 1.149 24.3%, 1.159, 1.163 27%, 1.154, 1.129 32.8%, 1.051 39.6%, 1.017 43.1%, 0.991, 0.977 51%, 0.975 57.1%, 0.997 69.8%, 1.003 76.9%, 1)` | small objects: chips popping in, button press, glyphs |
| `ease-spring-soft` | `linear(0, 0.06 2%, 0.23 5.5%, 0.5 10.5%, 0.75 16%, 0.9 21.5%, 0.985 27%, 1.02 32.5%, 1.03 38%, 1.022 45%, 1.008 55%, 0.999 68%, 1)` | large surfaces: sheets, drawer, dialogs and popovers entering (with `@starting-style`), card → detail |
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

**Reduced motion.** Under `prefers-reduced-motion: reduce`:
- every duration token becomes `0ms`;
- view transitions are skipped;
- count-ups render their final value.

The final state renders directly. Streaming never reorders rows or moves focus, in either mode.

## 7. Contrast gate

### 7.1 What is gated

The gate uses the WCAG 2.2 contrast ratio. APCA is advisory only (see [#185](https://github.com/jeffnawroth/source-taster/issues/185)). Translucent layers are composited source-over in sRGB, as the browser paints them. Every pair is checked in light **and** dark:

- **Text, 4.5:1:**
  - `text`, `text-secondary` and `text-muted` on `bg`, `surface`, `surface-sunken` and `glass-base` over `bg`;
  - `accent-text` on `surface` and `accent-tint`;
  - `on-accent` on `accent` (the flat primary button);
  - each `feedback-*` on `surface` and on its own `-tint`;
  - `text` on `correction-insert-bg`, and `correction-delete-text` on `correction-delete-bg`;
  - `text` and `text-on-glass-secondary` on each glass variant's **worst case**.
- **Glass worst case.** Each variant's base is composited over each backdrop it can float on, and the lowest ratio counts. Blur is not modelled. The backdrops are:
  - for `glass`: `bg`, `surface` and `surface-sunken`;
  - for `glass-overlay`: the scrim over `bg` and over `surface`.
- **Non-text, 3:1:**
  - each `verdict-*-mark` on `surface`, `bg` and each glass variant's worst case (counters in the sticky strip, verdicts in ⌘K results);
  - `accent`, each `feedback-*` and `border-emphasis` on each glass variant's worst case (the Running icon, the strip's progress fill and pressed counters; toast icons; the dashed Status contour and the command-bar field);
  - `focus-ring` on `bg`, `surface`, `surface-sunken`, `accent-tint` and each glass variant's worst case (command-bar options and toast buttons take focus on glass);
  - `on-verdict-mark` on each `verdict-*-mark` (the inner symbol of a filled glyph);
  - `border-emphasis` (input boundary) on `surface`;
  - `correction-insert-line` on `correction-insert-bg`.
- **Also gated, outside the generator:**
  - **Rendered pixels on glass.** An E2E check measures text on glass on rendered pixels (Playwright, transparent-text capture, as in the prototype).
  - **Greyscale glyph test.** The six verdict glyphs at 16 px in greyscale must stay pairwise distinguishable by shape.
  - **axe in E2E** for everything else. axe does not check 1.4.11.

### 7.2 Results

Regenerated on 10 November 2026 from this consolidated seed. These are numerical design checks, not rendered production or accessibility qualification.

| Mode | Foreground | Background | Min | Ratio | |
|---|---|---|---|---|---|
| light | `text` | bg | 4.5 | 17.02 | ✓ |
| light | `text` | surface | 4.5 | 18.13 | ✓ |
| light | `text` | surface-sunken | 4.5 | 16.43 | ✓ |
| light | `text` | glass-base over bg (no blur) | 4.5 | 17.93 | ✓ |
| light | `text-secondary` | bg | 4.5 | 9.81 | ✓ |
| light | `text-secondary` | surface | 4.5 | 10.45 | ✓ |
| light | `text-secondary` | surface-sunken | 4.5 | 9.47 | ✓ |
| light | `text-secondary` | glass-base over bg (no blur) | 4.5 | 10.33 | ✓ |
| light | `text-muted` | bg | 4.5 | 6.41 | ✓ |
| light | `text-muted` | surface | 4.5 | 6.83 | ✓ |
| light | `text-muted` | surface-sunken | 4.5 | 6.19 | ✓ |
| light | `text-muted` | glass-base over bg (no blur) | 4.5 | 6.76 | ✓ |
| light | `accent-text` | surface | 4.5 | 7.20 | ✓ |
| light | `accent-text` | accent-tint (over surface) | 4.5 | 6.40 | ✓ |
| light | `on-accent` | accent | 4.5 | 6.29 | ✓ |
| light | `feedback-danger` | surface | 4.5 | 6.62 | ✓ |
| light | `feedback-danger` | feedback-danger-tint | 4.5 | 5.69 | ✓ |
| light | `feedback-warning` | surface | 4.5 | 6.20 | ✓ |
| light | `feedback-warning` | feedback-warning-tint | 4.5 | 5.35 | ✓ |
| light | `feedback-success` | surface | 4.5 | 6.17 | ✓ |
| light | `feedback-success` | feedback-success-tint | 4.5 | 5.33 | ✓ |
| light | `feedback-info` | surface | 4.5 | 7.20 | ✓ |
| light | `feedback-info` | feedback-info-tint | 4.5 | 6.17 | ✓ |
| light | `text` | correction-insert-bg (over surface) | 4.5 | 16.26 | ✓ |
| light | `correction-delete-text` | correction-delete-bg (over surface) | 4.5 | 8.27 | ✓ |
| light | `text` | glass worst case (surface-sunken) | 4.5 | 17.82 | ✓ |
| light | `text-secondary` | glass worst case (surface-sunken) | (not allowed) | 10.27 | info |
| light | `text-muted` | glass worst case (surface-sunken) | (not allowed) | 6.72 | info |
| light | `text-on-glass-secondary` | glass worst case (surface-sunken) | 4.5 | 8.33 | ✓ |
| light | `verdict-correct-mark` | glass worst case (surface-sunken) | 3 | 4.28 | ✓ |
| light | `verdict-deviations-mark` | glass worst case (surface-sunken) | 3 | 4.00 | ✓ |
| light | `verdict-mixed-mark` | glass worst case (surface-sunken) | 3 | 5.56 | ✓ |
| light | `verdict-doi-conflict-mark` | glass worst case (surface-sunken) | 3 | 5.54 | ✓ |
| light | `verdict-not-found-mark` | glass worst case (surface-sunken) | 3 | 7.43 | ✓ |
| light | `verdict-not-verifiable-mark` | glass worst case (surface-sunken) | 3 | 5.42 | ✓ |
| light | `accent` | glass worst case (surface-sunken) | 3 | 6.18 | ✓ |
| light | `feedback-danger` | glass worst case (surface-sunken) | 3 | 6.51 | ✓ |
| light | `feedback-warning` | glass worst case (surface-sunken) | 3 | 6.09 | ✓ |
| light | `feedback-success` | glass worst case (surface-sunken) | 3 | 6.07 | ✓ |
| light | `feedback-info` | glass worst case (surface-sunken) | 3 | 7.08 | ✓ |
| light | `border-emphasis (over glass)` | glass worst case (surface-sunken) | 3 | 3.45 | ✓ |
| light | `text` | glass-overlay worst case (scrim over bg) | 4.5 | 15.59 | ✓ |
| light | `text-secondary` | glass-overlay worst case (scrim over bg) | (not allowed) | 8.99 | info |
| light | `text-muted` | glass-overlay worst case (scrim over bg) | (not allowed) | 5.88 | info |
| light | `text-on-glass-secondary` | glass-overlay worst case (scrim over bg) | 4.5 | 7.29 | ✓ |
| light | `verdict-correct-mark` | glass-overlay worst case (scrim over bg) | 3 | 3.74 | ✓ |
| light | `verdict-deviations-mark` | glass-overlay worst case (scrim over bg) | 3 | 3.50 | ✓ |
| light | `verdict-mixed-mark` | glass-overlay worst case (scrim over bg) | 3 | 4.86 | ✓ |
| light | `verdict-doi-conflict-mark` | glass-overlay worst case (scrim over bg) | 3 | 4.85 | ✓ |
| light | `verdict-not-found-mark` | glass-overlay worst case (scrim over bg) | 3 | 6.50 | ✓ |
| light | `verdict-not-verifiable-mark` | glass-overlay worst case (scrim over bg) | 3 | 4.74 | ✓ |
| light | `accent` | glass-overlay worst case (scrim over bg) | 3 | 5.41 | ✓ |
| light | `feedback-danger` | glass-overlay worst case (scrim over bg) | 3 | 5.69 | ✓ |
| light | `feedback-warning` | glass-overlay worst case (scrim over bg) | 3 | 5.33 | ✓ |
| light | `feedback-success` | glass-overlay worst case (scrim over bg) | 3 | 5.31 | ✓ |
| light | `feedback-info` | glass-overlay worst case (scrim over bg) | 3 | 6.19 | ✓ |
| light | `border-emphasis (over glass-overlay)` | glass-overlay worst case (scrim over bg) | 3 | 3.26 | ✓ |
| light | `verdict-correct-mark` | surface | 3 | 4.35 | ✓ |
| light | `verdict-correct-mark` | bg | 3 | 4.08 | ✓ |
| light | `verdict-deviations-mark` | surface | 3 | 4.07 | ✓ |
| light | `verdict-deviations-mark` | bg | 3 | 3.82 | ✓ |
| light | `verdict-mixed-mark` | surface | 3 | 5.65 | ✓ |
| light | `verdict-mixed-mark` | bg | 3 | 5.31 | ✓ |
| light | `verdict-doi-conflict-mark` | surface | 3 | 5.64 | ✓ |
| light | `verdict-doi-conflict-mark` | bg | 3 | 5.29 | ✓ |
| light | `verdict-not-found-mark` | surface | 3 | 7.56 | ✓ |
| light | `verdict-not-found-mark` | bg | 3 | 7.10 | ✓ |
| light | `verdict-not-verifiable-mark` | surface | 3 | 5.51 | ✓ |
| light | `verdict-not-verifiable-mark` | bg | 3 | 5.17 | ✓ |
| light | `focus-ring` | bg | 3 | 5.91 | ✓ |
| light | `focus-ring` | surface | 3 | 6.29 | ✓ |
| light | `focus-ring` | surface-sunken | 3 | 5.70 | ✓ |
| light | `focus-ring` | accent-tint (over surface) | 3 | 5.59 | ✓ |
| light | `focus-ring` | glass worst case (surface-sunken) | 3 | 6.18 | ✓ |
| light | `focus-ring` | glass-overlay worst case (scrim over bg) | 3 | 5.41 | ✓ |
| light | `on-verdict-mark` | verdict-correct-mark | 3 | 4.35 | ✓ |
| light | `on-verdict-mark` | verdict-deviations-mark | 3 | 4.07 | ✓ |
| light | `on-verdict-mark` | verdict-mixed-mark | 3 | 5.65 | ✓ |
| light | `on-verdict-mark` | verdict-doi-conflict-mark | 3 | 5.64 | ✓ |
| light | `on-verdict-mark` | verdict-not-found-mark | 3 | 7.56 | ✓ |
| light | `on-verdict-mark` | verdict-not-verifiable-mark | 3 | 5.51 | ✓ |
| light | `border-emphasis (over surface)` | surface | 3 | 3.48 | ✓ |
| light | `correction-insert-line (composited)` | correction-insert-bg (over surface) | 3 | 6.33 | ✓ |
| dark | `text` | bg | 4.5 | 18.04 | ✓ |
| dark | `text` | surface | 4.5 | 16.78 | ✓ |
| dark | `text` | surface-sunken | 4.5 | 17.48 | ✓ |
| dark | `text` | glass-base over bg (no blur) | 4.5 | 16.66 | ✓ |
| dark | `text-secondary` | bg | 4.5 | 11.65 | ✓ |
| dark | `text-secondary` | surface | 4.5 | 10.83 | ✓ |
| dark | `text-secondary` | surface-sunken | 4.5 | 11.29 | ✓ |
| dark | `text-secondary` | glass-base over bg (no blur) | 4.5 | 10.76 | ✓ |
| dark | `text-muted` | bg | 4.5 | 7.64 | ✓ |
| dark | `text-muted` | surface | 4.5 | 7.11 | ✓ |
| dark | `text-muted` | surface-sunken | 4.5 | 7.41 | ✓ |
| dark | `text-muted` | glass-base over bg (no blur) | 4.5 | 7.06 | ✓ |
| dark | `accent-text` | surface | 4.5 | 9.76 | ✓ |
| dark | `accent-text` | accent-tint (over surface) | 4.5 | 8.05 | ✓ |
| dark | `on-accent` | accent | 4.5 | 9.19 | ✓ |
| dark | `feedback-danger` | surface | 4.5 | 7.72 | ✓ |
| dark | `feedback-danger` | feedback-danger-tint | 4.5 | 6.80 | ✓ |
| dark | `feedback-warning` | surface | 4.5 | 11.08 | ✓ |
| dark | `feedback-warning` | feedback-warning-tint | 4.5 | 9.42 | ✓ |
| dark | `feedback-success` | surface | 4.5 | 10.37 | ✓ |
| dark | `feedback-success` | feedback-success-tint | 4.5 | 8.82 | ✓ |
| dark | `feedback-info` | surface | 4.5 | 9.76 | ✓ |
| dark | `feedback-info` | feedback-info-tint | 4.5 | 8.39 | ✓ |
| dark | `text` | correction-insert-bg (over surface) | 4.5 | 14.86 | ✓ |
| dark | `correction-delete-text` | correction-delete-bg (over surface) | 4.5 | 8.10 | ✓ |
| dark | `text` | glass worst case (surface) | 4.5 | 16.48 | ✓ |
| dark | `text-secondary` | glass worst case (surface) | (not allowed) | 10.64 | info |
| dark | `text-muted` | glass worst case (surface) | (not allowed) | 6.98 | info |
| dark | `text-on-glass-secondary` | glass worst case (surface) | 4.5 | 12.52 | ✓ |
| dark | `verdict-correct-mark` | glass worst case (surface) | 3 | 10.26 | ✓ |
| dark | `verdict-deviations-mark` | glass worst case (surface) | 3 | 10.55 | ✓ |
| dark | `verdict-mixed-mark` | glass worst case (surface) | 3 | 7.21 | ✓ |
| dark | `verdict-doi-conflict-mark` | glass worst case (surface) | 3 | 6.73 | ✓ |
| dark | `verdict-not-found-mark` | glass worst case (surface) | 3 | 6.16 | ✓ |
| dark | `verdict-not-verifiable-mark` | glass worst case (surface) | 3 | 7.24 | ✓ |
| dark | `accent` | glass worst case (surface) | 3 | 8.62 | ✓ |
| dark | `feedback-danger` | glass worst case (surface) | 3 | 7.58 | ✓ |
| dark | `feedback-warning` | glass worst case (surface) | 3 | 10.88 | ✓ |
| dark | `feedback-success` | glass worst case (surface) | 3 | 10.19 | ✓ |
| dark | `feedback-info` | glass worst case (surface) | 3 | 9.59 | ✓ |
| dark | `border-emphasis (over glass)` | glass worst case (surface) | 3 | 4.08 | ✓ |
| dark | `text` | glass-overlay worst case (scrim over surface) | 4.5 | 16.91 | ✓ |
| dark | `text-secondary` | glass-overlay worst case (scrim over surface) | (not allowed) | 10.92 | info |
| dark | `text-muted` | glass-overlay worst case (scrim over surface) | (not allowed) | 7.16 | info |
| dark | `text-on-glass-secondary` | glass-overlay worst case (scrim over surface) | 4.5 | 12.84 | ✓ |
| dark | `verdict-correct-mark` | glass-overlay worst case (scrim over surface) | 3 | 10.53 | ✓ |
| dark | `verdict-deviations-mark` | glass-overlay worst case (scrim over surface) | 3 | 10.82 | ✓ |
| dark | `verdict-mixed-mark` | glass-overlay worst case (scrim over surface) | 3 | 7.39 | ✓ |
| dark | `verdict-doi-conflict-mark` | glass-overlay worst case (scrim over surface) | 3 | 6.90 | ✓ |
| dark | `verdict-not-found-mark` | glass-overlay worst case (scrim over surface) | 3 | 6.32 | ✓ |
| dark | `verdict-not-verifiable-mark` | glass-overlay worst case (scrim over surface) | 3 | 7.43 | ✓ |
| dark | `accent` | glass-overlay worst case (scrim over surface) | 3 | 8.85 | ✓ |
| dark | `feedback-danger` | glass-overlay worst case (scrim over surface) | 3 | 7.78 | ✓ |
| dark | `feedback-warning` | glass-overlay worst case (scrim over surface) | 3 | 11.16 | ✓ |
| dark | `feedback-success` | glass-overlay worst case (scrim over surface) | 3 | 10.45 | ✓ |
| dark | `feedback-info` | glass-overlay worst case (scrim over surface) | 3 | 9.83 | ✓ |
| dark | `border-emphasis (over glass-overlay)` | glass-overlay worst case (scrim over surface) | 3 | 4.09 | ✓ |
| dark | `verdict-correct-mark` | surface | 3 | 10.45 | ✓ |
| dark | `verdict-correct-mark` | bg | 3 | 11.23 | ✓ |
| dark | `verdict-deviations-mark` | surface | 3 | 10.74 | ✓ |
| dark | `verdict-deviations-mark` | bg | 3 | 11.55 | ✓ |
| dark | `verdict-mixed-mark` | surface | 3 | 7.34 | ✓ |
| dark | `verdict-mixed-mark` | bg | 3 | 7.89 | ✓ |
| dark | `verdict-doi-conflict-mark` | surface | 3 | 6.85 | ✓ |
| dark | `verdict-doi-conflict-mark` | bg | 3 | 7.36 | ✓ |
| dark | `verdict-not-found-mark` | surface | 3 | 6.27 | ✓ |
| dark | `verdict-not-found-mark` | bg | 3 | 6.74 | ✓ |
| dark | `verdict-not-verifiable-mark` | surface | 3 | 7.37 | ✓ |
| dark | `verdict-not-verifiable-mark` | bg | 3 | 7.93 | ✓ |
| dark | `focus-ring` | bg | 3 | 10.50 | ✓ |
| dark | `focus-ring` | surface | 3 | 9.76 | ✓ |
| dark | `focus-ring` | surface-sunken | 3 | 10.17 | ✓ |
| dark | `focus-ring` | accent-tint (over surface) | 3 | 8.05 | ✓ |
| dark | `focus-ring` | glass worst case (surface) | 3 | 9.59 | ✓ |
| dark | `focus-ring` | glass-overlay worst case (scrim over surface) | 3 | 9.83 | ✓ |
| dark | `on-verdict-mark` | verdict-correct-mark | 3 | 11.09 | ✓ |
| dark | `on-verdict-mark` | verdict-deviations-mark | 3 | 11.40 | ✓ |
| dark | `on-verdict-mark` | verdict-mixed-mark | 3 | 7.79 | ✓ |
| dark | `on-verdict-mark` | verdict-doi-conflict-mark | 3 | 7.27 | ✓ |
| dark | `on-verdict-mark` | verdict-not-found-mark | 3 | 6.65 | ✓ |
| dark | `on-verdict-mark` | verdict-not-verifiable-mark | 3 | 7.82 | ✓ |
| dark | `border-emphasis (over surface)` | surface | 3 | 4.09 | ✓ |
| dark | `correction-insert-line (composited)` | correction-insert-bg (over surface) | 3 | 6.24 | ✓ |

158 gated pairs, 0 failing; 8 informational rows for roles that are not allowed on glass

Tightest gated pairs:
- light `border-emphasis (over glass-overlay)` on glass-overlay worst case (scrim over bg), 3.26 (min 3)
- light `border-emphasis (over glass)` on glass worst case (surface-sunken), 3.45 (min 3)
- light `border-emphasis (over surface)` on surface, 3.48 (min 3)
- light `verdict-deviations-mark` on glass-overlay worst case (scrim over bg), 3.50 (min 3)
- light `feedback-success` on feedback-success-tint, 5.33 (min 4.5)
- light `feedback-warning` on feedback-warning-tint, 5.35 (min 4.5)

## 8. Consolidation and source precedence

The current form incorporates #195: two glass variants, flat primary action, nine type steps, no hero/display/scenery tokens or Verdict tints. Historical change narratives remain on the pinned source branch rather than competing with current rules.

#206 resolves a source mismatch: #195 requires a neutral tracked-change preview, while the seed still used cobalt insertion roles. Both modes now alias insertion background/line values to their existing neutral deletion counterparts, preserving the public role names. Shape (strike versus underline) and accessible inserted/deleted text distinguish changes. Regenerated tables and the contrast gate below describe these actual values. This reconciliation was accepted in ADR-0027 on 10 November 2026; it does not change stored fields or Correction suggestion eligibility.

The translucent rim remains the accepted glass edge treatment; no broad decorative gradient or light field is permitted. The logo gradient belongs to the separately licensed artwork.
