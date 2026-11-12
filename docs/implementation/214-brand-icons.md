# #214 — sRGB brand masters and browser icon packaging

Public implementation completed on 11 November 2026 under the TDD workflow, on
`implement/214-brand-icons` from a base that contains `ceb4161`. A fresh
fetch before the report found the `implement/design-remaining` tip still at
`ceb4161`, already contained, so no merge was needed. The scope
follows the owner's latest comment on #214: public repository packaging only,
no wait for the #207 legal review, a draft brand notice marked as not legally
reviewed, and no publication or store upload. Sources were ADR-0027,
`docs/design/brand-assets.md`, `styleguide.md`, `implementation-plan.md`,
`docs/research/207-design-rights-review.md` §5 and the accepted #199 prototype
(read with `git show` only; its runtime was not promoted, the code was
re-derived).

## Delivered

- **`packages/brand`** (`@source-taster/brand`, private):
  - `src/masters.ts` generates 12 SVG masters in explicit sRGB hex: the full
    two-drop mark, the 16–32 px optical cut, monochrome on-light/on-dark cuts
    (full and optical), the CWS 128 (96 px painted, 16 px margins), AMO 128
    (8 px inset) and Edge 300 (20 px inset) store masters, an opaque Apple
    touch master, a maskable master and a Safari pinned-tab master.
  - The OKLCH stops are mapped to sRGB by reducing chroma at fixed L and H
    and flooring to 0.001; no channel is clipped. Only the highlight
    changes (C 0.035 → 0.033, `#dce9ff`). `masters/gamut-mapping.json`
    records every stop with source, mapped value, hex and linear sRGB.
  - `src/exports.ts` lists the #199 export set and marks each file
    mandatory, chosen or optional.
  - `scripts/export.ts` (`pnpm --filter @source-taster/brand brand:export`) is
    a manual, maintainer-run step. It rasterizes the masters with Playwright
    Chromium's canvas at the target size, builds a real ICO from the 16/32/48
    PNG favicons and writes `exports/manifest.json` with the SHA-256 of every
    master and export. No build, typecheck or test runs it; those only read
    the committed files.
  - `NOTICE.md` is the §5 draft brand notice, headed "DRAFT notice, not
    legally reviewed". The `[full SHA]`, `[verified rights holder]` and
    `[identified operator/recipients]` placeholders are left open. The OFL,
    Apache-2.0 and Lucide ISC/Feather MIT notices keep their own scope.
- **Extension** (`apps/extension`), for both Chromium and Firefox:
  - Package `icons` 16/24/32/48/64/96/128; 128 is the CWS master with its
    16 px margins.
  - `action.default_icon` uses the toolbar-default cuts at 16/24/32/48/64.
  - Firefox only: `action.theme_icons` (`dark` → on-light ink, `light` →
    on-dark ink).
  - The build copies exactly the referenced icons, byte-equal, to fixed
    unhashed `icons/*.png` paths, plus `notices/brand/NOTICE.md`.
  - Permissions, host permissions, CSP, gecko settings and data-collection
    declarations are unchanged. There are no `web_accessible_resources`.
- **Website** (`apps/website`):
  - Every page links `/favicon.ico` (sizes 16x16 32x32 48x48), `/favicon.svg`
    (optical cut, `any`), `/favicon-16/32/48/96.png` and
    `/apple-touch-icon.png` (180). The paths are root-absolute and each
    `sizes` value names only the sizes the file actually holds.
  - The build copies the chosen, non-optional website group of the brand
    manifest byte for byte, before the artifact inventory.
  - `hosting.ts` serves `.png` as `image/png` and `.ico` as
    `image/x-icon`. The existing `nosniff` header and the CSP
    (`img-src 'self'`) are unchanged.
  - `/third-party/ui/NOTICE.txt` now includes the draft brand notice. Its
    header no longer claims that no brand artwork is distributed.
  - The publication review digest covers the brand notice, the export
    manifest and every published favicon. A changed icon therefore needs a
    new publication review.
  - Extension, toolbar and store files are not published by the website.
    The web-app and pinned-tab files and the web manifest are (see
    "Web manifest and head wiring" below).
- **Repository:**
  - `README.md` states that the brand artwork in `packages/brand` is outside
    the code licences, under a draft notice that is not legally reviewed.
  - The `pnpm-workspace.yaml` comment now explains that the only raster files
    are copied favicons. `sharp` stays ignored.
  - The two generated JSON records are listed in `.prettierignore`, so their
    byte-exact comparison in the tests holds.

