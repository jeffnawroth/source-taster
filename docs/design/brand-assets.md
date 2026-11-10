# Brand asset exploration

Selection pending for #199, part of design-system map #181. Source: branch `prototype/199-brand-assets`, `apps/extension/prototype/brand/prototype-199.html`. This records review candidates, not production publication approval.

## Shared icon family

Keep the accepted two-drop quotation mark. Use its existing simplified optical cut at 16–32 px, without fine rim/sheen detail, and the full artwork at 48 px and above. A monochrome version retains the filled first drop and outlined second drop, with a stronger outline at small sizes. Chromium gets a color default suitable for light and dark chrome; Firefox gets explicit dark artwork for light toolbars and light artwork for dark toolbars. `theme_icons` names refer to theme text, so `dark` maps to the on-light file and `light` to the on-dark file.

Map the asset's OKLCH stops to sRGB at fixed L/H by reducing chroma only when required. The highlight becomes `oklch(0.93 0.033 262)` / `#dce9ff`; other source stops fit without chroma reduction. The mapping and raw linear-sRGB values are captured. The brand gradient is artwork, not permission to reintroduce UI background gradients or glow.

Generate separate website, browser-package, toolbar and store files. Favicon candidates are SVG plus 16/32/48/96 PNG and a 16/32/48 ICO. Apple touch is an opaque square 180 PNG. Optional manifest candidates provide 192/512 `any` and opaque `maskable` art; the essential mark fits inside the W3C safe circle. These exports do not select PWA behavior or make archived Apple guidance a current mandatory device matrix.

Package icons cover 16/24/32/48/64/96/128 PNG; toolbar color/on-light/on-dark cuts cover 16/24/32/48/64. The CWS 128 icon uses 96 px painted artwork plus 16 px transparent margins, separately from toolbar optical sizing. AMO has a 128 candidate with a chosen 8 px inset; optional Edge has 300. These are chosen export sets, not a claim that every size is required by every platform. Native toolbar selection and actual packaging remain implementation work.

## Three compositions within one identity

| Candidate | Store series | Social preview |
| --- | --- | --- |
| A — Product window | Headline above a generous product view; the panel appears beside a synthetic document | Introduction beside the workspace |
| B — Margin note | Explanatory column beside an intentional product crop | Typographic brand/title composition |
| C — Evidence in focus | Large real UI crop with its whole-view context | Field evidence crop beside a short title |

The story order is workspace → overview → evidence. Captures come from the chosen public #194 D interface, including its compact phone strip. The detail story shows actual fixture fields and named evidence. No replacement checking UI, private Account screen, real manuscript or customer data is invented. Copy follows the accepted DE/EN voice. Product rendering retains the #195 neutral evidence indicators and colour in Verdict marks only.

The candidates include 1280×800 CWS and 1280×960 AMO screenshots, light DE/EN plus a dark overview comparison. Every direction also has 1200×630 DE/EN light/dark social candidates and English-only 440×280 / 1400×560 CWS promo tiles. CWS promo tiles cannot be localized; screenshot copy can. Exact sources and requirement/recommendation distinctions are in [the research](../research/brand-asset-requirements.md).

## Publication and synthesis handoff

All composition exports retain a design-preview label. A store must show the actual current user experience: recapture the implemented and qualified product, reconcile every feature/copy claim, and verify live upload requirements before submission. Do not submit the prototypes as release screenshots. No store account, upload, listing, analytics, domain or publishing setup is performed by this exploration.

AMO's older guide and current conditional server rules differ; deployment/feature-flag state remains unverified, so 4:3 is a prepared candidate. Meta recommends 1200×630, while Open Graph itself prescribes no size. Current X Card guidance was not verified. The existing accessibility, content and legal release gates remain in force; raster alt descriptions and storefront descriptions need production review.

Once selected, capture the owner's chosen combination and rationale in #199 and #181. Carry source masters, optical rules, manifest mappings, export dimensions, copy/capture policy and the unresolved live-store checks into the final design-system ADR/styleguide and implementation issues. Keep prototype code off main and preserve the separate brand-artwork licensing scope from #189.
