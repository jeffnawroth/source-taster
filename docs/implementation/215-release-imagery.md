# #215 — Truthful store and social release imagery

Public implementation completed on 12 November 2026 under the TDD workflow, on
`implement/215-release-imagery`. The branch contains the integration tip
`59f4f85` and the final-capture gate commit `b588c9c`. A second fetch, after the final capture and
before the report, found `implement/design-remaining` at `aada5ed`, already contained, so
no further merge was needed. Scope follows the owner's decision: public
preparation only. Nothing was uploaded, published or registered, no domain was
bought, and no rating, metric, price or certification appears in any image.

## Delivered

- **`packages/release-imagery`** (`@source-taster/release-imagery`, private):
  - `src/specs.ts`: the 16-file image set (see below).
  - `src/fixtures.ts`: three invented References and `fixtureSha256`, the hash
    of exactly the input the capture pastes.
  - `src/claims.ts`: every claim the images picture or state, each tied to an
    implementation record, a spec file and a literal test title.
  - `src/copy.ts`: DE/EN headlines, captions and alt text; the claims of every
    image.
  - `src/manifest.ts`, `src/validate.ts`: manifest builder, an IHDR reader and
    structural checks (exact size, 8-bit RGB PNG, hashes, no missing or
    unlisted file).
  - `src/gate.ts`: `finalCaptureGate`. `--final` is refused unless `b588c9c`
    is an ancestor of `HEAD`; a git error closes the gate.
  - `scripts/capture.ts`: drives the real native Chromium side panel through
    the repository's CDP `Panel` driver against the real server and worker.
  - `scripts/compose.ts`: lays out the store, promo and social images in
    Playwright HTML with Atkinson Hyperlegible Next and the brand mark.
  - `scripts/run.ts`: the manual entry point `imagery:capture`.
    Without `--final` it is a dry run into `--out` (default `.dry-run`,
    git-ignored). With `--final` it writes `exports/`.
  - `exports/`: the committed final set, `captures/` (the raw panel
    captures) and `manifest.json`.
- The script is named `imagery:capture`, never `build` or `test`, so no
  product build, turbo task or `pnpm test` starts a browser or a server.

### Image set

| Files                                              | Size       | Notes                               |
| -------------------------------------------------- | ---------- | ----------------------------------- |
| `cws-{en,de}-{1-workspace,2-overview,3-evidence}`  | 1280×800   | Chrome Web Store screenshots        |
| `amo-{en,de}-{1-workspace,2-overview,3-evidence}`  | 1280×960   | AMO 4:3 candidates (conditional)    |
| `promo-small-440x280`, `promo-marquee-1400x560`    | as named   | language-neutral, mark and name only |
| `social-{en,de}-1200x630`                          | 1200×630   | typographic, no product capture     |

The store story is workspace → overview → evidence. All files are opaque
8-bit RGB PNG.

## Requirements versus recommendations

Re-checked on 12 November 2026 from primary sources. Requirements and
recommendations are kept apart on purpose.

| Source                                                                | Requirement (stated as such)                                                 | Recommendation / not stated                                                                                                   |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Chrome Web Store, `developer.chrome.com/docs/webstore/images`         | At least 1 screenshot; 1280×800 or 640×400; square corners, full bleed       | Up to 5; prefer 1280×800; show the real experience. Promos: small 440×280, marquee 1400×560 (both optional); avoid text, test at half size, promos are not locale-specific. Format and alpha are **not stated**. |
| AMO, Extension Workshop "Create an appealing listing"                 | Nothing mandatory is stated                                                  | Capture at 1280×800; other sizes at 1.6:1; no practical limit on count; one screenshot set only, descriptions can be localized; avoid text inside images. |
| AMO, addons-server `master` `efa5ee3` (implementation evidence)       | Only when the `content-optimization` waffle switch is on: minimum 1000×750, ratio 4:3 | The switch state on production is **unverified**. The 4:3 files are candidates that satisfy it if it is on; the CWS 1280×800 set also satisfies the 1.6:1 recommendation. |
| Meta sharing docs `developers.facebook.com/docs/sharing/webmasters/images` | Minimum image dimension 200×200; file at most 8 MB                      | At least 1200×630 for high-resolution; at least 600×315 for large link posts; ratio close to 1.91:1; `og:image:width`/`height`. Formats and `og:image:alt` are **not covered** by that page. |
| X cards                                                               | **Unresolved.** `developer.x.com` answered 402 and `docs.x.com` 404 for the large-image card page. | The 1200×630 social files are 1.91:1, the commonly cited large-image ratio, but that is not confirmed from a primary source. |