## Web manifest and head wiring

The owner decided to wire the optional web-app, pinned-tab and Edge files in.
Delivered on `feat/214-web-manifest`:

- **`manifest.webmanifest`** is a generated brand export (website group,
  `chosen`) with the same integrity record as the favicons. It has the name
  "Source Taster", `display: "browser"` (no service worker, no installable-app
  behaviour, as `docs/design/brand-assets.md` requires) and the four web-app
  icons with `purpose` `any` and `maskable`. `theme_color` and
  `background_color` are the light `bg` token; no hex is repeated in the
  source. The calm colour rule keeps the accent out of the browser chrome.
- **One head source.** `packages/brand/src/web-head.ts` lists the icon links
  and builds the manifest. The website's `Page.astro` renders it; the web app
  injects it into its `index.html` through the `brandHead` Vite plugin
  (`apps/web/brand-head.ts`). The links add
  `<link rel="mask-icon" href="/safari-pinned-tab.svg" color="…">` (the light
  `accent` token) and `<link rel="manifest" href="/manifest.webmanifest">`.
- **Website publication.** `websiteBrandFiles` now selects the whole `website`
  group, so one change feeds the build copy and the review digest. `basis`
  still records the platform mandate: the web-app and pinned-tab files stay
  `optional` in the export manifest even though the site publishes them. The
  digest also covers `brand/src/web-head.ts`.
- **Hosting.** The CSP gains `manifest-src 'self'` (`default-src 'none'`
  otherwise blocks the manifest), and `.webmanifest` is served as
  `application/manifest+json` under `nosniff`.
- **Web app.** Production serves the icon files because the server mounts the
  website behind the app (`SOURCE_TASTER_WEB_DIRECTORY` and a website
  directory are configured together in production); a web app run without the
  website would not resolve them. The Vite dev middleware forwards the linked
  brand files to the website build, which must be built for them to resolve.
- **Edge 300 is a store listing file, not website HTML.** Nothing in the code
  collects store candidates (`release-imagery` covers only CWS and AMO
  screenshots), so the `store` group of the export manifest is the candidate
  set. `store-edge-300.png` stays there, `optional`, unpublished and outside
  the extension packages and the website digest; the website tests assert that
  it and the other store files return 404.
- **Firefox `sidebar_action.default_icon`** uses the colour `toolbar-default`
  cuts at 16–64 px. Chromium has no `sidebar_action` (it uses `side_panel`,
  whose manifest has no icon key). `manifestIcons()` includes the sidebar icons
  so the byte-equal packaging test tracks them.

## Tests (red first, then green)

- `packages/brand/test/masters.test.ts`:
  - the gamut mapping, checked against literal expected values;
  - the committed masters byte-equal the generator output;
  - the masters use only hex, `none` or `url(#…)` paint, with no `oklch`,
    `currentColor` or `style`;
  - all four stop colours appear in the full mark.
- `packages/brand/test/exports.test.ts`:
  - the expected export set, as literals from the design documents;
  - files and hashes match the manifest, and every master is current;
  - SVG exports equal their masters;
  - PNG signature, IHDR size, 8-bit RGBA;
  - optical versus full master selection;
  - CWS painted bounds of exactly `[16,16,111,111]` at alpha > 0; AMO
    `[8,8,119,119]` and Edge `[20,20,279,279]` above 3 % antialiasing;
  - opaque touch and maskable art, transparent corners elsewhere;
  - monochrome ink for every opaque pixel;
  - maskable essentials inside the W3C safe circle (r = 0.4 × size);
  - ICO header, entries byte-equal to the 16/32/48 PNGs, no trailing data.
- `apps/extension/manifest.test.ts`:
  - whole-object Chromium and Firefox manifests, with permissions and CSP
    unchanged;
  - each package carries exactly the referenced icons, byte-equal to the
    brand exports, with no other png/ico/svg;
  - on-light/on-dark cuts appear in Firefox only;
  - the brand notice is packaged and marked not legally reviewed, and the
    font and UI notices are still present.
- `apps/website/e2e/icons.spec.ts`:
  - the head links in exact order on `/en/`, `/de/` and `/docs/en/`,
    including the mask icon and manifest;
  - each linked and manifest-listed file is served with status 200, its
    content type and the exact bytes;
  - Chromium's `Page.getAppManifest` reports no errors and the expected
    name and icons, which proves the CSP lets the manifest load;
  - store and extension artwork and `/manifest.json` return 404;
  - the notice carries the draft brand notice beside the OFL, Apache and ISC
    grants.
