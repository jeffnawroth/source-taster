---
version: alpha
name: Source Taster Landing
description: Public marketing site for Source Taster (Astro, sourcetaster.com) — bilingual EN/DE, light and dark theme.
colors:
  p: "#5b2d8e"
  p-l: "#7b4db8"
  p-d: "#3d1a6b"
  t: "#1a7a7a"
  t-l: "#3fa8a8"
  g: "#2d7a31"
  g-l: "#70c875"
  a: "#d4a030"
  a-l: "#e0b85c"
  bg: "#ffffff"
  bg2: "#f5f5fa"
  bg3: "#eeeef5"
  text: "#1a1a2e"
  text2: "#555570"
  text3: "#8888a0"
  border: "rgba(0, 0, 0, 0.06)"
typography:
  sans:
    fontFamily: "'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
rounded:
  base: 12px
---

## Overview

The Source Taster landing page (`apps/landing`, Astro, deployed at
sourcetaster.com) uses a single global stylesheet
(`src/styles/global.css`) as the one governing source for its visual
system — no Tailwind or component-level design system exists in this
surface. `p` (purple) is the primary brand color; `t` (teal) is a secondary
accent used in the primary gradient; `g` (green) and `a` (gold) are
additional accent roles used sparingly for emphasis and secondary actions.

## Colors

`p`/`p-l`/`p-d` form the primary purple scale (base, lighter, darker).
`t`/`t-l` form a teal secondary scale. `g`/`g-l` and `a`/`a-l` are accent
scales (green, gold), each with a lighter hover/emphasis variant. `bg`/
`bg2`/`bg3` are surface layers from base to most-elevated; `text`/`text2`/
`text3` are foreground layers from primary to most-muted. `border` is a
low-opacity black overlay, not a flat color, so it composites correctly
over any surface layer beneath it.

The primary call-to-action gradient (`.btn-primary`, class `--grad` in
source) runs from `p` to `t` at a 135° angle — not representable as a flat
color token, kept as application guidance here rather than invented into
the token schema.

## Themes

The installed DESIGN.md specification does not yet support theme-aware
token syntax (`themes`/`default-theme` — checked via `npx @google/design.md
spec`, 2026-08-27). The frontmatter above holds the light (default) theme;
dark-theme overrides are preserved here instead of being discarded.

| Token    | Light (default)       | Dark (`[data-theme='dark']`) |
| -------- | --------------------- | ---------------------------- |
| `bg`     | `#ffffff`             | `#0f0f1a`                    |
| `bg2`    | `#f5f5fa`             | `#1a1a2e`                    |
| `bg3`    | `#eeeef5`             | `#222240`                    |
| `text`   | `#1a1a2e`             | `#e8e8f0`                    |
| `text2`  | `#555570`             | `#9090a8`                    |
| `text3`  | `#8888a0`             | `#666680`                    |
| `border` | `rgba(0, 0, 0, 0.06)` | `rgba(255, 255, 255, 0.06)`  |

`p`/`p-l`/`p-d`, `t`/`t-l`, `g`/`g-l`, and `a`/`a-l` are not overridden in
dark mode — the brand and accent colors stay constant across themes; only
surface and foreground layers shift.

## Typography

`sans` (`Noto Sans`, with a standard system-font fallback stack) is the
only named, shared typography token — it is the sole `font-family` value
declared for the whole surface. No shared font-size, weight, or
line-height scale exists in source: headings and body text across
`src/components/*.astro` use one-off literal sizes per component rather
than a named scale, so no `fontSize`/`fontWeight`/`lineHeight` token is
recorded here — recording one would invent a system the source doesn't
have. If a shared heading scale is introduced later, re-run `create-design-
md` to capture it.

## Layout

`.container` centers content at a `1100px` max width with `24px`
horizontal padding — the shared page-width constraint used by every
section. `.section`/`.section-alt` alternate `bg`/`bg2` to separate page
regions without a hard border.

## Elevation & Depth

Two named shadow levels exist in source but aren't representable in the
current token schema (no `shadow`/`elevation` YAML category): `shadow`
(`0 2px 16px rgba(0,0,0,.06)` light / `0 2px 16px rgba(0,0,0,.2)` dark) for
resting elevation, and `shadow-lg` (`0 8px 40px rgba(0,0,0,.08)` light /
`0 8px 40px rgba(0,0,0,.3)` dark) for hover/emphasis states — both scale
in opacity, not just size, between themes.

## Shapes

`rounded.base` (`12px`) is the single shared corner radius — the source
defines only one group-level `--r` token, so it is not split into a
`sm`/`md`/`lg` scale that doesn't exist. Buttons use a smaller `8px` radius
locally (`.btn`), which is a component-local choice, not the shared token —
recorded here as a note, not promoted into the scale.
