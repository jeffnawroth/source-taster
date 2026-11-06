# WCAG 2.2 AA colour system with verdict colours that survive light, dark and greyscale — wayfinder #185

Research retrieved **6 November 2026** for [#185](https://github.com/jeffnawroth/source-taster/issues/185), part of map [#181](https://github.com/jeffnawroth/source-taster/issues/181).
Planning evidence only: nothing was installed or added to the repository. The numbers in section 5 come from a throwaway script (sRGB/OKLab maths, WCAG 2 contrast formula, Machado 2009 CVD matrices) and are an **illustration of method, not a chosen palette**. The brand direction (#182–#184) is still open.
The predecessor repository was not read.

## Answer in brief

1. **Conformance target is WCAG 2.2 AA, measured with the WCAG 2 contrast ratio.** WCAG 3 is a Working Draft whose contrast algorithm is explicitly "yet to be determined"; APCA is not part of it today. Use APCA (or Lc) only as an advisory second opinion for dark mode, never as the acceptance gate.
2. **Three normative checks decide the system**: 4.5:1 for text (1.4.3), 3:1 for icons/status glyphs/focus rings/control boundaries (1.4.11), and "colour is not the only means" (1.4.1). Verdict colour is a *redundant* channel by construction; the gate for FA-ERG-03 is glyph shape plus text label, not hue.
3. **Build the scales in OKLCH, ship semantic tokens.** Author primitive scales as literal `oklch()` values, generated and checked by a build-time script (Culori or Color.js, both open, both implement WCAG 2 contrast and gamut mapping). Components only ever see semantic tokens (`--verdict-correct-bg/-fg/-icon/-border`, `--surface`, `--text`, ...), never scale steps.
4. **Light/dark via `color-scheme` plus token overrides**, exposed to Tailwind 4 with `@theme inline`. Switching the theme then changes variables only; there are no `dark:` utilities in components.
5. **Greyscale is a design property you must create, not inherit.** Our experiment shows that if every verdict is tuned to the same contrast against the same surface, all four collapse to the *same grey* (OKLab L differences 0.0–0.5 of 100). A deliberate lightness ladder between the four verdict icons gives 4–22 points of lightness difference while every pair still passes 3:1. Even so, the red/green pair stays weak under protanopia (ΔE_OK 2.8–5.5), which confirms that **shape and text are the real discriminators**, with lightness as a secondary aid.
6. **Six verdicts, four colours.** Three verdicts share red and currently share one glyph (`✕`). Colour and glyph cannot separate them; only the label can. That is compatible with FA-ERG-03 (the criterion is about the four colours) but the design system should give each red verdict its own glyph or pattern if scanning speed matters (decision for the identity work, not for this ticket).

## 1. Governing requirements

- Verdict table, [requirements v3.3 section 8.4][req]: Correct = green, Exists with deviations = yellow, Mixed citation / DOI conflict / Not found = red, Not verifiable = grey.
- FA-ERG-03: "title, verdict (color, icon and text, never color alone) and a short explanation. ... In greyscale, all verdicts remain distinguishable." Acceptance is stated per verdict (six), not per colour.
- FA-UEB-04: WCAG 2.2 AA for all interfaces; evidence is a documented self-assessment with an automated check and keyboard/screen-reader tests.
- Map #181 standing constraints: light and dark following the system with a switch in Preferences (ADR-0023); everything bundled locally in the extension; ADR-0002 maturity rule (no pre-1.0 dependency) applies to design tooling that ships.

## 2. What WCAG 2.2 requires

All quotations from [WCAG 2.2][wcag22] (W3C Recommendation, 12 December 2024, also the current "latest" version at retrieval) unless marked.

| SC | Level | Rule | Consequence here |
| --- | --- | --- | --- |
| 1.4.1 Use of Color | A | "Color is not used as the only visual means of conveying information, indicating an action ..." | Verdict needs a second cue. [Understanding 1.4.1][u141] lists text cue (G14/G205) and additional visual cues (G182) as sufficient techniques; a 3:1 luminance difference counts only for the text-link technique (G183). It also says that where users must tell colours apart accurately, an additional indicator is needed *regardless* of contrast ratio. |
| 1.4.3 Contrast (Minimum) | AA | Text and images of text at least 4.5:1; large text 3:1; inactive-component text, decoration, logotypes exempt. | Badge text, explanation text, counts in the summary. [Understanding 1.4.3][u143]: values are not rounded (4.499:1 fails); setting a text colour without a background colour is a failure (note 4); user-agent colour changes need not be evaluated. |
| 1.4.11 Non-text Contrast | AA | UI components and graphical objects "at least 3:1 against adjacent color(s)". | Verdict icons used without adjacent text are graphical objects needing 3:1 ([Understanding 1.4.11][u1411]); input borders, focus rings, selected states likewise. Browser-default focus is exempt, our custom `outline` is not. |

Contrast ratio definition (WCAG 2.2 glossary): `(L1 + 0.05) / (L2 + 0.05)` with relative luminance `0.2126 R + 0.7152 G + 0.0722 B`, R/G/B linearised from sRGB with the 0.04045 threshold.

Notes:

- Because the verdict also appears as text next to the glyph, strictly the glyph is accompanied by an adjacent label; [Understanding 1.4.11][u1411] does not state whether that exempts the glyph. Treat the glyph as needing 3:1 (what the experiment does) and the question as not worth the risk.
- Hover styles need not meet 3:1 ([Understanding 1.4.11][u1411]); focus and selected states do.
- WCAG 2 has no requirement for greyscale or for specific colour-vision deficiencies. FA-ERG-03 is therefore **stricter than WCAG** and has to be verified separately (section 6).

## 3. WCAG 2 vs APCA vs WCAG 3 in November 2026

- **WCAG 3.0** is a W3C **Working Draft dated 10 September 2026** ([WD][wcag3]). It "is a draft document and may be updated, replaced, or obsoleted at any time." On contrast it says: "The contrast algorithm used in WCAG 3 is yet to be determined"; the minimum requirement is written as "meets @@[contrast measure to be determined]". Editor's notes: the draft assumes an algorithm with a size/weight factor, and a separate requirement may be needed for red/green colour-vision deficiency if the algorithm does not cover it. It names neither APCA nor any other algorithm in the normative text read.
- The same draft states WCAG 3 does not deprecate WCAG 2 and that WCAG 2.2 A/AA is "expected to meet most of the minimum conformance level" of WCAG 3, with other countries requiring WCAG 2 "for a long time".
- **APCA** is maintained by Myndex; the [apca-w3 repository][apca] calls it "being evaluated as a replacement for WCAG 2 contrast math", algorithm version 0.0.98G-4g (15 Feb 2021), library 0.1.9 beta (3 Jul 2022), licensed "to the W3/AGWG ... with specific limitations and exclusions". [Color.js][colorjs-contrast] ships it (v0.0.98G-4g) and also says it is "being evaluated". Third-party reports (not primary) say APCA was dropped from the WCAG 3 draft in 2023–2026; the primary evidence we have is only that the draft leaves the algorithm undefined.
- APCA's criticism of WCAG 2 is real but not an acceptance route: the author's own [overview][apca-why] argues WCAG 2 "far overstates contrast for dark colors" and cannot guide dark mode reliably, and it is the author's opinion, not W3C's.
- **Consequence:** the legally and procedurally relevant yardstick (FA-UEB-04) is WCAG 2.2. Because WCAG 2 over-rates dark-on-dark pairs, give dark-mode text a safety margin (the experiment targets 7:1 for badge text, 4.5:1 is the floor) and optionally log APCA Lc as a non-gating diagnostic. Radix Colors, for instance, calibrates its steps with APCA ([Radix scale docs][radix]: steps 11/12 reach Lc 60/90 on step 2), which means *a Radix scale is not automatically WCAG 2 AA*: it must still be re-measured.
- Re-check when WCAG 3 reaches Candidate Recommendation; nothing needs a decision before then.

## 4. Colour model and token architecture

### OKLCH for authoring

[CSS Color 4][css4] (Candidate Recommendation Draft, 3 Nov 2026) defines `oklch()` as the cylindrical form of Oklab; its HSL comparison shows OKLCH lightness tracks visual lightness (blue 0.452 vs yellow 0.968, where HSL says both 50 %), which is what makes a lightness ladder (section 5) controllable. Out-of-gamut colours are "CSS gamut mapped" to a lower-chroma colour for display, so a scale authored in wide chroma must be checked **after** mapping to sRGB, since WCAG 2 contrast is defined on sRGB. Tailwind's own default palette is already authored in `oklch()` ([Tailwind theme docs][twtheme]).

### Three layers

1. **Primitive scales** (e.g. `green-1..12`, `amber-*`, `red-*`, `neutral-*`, plus the brand hue): literal `oklch()` values, generated and verified by script, never referenced by components.
2. **Semantic tokens**: `--surface`, `--surface-raised`, `--text`, `--text-muted`, `--border-strong`, `--focus-ring`, and per verdict `--verdict-<name>-{bg,fg,icon,border}`. Each is defined per mode and carries a contrast contract in a comment or test (`fg on bg >= 7`, `icon on bg >= 3`, `icon on surface >= 3`).
3. **Component aliases** (badge, chip, summary tile), only where a component needs a non-obvious pairing.

Four verdict *families* (green, amber, red, neutral) rather than six: the three red verdicts share tokens and differ by label and glyph.

Radix's 12-step roles ([docs][radix]: 1–2 backgrounds, 3–5 component states, 6–8 borders, 9–10 solid, 11–12 text) are a good template for step meanings; copying the *roles* is useful even if the values are regenerated.

### Tailwind CSS 4 integration

Facts from the [Tailwind theme][twtheme], [dark mode][twdark] and [compatibility][twcompat] docs:

- `@theme { --color-* }` creates colour utilities; `--color-*: initial` clears the default palette; `--*: initial` clears everything.
- `@theme inline` makes the generated utility hold the referenced value (`var(--x)`) rather than resolving where it is defined; this is the documented way to alias variables that change per mode.
- Dark mode defaults to `prefers-color-scheme`; a manual switch uses `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))`; the three-way (light/dark/system) switch needs a small head script to avoid a flash.
- Tailwind 4 targets Chrome 111, Safari 16.4, Firefox 128. Our extension manifests (Chrome side panel 114+, [extension-platform.md](extension-platform.md)) are compatible with that floor.

Recommended wiring (sketch):

```css
@import "tailwindcss";

/* Preferences: data-theme="light" | "dark"; absent = follow system (ADR-0023). */
:root { color-scheme: light dark; }
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"]  { color-scheme: dark; }

:root {
  --surface: oklch(0.985 0.003 250);
  --verdict-correct-bg:   oklch(0.96 0.042 150);
  --verdict-correct-fg:   oklch(0.43 0.075 150);
  --verdict-correct-icon: oklch(0.42 0.116 150);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --surface: oklch(0.175 0.012 255);
    --verdict-correct-bg:   oklch(0.26 0.045 150);
    /* ... */
  }
}
:root[data-theme="dark"] { /* same values as the media block */ }

@theme inline {
  --color-surface: var(--surface);
  --color-verdict-correct-bg:   var(--verdict-correct-bg);
  --color-verdict-correct-fg:   var(--verdict-correct-fg);
  --color-verdict-correct-icon: var(--verdict-correct-icon);
}
```

Components then use `bg-verdict-correct-bg text-verdict-correct-fg`, with no `dark:` variants. The two dark blocks are generated from one source by the build script so they cannot drift. This lives once in `packages/ui` (shared by `apps/web` and `apps/extension`) and the website imports the same token file; today three stylesheets each hard-code their own hex values.

**`light-dark()` as an alternative.** `light-dark(<light>, <dark>)` is in [CSS Color 5][css5] (Working Draft 29 Oct 2026, so not yet a CR), is [Baseline 2024][mdn-ld], and follows the used `color-scheme`, which makes a manual switch just a `color-scheme` change and removes the duplicated dark block. MDN's page read did not list versions; from memory it arrived in Chrome 123, Firefox 120 and Safari 17.5 (**unverified here, check caniuse**). Chrome 114–122 would lack it while still supporting the side panel, so use it only if the extension's minimum Chrome is raised (decision for the extension build, not this ticket) or gate with a fallback. Relative colour syntax (`oklch(from var(--x) calc(l - .1) c h)`) is also CR-track; keep it out of the *verified* tokens and use it only for non-critical states, because every computed value would otherwise escape the contrast check.

Do not use Tailwind opacity modifiers (`bg-red-500/20`) on verdict tokens: the resulting colour depends on what is underneath and escapes the pre-computed contrast contract.

### Current state of the repository (observed)

- `apps/web` and `apps/extension` import Tailwind and set one light palette in `:root`; `apps/website` is plain CSS with a different palette; no `@theme`, no dark mode.
- Verdicts are mapped in `packages/ui/src/reference-outcome.tsx` to a glyph, a stock Tailwind text class and a message key: `✓ green-900`, `△ amber-950`, `✕ red-900` (three verdicts), `? slate-700`. So colour + glyph + text already exist; three red verdicts share `✕`.
- Measured now: focus ring `#0f766e` on `#f8fafc` is 5.23:1, site focus `#a23816` on `#fcfcf8` 6.56:1, `.check-comparison` border `#94a3b8` on white only 2.56:1 (matters only if that border is the sole boundary of an input; for a table rule it is not a 1.4.11 component).

## 5. Illustration: a verdict family that works in both modes

Method (script, not committed): for each of four families fix a hue and chroma; build a tinted badge background (OKLCH L 0.96 light / 0.26 dark); solve foreground lightness for **7:1** on the badge background; place the icon colour on a **lightness ladder** with every icon at least 3.0:1 on its badge background and on the page; gamut-map to sRGB by reducing chroma; measure WCAG 2 contrast, greyscale lightness and CVD distance.

Light page `#f9fafc`, dark page `#0d1116`:

| Family | Light bg | Light fg (ratio) | Light icon (L) / ratio on bg | Dark bg | Dark fg (ratio) | Dark icon (L) / ratio on bg |
| --- | --- | --- | --- | --- | --- | --- |
| Correct (hue 150) | `#dffae3` | `#2f5c3a` 7.0 | `#005e28` (0.42) 7.2 | `#122a18` | `#97b79c` 7.0 | `#25984d` (0.60) 4.1 |
| Exists, with deviations (80) | `#fff0d7` | `#664d20` 7.0 | `#b68100` (0.64) 3.04 | `#2f220a` | `#bfab8c` 7.0 | `#fac053` (0.84) 9.4 |
| Red (27) | `#ffedeb` | `#813d37` 7.0 | `#be2323` (0.52) 5.4 | `#391a17` | `#d6a099` 7.0 | `#f75e54` (0.68) 5.0 |
| Not verifiable (255, chroma 0.012) | `#eff2f6` | `#4f5255` 7.0 | `#7b8187` (0.60) 3.5 | `#212429` | `#acaeb1` 7.0 | `#acb2b9` (0.76) 7.2 |

Findings:

- **Same-contrast scales collapse in greyscale.** First pass, all icons solved to exactly 3.2:1 against their tints: OKLab-L of the four icons differed by 0.0–0.5 points in light mode (0.1–0.8 dark). Greyscale then shows four identical grey marks.
- **A ladder fixes luminance, not hue.** With the ladder above (light: correct 0.42, red 0.52, not-verifiable 0.60, deviation 0.64; dark mirrored upward) pairwise greyscale lightness differences were 3.6–20.3 (light) and 4.1–22.0 (dark). The weakest pairs are deviation/not-verifiable (3.6 light) and correct/red (6.5 light, 4.1 dark). Widening those gaps costs the 3:1 floor (light amber is already at 3.04:1) — the achievable range is narrow, so luminance can only ever be a hint.
- **CVD (Machado 2009, severity 1.0, linear RGB; distance ΔE_OK x100):** correct/red under protan 2.8 (light) / 5.5 (dark) and under deutan 12.5 / 10.0; deviation/red under deutan 11.8 / 16.0. Correct vs red is effectively one colour for protanopes; the ladder rescues part of it (6.5 L points) but the glyph must carry the rest.
- Dark-mode amber is naturally the lightest and light-mode amber the hardest to keep at 3:1; expect the brand direction to need a more orange/brown amber in light mode or a darker tint.
- The dark foreground result used lightness 0.75 for 7:1 on the tint; pure white was never needed, which avoids the glare of `#fff` on dark surfaces.
- Limits of this experiment: simple matrices rather than a spectral model, one hue per family, no brand colour, no hover/pressed states, no check of text on `--surface` for muted copy, and the maths is mine. Verify any real palette with the tools below.

## 6. Making FA-ERG-03 testable

FA-ERG-03's acceptance wording ("in greyscale, all verdicts remain distinguishable") needs a definition before it can be a test. Proposal for the design-system ADR:

1. **Primary discriminator, non-colour**: every verdict has a unique text label (already required by FA-ABG-11) and a glyph; red verdicts additionally get distinct glyph/shape if the identity work wants colour-level scanning speed.
2. **Secondary discriminator, luminance**: the four verdict icon colours keep a minimum pairwise lightness gap in each mode (illustrative threshold 4 OKLab-L points x100 from this run; to be set by the palette and checked in CI).
3. **Pairwise CVD floor**: no two verdict *families* below an agreed ΔE_OK under protan/deutan/tritan simulation *unless* the pair also differs by glyph (satisfied for all pairs; this makes the check a regression guard, not a blocker).
4. Manual check: the screenshots of the result list rendered with a greyscale filter and the browser vision-deficiency emulation, attached to the self-assessment.

## 7. Tooling

| Need | Option | Evidence | Fit |
| --- | --- | --- | --- |
| Convert, gamut-map, contrast, ΔE | **Color.js** | [Docs][colorjs-contrast]: WCAG21, APCA, Michelson, Weber, Lstar, DeltaPhi via `color.contrast(other, "WCAG21")`; implements CSS Color 4 spaces | Best single dependency for a *build-time* script; devDependency only, nothing ships. Check version/licence/maturity before adding (not read here). |
| Same, lighter | **Culori** | [Site][culori]: all CSS Color 4 formats, differences, interpolation, tree-shakeable, v4.0.2. The page did not list individual functions; confirm `wcagContrast`, `toGamut`, CVD filters in the API reference before relying on them. | Alternative; version number read from the site header. |
| Generate scale by target contrast | **Adobe Leonardo** `@adobe/leonardo-contrast-colors` | [Repo][leonardo]: generates colours for target contrast ratios, Apache-2.0, WCAG 2.1 only (no APCA/WCAG 3 mention in the read). | Useful for authoring; its output is "slightly higher than the target" and RGB-limited, so re-verify with the project's own script anyway. |
| Reference scale layout | **Radix Colors** | [Docs][radix]: 12-step roles, light/dark pairs, APCA-calibrated | Use as a *model* and licence-check before copying values; contrast is APCA-based, so re-measure under WCAG 2. |
| Page-level check | **axe-core** `color-contrast` | [Rule][axe]: SC 1.4.3 only (4.5/3), 1.4.11 not mentioned; misses background images, gradients, pseudo-elements, overlaps and reports 1:1 as incomplete | Necessary, not sufficient: add the token-contract test for non-text pairs. |
| Visual check | Chrome DevTools | [Rendering tab][dt-emulate] emulates `prefers-color-scheme` and `forced-colors`; the vision-deficiency emulator exists ([a11y reference][dt-a11y]) but the pages read did not list its modes | Manual checks for the self-assessment. |

Practical pipeline (proposal): a `tokens` source file (OKLCH primitives + semantic maps) → a Node script that gamut-maps, **asserts the contrast contracts** (text 4.5/7, non-text 3, pairwise greyscale and CVD floors) and emits the CSS above → a unit test that fails on regressions → axe in the Playwright/E2E checks already needed for FA-UEB-04. Forced-colors (Windows High Contrast) should also be walked through; badges that rely on background tints must keep a border so they survive `forced-colors: active` (system colours replace authored ones).

## 8. Open points and risks

- Brand hue, neutral temperature and chroma are still undecided (#182–#184); the families here must be re-derived, not copied.
- Whether the three red verdicts get distinct glyphs is an IA/identity decision; this research only shows that colour cannot separate them.
- Minimum Chrome version for the extension decides whether `light-dark()` is usable without a fallback.
- Tool choice (Color.js vs Culori) needs the ADR-0002 maturity check (version, release cadence, licence) at adoption time; both are build-time only.
- PDF report (#105) and emails (#191 depends on this): neither supports CSS variables or `light-dark()` reliably. Emit the resolved sRGB hex of the light tokens from the same source; this research did not verify email-client or PDF handling.
- WCAG 3 contrast may change the measurement later; the token-contract script isolates that change to one function.

[req]: ../requirements-specification.md
[wcag22]: https://www.w3.org/TR/WCAG22/
[u141]: https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
[u143]: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
[u1411]: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
[wcag3]: https://www.w3.org/TR/wcag-3.0/
[apca]: https://github.com/Myndex/apca-w3
[apca-why]: https://git.apcacontrast.com/documentation/WhyAPCA
[colorjs-contrast]: https://colorjs.io/docs/contrast
[culori]: https://culorijs.org/
[leonardo]: https://github.com/adobe/leonardo
[radix]: https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale
[css4]: https://www.w3.org/TR/css-color-4/
[css5]: https://www.w3.org/TR/css-color-5/
[mdn-ld]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark
[twtheme]: https://tailwindcss.com/docs/theme
[twdark]: https://tailwindcss.com/docs/dark-mode
[twcompat]: https://tailwindcss.com/docs/compatibility
[axe]: https://dequeuniversity.com/rules/axe/html/4.10/color-contrast
[dt-emulate]: https://developer.chrome.com/docs/devtools/rendering/emulate-css
[dt-a11y]: https://developer.chrome.com/docs/devtools/accessibility/reference
