# Brand asset requirements

- Task: [#199](https://github.com/jeffnawroth/source-taster/issues/199).
- Retrieved: **2026-11-10**. Only first-party standards, vendor documentation and Mozilla source were used. No browser or authenticated storefront upload was tested.
- **Requirement** means an explicit constraint in the cited source, conditional on using that feature/store. **Recommendation** preserves the source's advisory wording. Examples and common export sizes are not automatically requirements. Source-code behavior is distinguished from verified production behavior.
- Dimensions below are **width × height in pixels**, except where device-independent pixels (DIPs) are stated. Website icons, installed extension icons and storefront images are separate assets.

## Website icons

| Surface | Requirements / defined behavior | Recommendations and limits of evidence |
|---|---|---|
| HTML favicon, `rel="icon"` | HTML defines selection using `type`, `media` and `sizes`; `sizes` describes actual raw-pixel sizes. `sizes="any"` denotes a scalable icon, for example SVG. No fixed 16/32/48 px export set is mandated. Without an icon link, browsers **may** request `/favicon.ico`; that filename is not mandatory. [H] | SVG and PNG/ICO are illustrated by the standard, not a guarantee that every browser supports every format. A 16/32/48 ICO set is a compatibility/design choice, not an HTML requirement. |
| Google Search favicon, separate from browser UI | For eligibility: square **1:1**, at least **8×8**; listed supported formats are **BMP, GIF, ICO, PNG, JPEG, PPM, TIFF**. Homepage and image must be crawlable, with a stable image URL. Appearance is not guaranteed. [G] | Google recommends **larger than 48×48**. The retrieved current page does **not** require multiples of 48 and does not list SVG; do not substitute older Search guidance or infer SVG Search support from browser support. |
| Apple Home Screen / `apple-touch-icon` | Apple's archived guide documents **PNG**, `rel="apple-touch-icon"`, and examples at **152×152, 180×180, 167×167**. It selects the closest suitable size, preferring the smallest larger image when no exact size exists. [A] | The guide is explicitly an archive, updated **2016-12-12**. These example sizes are **not a verified current mandatory device matrix**. A 180×180 export is supported by this example, not a universal Apple requirement. No current web-specific opacity or fixed-padding requirement was established here. |
| Apple manifest icons | WebKit documents manifest-icon support since iOS/iPadOS **15.4**; when both are present, **`apple-touch-icon` takes precedence** over manifest icons. [W] | This newer first-party explanation confirms the mechanism, but does not prescribe a new pixel-size matrix. |
| Web app manifest / Chrome install promotion | Google's Chrome installation-promotion criteria include manifest icons at **192×192 and 512×512**. [I] | These are **Chrome promotion criteria**, not universal favicon or W3C manifest requirements. The same page says users can install sites that do not meet those criteria. |
| Manifest `purpose="maskable"` | W3C defines a central circular safe zone of radius **40% of the smaller image dimension**. The browser must preserve pixels inside it and may mask pixels outside. `purpose` defaults to `any`; `maskable` declares suitability for masking. No fixed 192/512 size follows from this definition. [M] | W3C suggests avoiding transparent pixels; it does not forbid them. If present, the browser must composite them onto its chosen solid fill. Google recommends an opaque maskable asset and separate `any` and `maskable` designs. [M, P] |
| Safari pinned-tab `mask-icon` | Apple's archived instructions specify **SVG**, **100% black vectors on a transparent background**, a **single layer**, and **`viewBox="0 0 16 16"`**. The link's `color` sets the rendered color. [S] | This is a distinct, archived Safari facility, **not** manifest `purpose="maskable"`. No current Safari necessity was established. |

Maskable geometry: for a **192** square, the safe circle has radius **76.8**, diameter **153.6**; for **512**, radius **204.8**, diameter **409.6**. These are calculations from [M]. The circle is not an 80%-width square: artwork near that square's corners can still be cropped.

Useful primary excerpts:

> HTML: “The keywords specified on the `sizes` attribute must not represent icon sizes that are not actually available in the linked resource.” [H]
>
> W3C: “The user agent MUST NOT make any pixel within the safe zone transparent.” [M]
>
> WebKit: “If you do both, `apple-touch-icon` will take precedence over the Manifest-declared icons.” [W]

## Chromium extension package and toolbar

| Asset | Requirement | Recommendation / sizing semantics |
|---|---|---|
| Manifest `icons` | The reference accepts raster formats supported by Blink, naming **PNG, BMP, GIF, ICO, JPEG**, and explicitly excludes **WebP and SVG**. [C1] | PNG is recommended for transparency. **128×128** is “should always” for installation/store; **48×48** is “should” for `chrome://extensions`; **16×16** can be used as the extension-page favicon. Other sizes are permitted. The reference's **32×32** example does not make 32 mandatory. Store publication adds the mandatory 128 PNG rule below. |
| MV3 `action.default_icon` | Toolbar display is **16×16 DIPs**. **Unpacked extensions must use PNG**; packed extensions may use supported raster formats, but **SVG is not supported**. Animated icons must not be used. [C2] | `action` and its child keys are optional; Google recommends supplying `action` and `default_icon`. A dictionary permits multiple raster resolutions; the current example lists **16, 24, 32**. At 1×/1.5×/2× these match a 16-DIP display. Those file sizes are choices for fidelity, not three individually mandatory files. |

Chrome scales the nearest available action icon when an exact scale is missing. Neither cited Chromium page prescribes a fixed transparent-padding percentage for toolbar icons. **Do not copy Chrome Web Store's 128 px store-icon padding onto every toolbar export.** [C1, C2, C3]

Useful excerpt:

> “Icons must be 16 device-independent pixels (DIPs) wide and tall.” … “Unpacked extensions must use PNG images.” [C2]

## Firefox extension package and toolbar

- **Manifest `icons` is optional.** Firefox otherwise uses a standard extension icon. Mozilla recommends **32×32** for the add-ons manager and **64×64** for high-resolution displays; other sizes are allowed. These are browser assets, not the AMO listing upload rules. [F1]
- **Firefox supports SVG**, including color-scheme media queries. Mozilla specifies `viewBox` and the SVG `xmlns` attribute; even one reusable SVG must still be assigned size keys in manifest `icons` (the example uses 32 and 64). Chromium does not support this SVG extension-icon feature. [F1]
- For MV3, use **`action`**; `browser_action` is the MV2 key. `default_icon` accepts a path string or a dictionary of sizes. Toolbar display is **16 × `devicePixelRatio`**; Mozilla recommends **16×16 and 32×32** theme icons. A **64×64** action export is also illustrated for the larger menu-panel context, described as an older Firefox facility. Do not describe 64 as universally required for the current toolbar. [F2, F3]

### `theme_icons` semantics — the key names describe theme text

`action.theme_icons` is an optional array; if present, it contains at least one object, each with required `dark`, `light`, and `size` fields. Paths are relative to the manifest; `size` is the size of **both** icons in pixels. [F2]

| Key | Firefox's selection condition | Corresponding artwork candidate |
|---|---|---|
| `dark` | Theme uses **dark text**, e.g. Firefox **Light** theme. | Dark mark suitable for a light toolbar. |
| `light` | Theme uses **light text**, e.g. Firefox **Dark** theme. | Light mark suitable for a dark toolbar. |

The artwork-column wording explains the documented mapping; it is not an additional requirement on the logo's color. Suggested file names below make the mapping explicit; they are not prescribed names:

```json
"action": {
  "default_icon": { "16": "toolbar-default-16.png", "32": "toolbar-default-32.png" },
  "theme_icons": [
    { "dark": "toolbar-on-light-16.png", "light": "toolbar-on-dark-16.png", "size": 16 },
    { "dark": "toolbar-on-light-32.png", "light": "toolbar-on-dark-32.png", "size": 32 }
  ]
}
```

Useful excerpt:

> `dark`: “This icon displays when a theme using dark text is active (such as the Firefox Light theme …).” `light`: “… when a theme using light text is active (such as the Firefox Dark theme).” [F2]

## Chrome Web Store assets

| Asset | Mandatory? | Dimensions / format | Padding and design guidance |
|---|---|---|---|
| Extension/store icon | **Yes**; 128 image in the extension ZIP. | **128×128 PNG**. [C3, C4] | Published **should** guidance for a square mark: **96×96** artwork plus **16 transparent pixels per side**. Circular mark: approximately **112** diameter. Irregular marks may differ; these are visual-weight guides, not a universal 16 px inset. Should work on light and dark backgrounds. |
| Screenshots | **At least 1**, maximum **5**. | **1280×800** or **640×400**, with 1280 preferred. The dashboard guide summarizes 1280; the image/design pages explicitly permit both. [C3–C5] | **Square corners, no padding, full bleed**. Show the actual current user experience. DE/EN screenshots may be localized. |
| Small promo tile | **Optional**. | **440×280**, **PNG or JPEG**. [C4] | Advice: fill the region, define edges, avoid excessive text, remain legible at half size. No numeric safe margin is prescribed. [C3, C5] |
| Marquee promo tile | **Optional**; needed to be eligible for marquee featuring, not for basic publication. | **1400×560**, **PNG or JPEG**. [C3, C4] | Same design advice. Small and marquee tiles **cannot be localized**, unlike screenshots. [C4] |

The cited textual CWS pages do **not** establish a screenshot-specific accepted-format list or a universal “24-bit PNG / no alpha” rule for screenshots and promo tiles. **Unverified:** exact uploader bit-depth/alpha/file-size limits. Do not label those as researched requirements. The mandatory **PNG** rule above applies to the **store icon**; the explicit **PNG/JPEG** list applies to **promo tiles**. [C3, C4]

Useful excerpts:

> “Only the store icon and at least one screenshot are required; the YouTube video, small promo tile, and marquee promo tile are optional.” [C4]
>
> “The actual icon size should be 96x96 (for square icons); an additional 16 pixels per side should be transparent padding …” [C3]
>
> Screenshots: “Use square corners and no padding (full bleed).” [C5]

## Firefox Add-ons / AMO listing assets

**Material source conflict:** Mozilla's listing guide, last updated **2019-03-18**, describes **32/64 PNG or JPEG** icons and recommends **1280×800 / 1.6:1** screenshots. Current Mozilla server source contains different listing UI guidance and conditional validation. Do not present the older 1280×800 recommendation as a verified current upload requirement. [F4, AM1–AM3]

| Asset | First-party evidence | Requirement status |
|---|---|---|
| Listing icon | Current source UI displays **32, 64, 128** previews; supports **PNG/JPG**; says larger icons are resized to **128×128**. With `content-optimization` enabled, UI and validator require **square, at least 128×128**. [AM1–AM3] | Formats and non-animation are explicit upload constraints in source. **128 minimum is conditional; production flag state is unverified.** Distinguish generated display sizes from files an author must separately upload. |
| Screenshots | Current source UI: **PNG/JPG supported, PNG recommended**; calls **2400×1800** the maximum/recommended size. With `content-optimization`, UI and validator specify **minimum 1000×750, 4:3**. [AM1–AM3] | **4:3/minimum conditional; production flag state is unverified.** The examined validator does not prove that the UI's maximum is a hard upload rejection rather than processing/display guidance. |
| Count / localization | Older official guide says no practical screenshot-count limit, **one shared image set** with localized descriptions; avoid embedded language-dependent text. Current media template asks for at least one screenshot during submission. [F4, AM1] | No current universally enforced minimum/maximum count was established. The old “no practical limit” is guidance, not a verified unlimited API contract. No numeric padding rule was established. |

Mozilla source was pinned to **`7582012017af255d4ceee29ea796d8c96ad2e2e7`**, retrieved from the official repository's `master` head. This is implementation evidence, **not confirmation of the deployed AMO version or feature-flag configuration**. No upload was attempted. A **128×128 icon** and **4:3 screenshot exports** accommodate the conditional dimensions, but their live acceptance remains untested.

Useful source excerpts:

> “PNG and JPG supported, PNG recommended. The maximum and recommended size for screenshots is 2400x1800 pixels.” [AM1]
>
> Inside `if waffle.switch('content-optimization')`: “Minimum size is 1000x750, and a ratio of 4:3 is required.” [AM1]
>
> Validator messages: “Icons must be either PNG or JPG.” / “Images cannot be animated.” [AM2]

## Microsoft Edge Add-ons — separate optional storefront

Microsoft's current publication page specifies the following; these rules must not be substituted for Chrome Web Store rules. [E]

| Asset | Required? | Dimensions / format verified in that page |
|---|---|---|
| Extension logo | **Required for each language**. | **1:1**, minimum **128×128**, recommended **300×300**. |
| Small promo tile | Optional, one per language. | **440×280**. |
| Large promo tile | Optional, one per language. | **1400×560 PNG**. |
| Screenshots | Optional, maximum **6**. | **640×480** or **1280×800**. Note **640×480**, not Chrome's 640×400. |

Edge supports duplicating these assets across languages; unlike CWS, its promo assets are described per language. Exact logo/small-tile/screenshot file formats and numeric padding rules were **not specified in the retrieved page text**; only the large tile explicitly names PNG. [E]

## Social preview images

| Consumer / standard | Requirements | Recommendations / unresolved facts |
|---|---|---|
| **Open Graph protocol** | `og:image` is one of four required basic properties, alongside `og:title`, `og:type`, `og:url`. Optional structured properties include image MIME type, width, height and alt text; the protocol says an image **should** have `og:image:alt`. [O] | **No fixed image dimensions, aspect ratio, file format, padding or byte limit are mandated by the protocol.** In particular, **1200×630 is not an OGP requirement**. |
| **Facebook / Meta link shares** | Minimum image **200×200**; file size **must not exceed 8 MB**. [FB] | Meta recommends **at least 1200×630** for high-resolution display, **600×315** for a larger preview, and near **1.91:1** to avoid cropping. Images below 600×315 can still display smaller. This page does not specify a complete accepted raster-format list or numeric text-safe margin. |
| **X link Cards** | **Current first-party card-image requirements could not be verified in this retrieval.** | Legacy official large-image and summary Card URLs redirect to the new documentation homepage; the new documentation index did not expose replacement Card specifications. Do not claim remembered dimensions, ratios, format lists, file limits or OG fallback behavior as current verified X requirements. [X1–X3] |

Useful excerpts:

> OGP: “The four required properties for every page are … `og:image` …” and “The `og:image` property has some optional structured properties …” [O]
>
> Meta: “The minimum allowed image dimension is 200 x 200 pixels.” / “Use images that are at least 1200 x 630 pixels for the best display on high resolution devices.” [FB]

## Primary sources

All retrieved **2026-11-10**. Official pages remain the authority; source excerpts above are intentionally short. Archived pages and unresolved deployment state are identified where used.

- [H] [WHATWG HTML — link type `icon`](https://html.spec.whatwg.org/multipage/links.html#rel-icon).
- [G] [Google Search Central — favicon in Search](https://developers.google.com/search/docs/appearance/favicon-in-search).
- [A] [Apple Safari Web Content Guide — configuring web applications (archive)](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html).
- [W] [WebKit — Web Push for Web Apps on iOS and iPadOS, “New Fallback Icon”](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).
- [I] [Google web.dev — What does it take to be installable?](https://web.dev/articles/install-criteria).
- [M] [W3C Web Application Manifest — icon purposes and safe zone, §§2.1, 2.3](https://www.w3.org/TR/appmanifest/#icon-masks).
- [P] [Google web.dev — maskable icons](https://web.dev/articles/maskable-icon).
- [S] [Apple — creating pinned tab icons (archive)](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/pinnedTabs/pinnedTabs.html).
- [C1] [Chrome — manifest `icons`](https://developer.chrome.com/docs/extensions/reference/manifest/icons).
- [C2] [Chrome — `action`, icon formats and DIP sizing](https://developer.chrome.com/docs/extensions/reference/api/action).
- [C3] [Chrome Web Store — Supplying Images](https://developer.chrome.com/docs/webstore/images).
- [C4] [Chrome Web Store — Complete your listing information](https://developer.chrome.com/docs/webstore/cws-dashboard-listing).
- [C5] [Chrome Web Store — Creating a great listing page](https://developer.chrome.com/docs/webstore/best-listing).
- [F1] [Mozilla — manifest `icons`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/icons).
- [F2] [Mozilla — MV3 manifest `action`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/action).
- [F3] [Mozilla — MV2 manifest `browser_action`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_action).
- [F4] [Mozilla Extension Workshop — Creating an appealing add-on listing](https://extensionworkshop.com/documentation/develop/create-an-appealing-listing/).
- [AM1] [Mozilla addons-server — listing media template, pinned source](https://github.com/mozilla/addons-server/blob/7582012017af255d4ceee29ea796d8c96ad2e2e7/src/olympia/devhub/templates/devhub/addons/forms_shared/media.html).
- [AM2] [Mozilla addons-server — image upload validation, pinned source](https://github.com/mozilla/addons-server/blob/7582012017af255d4ceee29ea796d8c96ad2e2e7/src/olympia/devhub/views.py#L993).
- [AM3] [Mozilla addons-server — icon/preview size constants, pinned source](https://github.com/mozilla/addons-server/blob/7582012017af255d4ceee29ea796d8c96ad2e2e7/src/olympia/constants/base.py#L242).
- [E] [Microsoft — Publish an extension, Store listing fields](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension).
- [O] [Open Graph protocol specification](https://ogp.me/).
- [FB] [Meta — Images in Link Shares](https://developers.facebook.com/documentation/sharing/webmasters/images).
- [X1] [X — legacy Summary Card with Large Image URL](https://developer.x.com/en/docs/x-for-websites/cards/overview/summary-card-with-large-image) (redirected to `docs.x.com`, then `/overview`).
- [X2] [X — legacy Summary Card URL](https://developer.x.com/en/docs/x-for-websites/cards/overview/summary) (redirected; card specification not retrieved).
- [X3] [X — current official documentation index](https://docs.x.com/llms.txt) (no replacement Card guidance found in this index).
