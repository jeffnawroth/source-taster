# luminous-claude-2: Source Taster identity, round 2

## Idea
"Luminous", dark-first: near-black blue-grey surfaces, 1 px hairlines, and light that comes *out of the content* (an ice-blue glow behind the hero, verdict tiles glowing faintly in their own colour).
Signature 1, the **light spine**: during the Check a vertical line runs down the feed with one glyph node per reference. Each node lights up as its reference resolves, and the evidence trail unfolds in place.
Signature 2, the Bento summary is built around a **segmented 8-arc dial**: one arc per reference, its verdict glyph on the ring, and six verdict tiles that work as real filter buttons.
Glass (`backdrop-filter`) is used only for the ⌘K command bar and toasts.

## Font and accent
- **IBM Plex Sans** for UI and **IBM Plex Mono** for DOIs, sources, counters and eyebrows. Plex has a technical, slightly warm character and good German coverage. It differs from the Geist/Inter look that most "Linear-like" work defaults to.
- **Accent: ice cyan-blue**, OKLCH hue 228 (dark, `oklch(.82 .12 228)`) and 232 (light, `oklch(.5 .12 232)`). It does not collide with the green / amber / red verdict families. The mark's gradient runs from cyan (hue 205) to blue (hue 245).
- Mark: a gradient disc with a check cut out of it, a crescent highlight, and a handle that reads as both a tasting spoon and a magnifier. The wordmark is "Source" in the text colour and "Taster" in the accent colour.

## Verdicts (glyph + label, distinguishable in greyscale)
| Verdict | Glyph |
|---|---|
| Korrekt | circle + check |
| Existiert, mit Abweichungen | triangle + ! |
| Gemischte Referenz | square split by a diagonal |
| DOI-Konflikt | diamond + × |
| Nicht gefunden | hexagon + slash |
| Nicht verifizierbar | dashed outline circle + – |

Greyscale shots: `summary-web-dark-greyscale.webp`, `summary-360-dark-greyscale.webp`. The deviation view shows "weicht ab" with a `≠` glyph, strikethrough on the old value and an underlined highlight on the new value, so it is never colour-only. The footer states that a result is a finding from the searched sources and not a judgement about the authors.

## Contrast pairs (WCAG, computed from the OKLCH tokens in `_tools/contrast.mjs`; thresholds 4.5 text / 3 non-text)
| Pair | Dark | Light |
|---|---|---|
| text / bg | 17.73 | 17.09 |
| muted (text-2) / surface | 8.78 | 7.75 |
| muted / glow peak (worst case behind hero) | 5.14 | 6.35 |
| accent / surface | 11.02 | 5.72 |
| on-accent / accent (primary button) | 11.36 | 5.72 |
| Korrekt fg / surface · / chip | 11.49 · 8.66 | 5.97 · 4.85 |
| Abweichungen fg / surface · / chip | 11.82 · 8.89 | 6.11 · 5.00 |
| Gemischt fg / surface · / chip | 7.96 · 6.45 | 6.05 · 4.86 |
| DOI-Konflikt fg / surface · / chip | 7.22 · 5.96 | 6.04 · 4.83 |
| Nicht gefunden fg / surface · / chip | 6.89 · 5.76 | 6.45 · 5.16 |
| Nicht verifizierbar fg / surface · / chip | 8.16 · 6.48 | 5.99 · 4.94 |
| control border / surface (non-text 3:1) | 4.05 | 4.27 |
| glass-ink / glass, worst-case backdrop | 8.86 | 11.26 |
| glass-ink-2 / glass, worst-case backdrop | 6.32 | 7.31 |

All glyphs use the verdict foreground colours, so their ratios are the "fg / surface" values (≥ 6.89 dark, ≥ 5.97 light, all above 3:1). The verdict glyphs in the command bar's reference list sit on glass that is 80 % opaque over a scrimmed page, so they inherit roughly those surface ratios. The accent colour is not used for text on glass.

The glass worst case assumes the 80 % glass fill over pure white (dark mode) or pure black (light mode). Real backdrops are darker or lighter than that.

axe-core 4.x run on intake, running, summary, detail (ref 3 and ref 6), brand sheet and command bar, in dark and light, at web and panel width, with reduced motion, using the `wcag2a/aa`, `wcag21aa` and `wcag22aa` tags (so including target-size): **0 violations**.
Separate Playwright sweep with `reducedMotion: 'reduce'` (6 states × 2 widths × 2 themes): 0 running animations or transitions (`document.getAnimations()`), two screenshots 1 s apart are byte-identical, and no interactive element is smaller than 24 × 24 px.

## Interaction notes
- 8 references stream at about 0.7 s intervals. Rows keep their position (measured: row tops constant, no layout shift), focus is never moved, and the completion toast is `role="status"`.
- Springy `linear()` easing; View Transitions API with a shared verdict glyph between the feed, the summary and the detail view.
- `prefers-reduced-motion` renders the final state at once; no animation runs.
- Targets are at least 24 px. The panel (360 px) is a container-query layout: bottom tab bar, a stacked dial, single-column cards and a compact tile grid.
- Toolbar (floating, bottom): theme, web/panel, greyscale, DE/EN, stepper and auto-play. URL params such as `?state=summary&theme=dark&w=360` drive deterministic screenshots.

## Compromises
- The mark is intentionally simple (disc, cut-out check, crescent, handle) so it stays legible at 16 px. A real brand pass would refine the handle and add a monochrome and a favicon-optimised cut.
- The wordmark is live text in Plex Sans (via Google Fonts), not outlined paths.
- Full field-by-field comparison data and the correction text exist only for reference 3, the deviation reference. The other references show the verdict, evidence trail and a shorter detail.
- The `--glass-ink` / `--glass-ink-2` tokens exist because glass sits over arbitrary content and must keep its own text colour independent of the page theme.
- The contrast figures for glows are an approximation (an accent radial gradient composited over `bg`). The measured axe checks agree, but they cannot sample every pixel of a gradient.
- Plex Sans / Mono come from Google Fonts, so a first load without network falls back to system sans/mono.