The opaque RGB PNG policy is this repository's own recommendation. No checked
source states a no-alpha or 24-bit rule for the Chrome Web Store.

Against the CWS promo recommendations: avoiding text is met: the promo tiles
carry only the mark and the name "Source Taster". The store screenshots carry
a headline and a caption beside the capture, which the CWS page does not
forbid. **Not met:** saturated colours, avoiding heavy white and light grey,
assuming a light-grey store background, and filling the region with
well-defined edges. The tiles use the calm `#f3f5f9` canvas and will fade
into a light-grey background; this is a design-review item for #217, not a
requirement. The AMO page advises against text in images, so the AMO candidates are
a design question for #217.

## Copy and alt text

DE and EN copy, with exact Verdict labels and the comma in "Exists, with
deviations" / "Existiert, mit Abweichungen", lives in `src/copy.ts`. It uses no
exclamation mark and no hype word; German is formal ("Sie"). Every image has
alt text in both languages in `manifest.json`.

| Image                 | EN alt (excerpt)                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `*-1-workspace`       | A capture of the Source Taster side panel with three pasted References in the input field …          |
| `*-2-overview`        | The Source Taster summary with one count for each Verdict … Correct, Exists, with deviations and DOI conflict … |
| `*-3-evidence`        | The detail of one Reference. It starts with the Verdict Exists, with deviations …                    |
| `social-en`           | Source Taster. Check References against sources. …                                                   |

## Claim evidence

Every pictured claim maps to an implementation record, a spec file and a
literal test title that must exist as the first argument of `test(` (checked in
`test/claims.test.ts`). `qualified` is `null` for all of them: the behaviour
is implemented and tested, but not release-qualified. The product's own
notice says so, and the workspace capture keeps that notice in view.

| Claim                      | Implementation record       | Spec                              | Test title                                                                       |
| -------------------------- | --------------------------- | --------------------------------- | -------------------------------------------------------------------------------- |
| `side-panel`               | 92-extension-skeleton.md    | `apps/extension/e2e/panel.spec.ts` | the toolbar action opens the real native side panel with the shared Check workspace |
| `verdict-per-reference`    | 92-extension-skeleton.md    | `apps/extension/e2e/panel.spec.ts` | native panel and web keep identical server outcomes for the synthetic witnesses   |
| `summary-counts`           | 82-check-workspace.md       | `apps/web/e2e/workspace.spec.ts`   | summary filters current Verdicts separately from technical Statuses               |
| `doi-conflict`             | 82-check-workspace.md       | `apps/web/e2e/workspace.spec.ts`   | DOI conflict has its own current count and filter                                 |
| `best-match-comparison`    | 82-check-workspace.md       | `apps/web/e2e/workspace.spec.ts`   | compares Reference and server Best match side by side                             |
| `detail-leads-with-verdict`| 212-reference-detail.md     | `apps/web/e2e/reference-detail.spec.ts` | detail leads with the effective Verdict in the documented section order      |
| `german-and-english`       | 92-extension-skeleton.md    | `apps/extension/e2e/panel.spec.ts` | native panel and web keep identical server outcomes for the synthetic witnesses in … |

Deliberately not pictured: a Correction suggestion (the evidence capture does
not show one) and local apply. Both claims were removed.

## Fixture provenance

- Crossref test prefix `10.5555`. Invented author "Nordmark, E. K." and
  invented "Journal of Synthetic Examples". No real customer document, no
  private UI data and no labelled prototype PNG is used.
- Three References: `imagery-correct` (Correct), `imagery-deviating` (input
  year 2019, work year 2021: Exists, with deviations) and `imagery-conflict`
  (no work served: DOI conflict).
- Served by a loopback HTTP edge started by the capture. No network access
  to a real registry. `fixtureSha256` in the manifest equals the hash of the
  pasted input.
