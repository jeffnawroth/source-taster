# Brand assets — #199

**Throwaway design exploration. Selection pending. Never submit the prototype screenshots to a store or merge this implementation into production.** Branch: `prototype/199-brand-assets`.

Question: how does the accepted two-drop quotation mark work at small sizes, in browser chrome, in store imagery and in social previews? The identity is fixed; three image compositions are compared within it.

Open `prototype-199.html` directly. It is self-contained, with local fonts/images embedded and no server or network dependency. The gallery has Images, Icons and Export set sections, DE/EN, light/dark, format and story controls. Bottom arrows and Left/Right switch compositions while retaining the other review choices. Selects and editable fields keep their native arrow-key behavior. Review state is carried in the URL; no cookies or browser storage are used.

## What to compare

- **A — Product window:** headline above a generous application capture; the first image shows the panel beside a clearly synthetic document.
- **B — Margin note:** a narrow explanatory column beside a large, intentionally cropped product view. Social previews use a typographic composition without a small unreadable interface.
- **C — Evidence in focus:** a larger crop from the actual capture, paired with its whole-view context. The third story focuses on the field comparison and named evidence.

The three-story set is workspace → overview → evidence. The images are actual captures of accepted #194 D with fixture data, not newly drawn product screens. The document illustration is labelled synthetic. All rendered compositions carry a design-preview notice. DE uses the accepted Sie/neutral-copy voice; EN uses sentence case. There is no price, quality metric, certification, customer logo or live-service claim.

Parameters: `variant=A|B|C`, `lang=de|en`, `theme=light|dark`, `tab=images|icons|inventory`, `kind=screenshot|amo|promo|marquee|social`, `slide=0|1|2`.

## Captured files

- `masters/`: standalone SVG artwork with explicit sRGB asset colours. `favicon.svg` uses the optical cut; `mark.svg` retains the chosen larger artwork. `safari-pinned-tab.svg` is an optional legacy monochrome compatibility export.
- `exports/`: **34 PNG icon exports, one ICO containing 16/32/48 PNG entries, and 66 opaque PNG composition candidates**. `exports/manifest.json` records dimensions, composition state, icon alpha bounds and maskable safety checks. Not every export is a required platform size.
- `manifest-fragments.json`: illustrative Chromium/Firefox icon wiring, kept separate from the real manifest generator. Paths refer to this prototype directory. Firefox `theme_icons.dark` points to artwork for a light toolbar (dark theme text); `light` points to artwork for a dark toolbar.
- `shots/`: 16 actual public-prototype captures at 2× device scale. The field-comparison capture scrolls the existing detail pane, without altering its data. `capture.json` records provenance and CSS/raster dimensions.
- `gamut-mapping.json`: the logo asset mapping and encoded values. Only the drop highlight needed reduced chroma: `oklch(0.93 0.035 262)` → `oklch(0.93 0.033 262)` → `#dce9ff`. Other gradient stops retain their original OKLCH coordinates. No UI-gradient tokens are introduced.
- `export-checks.json` and `verification.json`: captured checks and their limits.

The full screenshot story set is light-mode DE/EN, CWS 1280×800 and AMO 4:3 1280×960. Each also has a dark overview comparison. Every composition has DE/EN light/dark 1200×630 social candidates. CWS small/marquee promo candidates are 440×280 and 1400×560 with the same short English copy, because CWS promo tiles cannot be localized.

## Reproduce

From the repository root, with the repository's existing Playwright tooling installed:

```sh
pnpm --filter @source-taster/extension prototype:brand:capture
pnpm --filter @source-taster/extension prototype:brand
pnpm --filter @source-taster/extension prototype:brand:export
```

The middle command alone rebuilds the self-contained gallery and SVG masters from the captured images, using only Node. The capture/export commands accept `SOURCE_TASTER_PLAYWRIGHT_MODULE` as an absolute module path when using an existing scratch Playwright installation; no runtime dependency is added. PNG compositions use the same `art.mjs` as the live review. The generator's ICO is a real multi-entry container, not a renamed PNG. PNG entries target contemporary browsers; no historical ICO decoder matrix is claimed.

## Boundaries and implementation handoff

Primary-source requirements and uncertainties are in `docs/research/brand-asset-requirements.md`. In particular, CWS store padding is not toolbar padding; AMO's current source contains conditional 4:3 constraints whose deployed flag is unverified; Meta's 1200×630 is a recommendation, not an Open Graph mandate; current X Card guidance was not verified. No storefront upload, featuring eligibility or native browser-toolbar selection was tested. Edge, maskable web-app and archived Safari exports are optional candidates, not new product commitments.

The maskable export is opaque. The essential mark occupies a centered square of 55% of the canvas, whose corners lie within the W3C 40%-radius safe circle. Apple touch artwork is opaque and square, letting the OS apply its own mask. The CWS icon's painted bounds are 96×96 at a 16 px inset on its 128×128 canvas.

The chosen mark retains its own gradient and highlights as brand artwork. Product UI and composition backgrounds stay neutral, without decorative fields or glows. This branch does not change the public/private license boundary, production manifest generator, website head, app behavior or legal publication gates. Brand artwork remains outside the code-package license decision; font licenses and provenance accompany the embedded files.

Once the owner chooses the image direction and icon applications, record the decision in #199 and #181. Carry the sizes, source masters, capture/copy policy and unresolved live-store checks into the final design-system synthesis and implementation issues. Replace every demo capture with a truthful capture of the current qualified product before publication, removing the design-preview label only then.