- `apps/website/e2e/publication-inputs.spec.ts`: changes to `favicon.ico`,
  `apple-touch-icon.png`, `manifest.webmanifest`, the web-app icons, the
  pinned-tab SVG, `web-head.ts` and the brand `NOTICE.md` change the
  publication fingerprint; changes to the Edge 300 and extension files do not.
- `packages/brand/test/web-head.test.ts`: the manifest as a whole object
  with literal colours, every manifest icon an exported PNG of its declared
  size, the exact head link list and every link a website export.
- `apps/web/test/brand-head.test.ts`: the injected head tags and the
  dev-server forwarding pattern.
- `apps/extension/manifest.test.ts`: the Firefox `sidebar_action` carries
  the toolbar-default icons.

## Checks

All checks were run on 11 November 2026 on macOS (aarch64) and passed:

| Check                                                              | Result                              |
| ------------------------------------------------------------------ | ----------------------------------- |
| `pnpm --filter @source-taster/brand test`                          | 11 / 11 passed                      |
| `apps/extension`: `manifest.test.ts`, `preference-sync.test.ts`    | 25 / 25 passed                      |
| `pnpm --filter @source-taster/extension build` (Chromium, Firefox) | both built                          |
| `pnpm pagefind:fetch && pnpm pagefind:build && pnpm pagefind:verify` | verified controlled Pagefind 1.5.2 |
| `pnpm --filter @source-taster/website build`                       | built; favicons in the output root  |
| Website e2e suite (`playwright test`, all specs)                   | 119 / 119 passed                    |
| `pnpm typecheck`                                                   | 23 / 23 tasks                       |
| `pnpm lint` (ESLint, turbo lint, `prettier --check .`)             | 23 / 23 tasks; Prettier clean       |
| `pnpm audit:licenses`                                              | 570 packages reviewed, no failure   |

The brand and extension tests were each run red first. The website spec was
written before the website wiring. Its first run came after the wiring, because
the controlled Pagefind build was still running, so no red run of it is
recorded.

## Decisions

- **The export is manual and committed.** Product builds need neither a
  browser nor native image libraries, and the tests compare the committed
  bytes with the recorded hashes. The script is named `brand:export`, not
  `build` or `generate`, so turbo never runs it.
- **Store-bound tolerance.** The mandatory CWS 128 uses exact bounds at
  alpha > 0. AMO and Edge allow alpha ≤ 8 (under 3 %) at curve joins, where
  vector antialiasing reaches about one pixel beyond the inset.
- **Firefox `theme_icons`.** The keys name the theme, not the ink, so `dark`
  points to the on-light cut and `light` to the on-dark cut.
- **`sidebar_action.default_icon` uses the colour toolbar cuts.** MDN
  documents only `default_icon` for `sidebar_action`, not `theme_icons`, so
  the Firefox sidebar gets `toolbar-default-*` (see "Web manifest and head
  wiring").
- **Website notice.** The draft brand notice is shipped wherever the artwork
  is distributed: the website `NOTICE.txt` and the extension packages.

## Open

- **Manual acceptance ([#217](https://github.com/jeffnawroth/source-taster/issues/217)):** native toolbar icon rendering, including
  Firefox light/dark theme switching and Chromium's toolbar and extensions
  page; favicon behaviour in browser tabs, bookmarks and iOS home screens;
  visual review of the store icons.
- **[#207](https://github.com/jeffnawroth/source-taster/issues/207) specialist review:** the brand notice stays a draft. Its placeholders
  are unfilled, and nothing here clears brand distribution, private-program
  use or launch.
- **Delivered later (#214, owner decision):** the web-app, Safari pinned-tab
  and web manifest wiring and the Firefox `sidebar_action` icon; see "Web
  manifest and head wiring". The Edge 300 file stays a store listing candidate;
  its upload belongs to the store publication in #223.
- **Publication digest inputs (noted in review, no change):** the digest
  (`apps/website/scripts/publication.ts`) deliberately covers `brand/NOTICE.md`,
  `brand/exports/manifest.json` and the published favicon files, so a change to
  any of them needs a new publication review. `README.md` is not a digest
  input; its brand sentence is repository text only.
- **No store upload or publication.** The `store-*` files are listing
  candidates only.