- The capture reads each rendered row and fails unless its Verdict label
  equals the fixture's expected label in that language.
- German is chosen in the panel's own Language control, as a person would.
  The headless browser locale does not reach the panel.

## Website metadata mapping

No Open Graph or Twitter markup exists in `apps/website` today, and none was
added. The mapping below is a proposal for later wiring, with no domain:

| Page language | Image (published path, relative) | Alt (from the manifest)           |
| ------------- | -------------------------------- | --------------------------------- |
| `/en/`        | `social-en-1200x630.png`         | `images[].alt.en`                 |
| `/de/`        | `social-de-1200x630.png`         | `images[].alt.de`                 |

Absolute `og:image` URLs need the production domain, which is not configured,
so stable metadata URLs stay open until it is. Also set `og:image:width`
1200, `og:image:height` 630 and `og:image:alt`; ogp.me defines all three and
says a page that specifies `og:image` should specify `og:image:alt`.

## Tests

- `test/specs.test.ts`: the exact file list, sizes and PNG format per role.
- `test/validate.test.ts`: IHDR reading; a wrong size, colour type, hash,
  missing or unlisted file is reported.
- `test/gate.test.ts`: the gate opens only on an ancestor, closes on false and
  on a git error; no live git check runs in `pnpm test`.
- `test/claims.test.ts`: every claim names an existing doc and spec and a
  literal test title; no unknown claim ids; no hype words.
- `test/copy.test.ts`: exact Verdict labels with the comma; no exclamation
  mark; alt text for every image; every claim of an image exists.
- `test/manifest.test.ts`: the builder lists the image set with claims, alt
  text and provenance; a final manifest needs an open gate and
  `releaseQualified: false`.
- `test/exports.test.ts` (no red run while no `exports/` existed; it was
  checked afterwards by changing one recorded hash in `exports/manifest.json`,
  which failed the test, and restoring the file): when `exports/manifest.json` exists, it is final and
  every PNG matches its recorded hash and size. It is skipped when no final
  capture is committed.

## Checks

Run on 12 November 2026 on macOS (aarch64):

| Check                                                      | Result                  |
| ---------------------------------------------------------- | ----------------------- |
| `pnpm --filter @source-taster/release-imagery test`        | 22 / 22 passed          |
| `node scripts/run.ts --final` (ports 7192 / 7174)          | exit 0; 16 images, manifest valid |
| `pnpm --filter @source-taster/release-imagery typecheck`   | passed                  |
| `pnpm --filter @source-taster/release-imagery lint`        | passed                  |
| `prettier --check packages/release-imagery`                | clean                   |
| `pnpm typecheck` (workspace)                               | 24 / 24 tasks           |
| `pnpm lint` (ESLint, turbo lint, `prettier --check .`)     | 24 / 24 tasks; Prettier clean |

## Open

- **Manual acceptance (#217):** full-size and thumbnail inspection of every
  image, the half-size check for the promo tiles, and the AMO text-in-image
  question. The author only looked at a sample by eye.
- **Development-preview notice:** the product still shows "development preview
  with uncalibrated comparison rules". It is kept visible in the workspace
  capture. This is a release blocker; every capture must be redone once the
  notice is gone.
- **Nothing is release-qualified**, and nothing was uploaded or published.
  Publication readiness is explicitly not claimed.
- **#207:** the brand notice stays a draft that is not legally reviewed. It
  remains a hard gate before private consumption, brand distribution, store
  publication and launch.
- **AMO takes one screenshot set** (Extension Workshop); the DE and EN sets
  both exist, and which language the single set uses is still to be chosen.
- **CWS promo recommendations** (saturated colour, no light grey, fill the
  region) are not met by the calm tiles; design review in #217.
- **X card guidance** is unresolved (see above).
- **AMO `content-optimization` state** on production is unverified; the 4:3
  candidates are conditional.
- **Promo tiles** show the mark and name only; the composition is a design
  review item.
- **Stable metadata URLs** wait for the domain and the website wiring.
- The sticky header and tab bar of the panel partly overlap the scrolled
  content in the overview and evidence captures, as in the real product.
