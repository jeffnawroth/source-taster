# glass-claude — "Glass", light-first

## Idea
A bright, airy, near-white base: no panel carries colour. The colour lives in one slow field (three soft radial lights, 46 s drift) that shows **only through the floating glass layers** — the ⌘K command bar, the summary's lifted hero tile, toasts, the pager dock, the brand sheet. Everything else is opaque, hairline-bordered and quiet; evidence and IDs are mono. The Bento summary is the signature: one glass "lens" tile with the big "3" / "von 8 korrekt" ring, surrounded by flat tiles that double as per-verdict filter entry points. Dark mode is not an inversion: a deep ink base with a cobalt/violet field, and a more opaque glass so text never sits on a bright patch.

## Choices
- **Font:** Atkinson Hyperlegible Next (UI, 400–800) + IBM Plex Mono (evidence, IDs, labels). Chosen for character legibility (1/l/I, 0/O) on DOIs and years.
- **Accent:** cobalt, OKLCH hue ~264 (light `oklch(0.5 0.2 264)`, dark `oklch(0.77 0.13 262)`). Verdict hues sit at 152 / 68(85) / 5 / 28 / 18 / neutral, so the accent never collides with a verdict.
- **Mark:** glass tile holding a closing quote made of two drops; the second drop is half-transparent ("the sample, judgement pending"). Legible at 16 px.
- **Verdict glyphs (distinct silhouette + text label always):** Korrekt = filled circle + check · Existiert mit Abweichungen = diamond + "≠" · Gemischte Referenz = hexagon + two linked rings · DOI-Konflikt = rounded square + broken link · Nicht gefunden = outline magnifier + × · Nicht verifizierbar = dashed ring + "?". The three reds (hue 5 / 28 / 18) are hexagon / square / magnifier and survive greyscale (`shots/summary-web-light-greyscale.webp`). Summary wording frames them as "Befunde, keine Beweise".
- **Deviations not colour-only:** `≠ weicht ab` tag in the field column + wavy underline + tint on the differing characters.

## Contrast (computed from live OKLCH tokens, WCAG relative luminance)
Light (bg `oklch(.978 .007 262)`, surface white):
- ink 17.0:1 on bg · ink-2 9.8 · ink-3 6.4 (6.8 on surface) · accent 5.9
- Verdict glyph vs surface (non-text ≥3): ok 4.3 · diff 4.1 · mixed 5.7 · doi 5.6 · miss 7.5 · unk 5.5 (vs bg ≥3.8). White mark on those fills = same ratios.
- Primary button, white on gradient: 5.0 (top) / 7.2 (bottom)
- `--line-strong` (paste/drop boundary), composited: 3.47 over surface, 3.39 over bg
Dark (bg `oklch(.145 .016 265)`, surface `.19`):
- ink 18.2 · ink-2 11.3 · ink-3 7.4 · accent 9.4 on bg
- Verdict glyphs vs surface: ok 10.6 · diff 10.8 · mixed 7.2 · doi 6.6 · miss 5.8 · unk 7.4; dark mark on fills ≥7.0
- Primary button text on gradient: 11.2 / 7.6; `--line-strong` 4.1 over surface

**Glass, pixel-sampled.** Screenshot with all text hidden, minimum text-vs-pixel ratio over each text box, taken at **three field positions** (the 0 %, 50 % and 100 % `field-drift` keyframes forced on `:root`); worst of the three:
- Light: hero eyebrow 8.2 · big number 13.9 · label 13.8 · legend 8.1 · cmd input 12.2 · cmd placeholder (ink-2) 7.0 · cmd group label 6.8 · cmd option 10.2 · cmd counts 6.1 · cmd footer 6.1 · toast 11.8 · dock buttons 16.1
- Dark: hero eyebrow 7.4 · big number 13.4 · label 13.1 · legend 8.4 · cmd input 10.8 · cmd placeholder (ink-2) 6.8 · cmd group label 6.9 · cmd option 6.2 · cmd counts 5.8 · cmd footer 6.9 · toast 10.0 · dock buttons 11.0
Text on the tinted tiles (verdict-tinted pills, accent button, correction block): min 5.4:1 (light "Abweichung ansehen", white on accent, 5.36); correction block 12.7 light / 11.9 dark.
Lowest measured text-on-glass ratio overall: 5.8:1. (Sampling is on screenshots with the backdrop blur applied; the mesh positions are three samples of a continuous drift, not an exhaustive sweep.) The brand sheet also computes its palette ratios live from computed CSS.

## Other checks (measured)
- No horizontal overflow and no interactive target < 24×24 px at 360 px **and** at 1280, in DE and EN, across intake / running / summary / detail / brand (scan found none, including the finished-run state with the 32 px "Zusammenfassung" button). No `undefined`/`NaN`/`${` in rendered text in either language.
- Panel mode (`w=panel`) also works inside a 1280 viewport (container queries on `.app`) — `shots/summary-panel-light.webp`.
- `prefers-reduced-motion: reduce`: field drift, lift and spring/View-Transition morph off, spinner static, check resolves instantly (all 8 rows + trails shown, 0 running animations measured, no console errors). Normal motion: rows never reorder, trails reserve their space (zero layout shift), focus is never moved.
- Click-through flow (Playwright: intake → check → summary → filter → detail → copy correction → pager → toggles → brand sheet open/Esc) ran with no page errors / console errors / unhandled rejections. At end of run a persistent "Zusammenfassung" button appears next to the counter (the toast is only a secondary route). Copy falls back to a textarea/execCommand path when `navigator.clipboard` is rejected (file://).
- Keyboard: ⌘K / Ctrl+K opens the command bar (combobox + listbox ARIA, ↑↓ ↵ esc); visible 2 px focus ring on all controls.
- Browsers without `backdrop-filter` fall back to the opaque `--glass-strong` base.

## Compromises / honest gaps
- Light verdict amber (`oklch(.6 .13 68)`) is the tightest pair: 4.1:1 as a non-text glyph (passes 3:1); it is never used as text colour — the label is always ink.
- Evidence-trail sentences are German only; the EN toggle translates chrome, verdict names, labels and the summary.
- The correction highlight uses a green tint for "changed in the proposal". That is a diff convention, not a verdict; the real design may want a neutral/accent tint so it can't read as "Korrekt".
- The detail pager dock is a floating glass bar that overlays content at normal viewport heights (sticky, bottom).
- Dark glass is deliberately more opaque than light to stay ≥4.5:1 under the brightest patch, which costs a little see-through.
- In panel mode the hero ring is fixed-size, so a little air remains around it.
- History/Account are stubs; filters are client-side; the sample list is canned with a deterministic 0.7 s schedule (`?t=` freezes it).

## Prototype controls
Floating dark dev bar (clearly not design): state jumper, theme, width (web 1280 / panel 360), greyscale, DE/EN, brand sheet. URL params: `s=intake|running|summary|detail|brand`, `theme`, `w=web|360|panel`, `grey=1`, `lang`, `f=<verdict>`, `ref=<id>`, `cmd=1`, `t=<sec>`, `still=1`, `chrome=0`.

## Files
`index.html` (single file; Google Fonts is the only external request) and `shots/` (19 PNGs, `<state>-<width>-<theme>.webp`: intake/running/summary/detail × web light+dark and 360 dark; `summary-web-light-greyscale.webp`, `brand-web-light.webp`, `command-web-light|dark.webp`, `summary-panel-light.webp`, `detail-web-light-en.webp`). Shots use `chrome=0` (dev bar hidden); `prototype-controls-web-light.webp` shows the dev bar.
