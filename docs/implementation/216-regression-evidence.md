# #216 — Integrated visual and accessibility regression evidence

Public implementation on `implement/216-regression-evidence`, built under the
TDD workflow, and reviewed and hardened on `fix/220-review`. The recorded code
tree is `3eb7c62`, which contains the #212 review fix `b588c9c` and the
`implement/design-remaining` tip `2f858a2` (section 8). Sources: ADR-0027, `docs/design/{styleguide,components,tokens}.md`,
`packages/design-tokens` (`validation.json`), and the existing suites listed in
the coverage map. This manifest records what the automated evidence shows and
what it does not. **It makes no claim of WCAG, EN 301 549, BFSG or any other
conformance.** Automated checks find regressions; they do not replace the manual
and native gates in section 6.

## 1. Status

| Item                                       | State                                                                                                |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Rendered web regression suite              | Delivered, passing on macOS and Linux Chromium (sections 2, 3, 8). Two other e2e tests flake (8).    |
| Hosted Guest and Account state suite       | Delivered, passing against the real verification API, worker and PostgreSQL.                         |
| Website regression suite                   | Delivered, passing.                                                                                  |
| CI wiring                                  | Delivered: new `web-suites` step; `apps/server/test/operations/ci-workflow.test.mjs` asserts it.     |
| Final-baseline gate (`b588c9c` in history) | Met: `git merge-base --is-ancestor b588c9c HEAD` succeeds on the merged tree.                        |
| **Public/private primitive drift check**   | **OPEN.** Blocked by private styled primitives, `source-taster-service#29`. Nothing here claims it.  |
| Manual and native gates                    | OPEN by design; handed to #217 (section 6).                                                          |

No screenshot baselines are committed. The suites assert on measured pixels,
computed styles, roles, request logs and database rows, so there is nothing to
re-baseline when the visual design legitimately changes within the token gate.

## 2. How the rendered measurements work

The numerical token gate (`pnpm --filter @source-taster/design-tokens check`,
158 gated pairs, tightest 3.26:1) checks resolved colours. It cannot see what a
browser actually paints over glass, a moving backdrop, anti-aliasing or a
fallback. `apps/web/e2e/support/rendered.ts` therefore measures pixels:

1. Screenshot the element as painted.
2. Hide only that element's own paint (`color: transparent` for text,
   `opacity: 0` for shapes and under forced colours, which ignores author
   `color: transparent`) and screenshot it again. This second capture is the
   real backdrop, including blurred content scrolled under a glass surface.
3. Decode both PNGs inside the page (`createImageBitmap`, no `fetch`, so it
   works under the website's strict `connect-src`).
4. Per pixel, the coverage is the projection of the observed colour onto the
   line from the backdrop pixel to the element's computed colour, over all
   three channels: `((pixel - back) . (want - back)) / |want - back|^2`. A
   pixel counts as painted when `|want - back|^2` is at least 300 (the colour
   can be told from its backdrop at all) and its coverage is at least 0.2. The
   lowest WCAG ratio of the counted pixels against the backdrop is the result.
   Pixels that do not count are not claimed, so a measurement over fewer than
   a handful of pixels fails its own `count` floor instead of passing.
5. Thresholds: text at least 4.5:1, non-text (glyphs, focus outline) at least
   3:1.

**Why coverage 0.2 (the Linux CI failure).** The first version of step 4 asked
for coverage of at least 0.6 per pixel and a per-channel span filter. On the
ubuntu CI rasteriser the thin stroke of the digit "1" in the Verdict count
reached that coverage on only 3 to 5 pixels (macOS: 15 to 24), below the
"more than five painted pixels" floor, so six rendered cases failed in run
43171277516. The glyph was fine; the measurement leaned on an
engine-specific anti-aliasing profile. At coverage 0.2 the same stroke yields
17 to 31 pixels on both platforms. The contrast of a partly covered pixel is
not diluted by this: the ratio is taken between the element colour and the
backdrop, and only pixels that moved towards the element colour are counted.
The three-channel projection also fixed a second flaw in the same step: with
the per-channel filter, a faint colour such as `rgb(226 228 234)` on a pale
bar was dropped channel by channel and the website control measured nothing.

**Negative controls.** The measurement is only evidence if it can fail.

- Web and website: `rgb(226 228 234)` text over a light surface must measure
  below 4.5 with a count above five.
- Web, same test: text in the colour of its own background must give a count
  of 0 and a minimum of 0, i.e. it reads as unpainted and fails a floor that
  needs painted pixels. It is never taken for a pass.
- Web: on the sticky detail header, the same pale colour on the Verdict label
  (below 4.5) and on the Verdict glyph (below 3, more than 20 pixels) must be
  detected.
- A control injects the shipped `.st-spinner` and proves the reduced-motion
  probe sees it running when motion is allowed.
- Greyscale: a glyph overlaps itself at exactly 1 and a different glyph at
  below 1.

**Greyscale.** `html { filter: grayscale(1) }` is applied and each of the six
Verdict glyphs is captured against its own backdrop as a 24x24 map of
backdrop differences (summed over three channels, at most 765).

- Visible: the strongest cell of every glyph differs from the backdrop by at
  least 250. Measured on macOS: 333 to 642.
- Distinct: silhouettes are the cells at 0.25, 0.5 and 0.75 of the glyph's
  strongest cell, so the result does not hang on one threshold. At each, the
  most alike pair has an intersection-over-union below 0.80. Measured on
  macOS: highest 0.75 at the loosest threshold tried, 0.68 at the
  half-maximum; two identical glyphs score 1.

Visible labels stay neutral text; the label assertion is the accessible-name
and text check in the same test.

## 3. Coverage map

Every acceptance criterion of #216, the test that carries it, and how to rerun
it. "Existing" suites predate #216 and are cited rather than duplicated.

| Criterion                                                                         | Evidence                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rendered contrast beyond the numerical gate, opaque and glass, text and non-text  | `apps/web/e2e/regression-rendered.spec.ts`: sticky Summary strip and top bar text and Verdict glyphs over scrolled content, English and German, light and dark, `backdrop-filter` asserted active; reduced-transparency opaque fallback (4); focus outline (2); forced colours (en, de). |
| Greyscale Verdict shape and label distinction                                     | Same spec: six silhouettes at three threshold fractions, light and dark; thresholds and measured values in section 2.                                                                                                                                                                     |
| German and English                                                                | Every rendered, reflow, forced-colour, announcement and website test runs in both languages.                                                                                                                                                                                              |
| Light and dark                                                                    | Rendered contrast, greyscale and website contrast run in both schemes.                                                                                                                                                                                                                    |
| Wide, 360 px and 320 px reflow                                                    | Reflow matrix in the rendered spec (20 cases: wide 1100, 360, 320, 640x360 and 320x256 viewports x language x scheme; no horizontal overflow, axe clean). Website: existing `accessibility.spec.ts` axe plus `scrollWidth` at 320 and 1280 for every built route.                                          |
| 200% zoom and enlarged text                                                       | Web: reflow matrix at the viewport widths that 200% and 400% produce. Website: `regression.spec.ts`, root font size 200% at 640 and 320 px, asserted computed 32 px, no horizontal scroll, search reachable and inside the viewport.                                                      |
| Keyboard operation and focus return                                               | Web: existing `lifecycle.spec.ts` (Cancel by Enter), `checking-shell.spec.ts`, plus the focus outline contrast test. Website: existing `design.spec.ts` search focus return; `regression.spec.ts` forced-colour Escape returns focus to the trigger.                                         |
| Announcements are bounded                                                         | Rendered spec: live-region log during an 8-Reference check, deduplicated per leaf region. Progress lines must match the product's own wording exactly (`N of 8 references finished` / `N von 8 Referenzen abgeschlossen`), none in the other language; two to six of them, counts strictly increasing and never repeated, the finished count (8) is announced last, the first announcement is "8 references recognized." (`8 Referenzen erkannt.`), and none exceeds 200 characters; English and German. Existing `packages/ui` Toast contract tests. |
| Sticky detail verdict header (glass, two panes)                                   | Rendered spec: the detail is scrolled until content sits under the header (asserted), then the Verdict label, each reason line and the Verdict glyph are measured (4: en/de x light/dark), with the real glass asserted active. Negative control on the same header (pale label and pale glyph are detected).                                                                                       |
| Forced colours                                                                    | Rendered spec (painted text and shapes under `forced-colors: active`, English and German); website focus indicator and dialog edge.                                                                                                                                                       |
| Reduced motion and reduced transparency                                           | Rendered spec: pending spinner becomes a pulse, no `st-spin`, with an animating control; opaque `surface` under reduced transparency. Website: no running animation with `prefers-reduced-motion`.                                                                                        |
| Pending, failure, retry and expiry against the real API; Guest and authenticated  | `apps/web/e2e-regression/states.spec.ts` (section 4).                                                                                                                                                                                                                                     |
| Retained IDs and revisions; no duplicate effects                                  | Same spec: Check ID from request paths, slot identity `check:position:revision` from PostgreSQL, request counts, Quota calls.                                                                                                                                                             |
| No persistent Check content storage                                               | Same spec: `localStorage`, `sessionStorage`, IndexedDB contents, Cache Storage, service workers, cookies and page cookies scanned for the Reference text, DOI and `eyJ` after each state.                                                                                                  |
| Website local search, error and empty states                                      | Existing `design.spec.ts`, `search-resilience.spec.ts`, `accessibility.spec.ts` (failure, loading, empty, found), plus `regression.spec.ts` search contrast in both schemes.                                                                                                              |
| Exact legal routes                                                                | Existing `website.spec.ts` ("every information page has a translated counterpart and versioned legal drafts") and `design.spec.ts` ("exact legal draft").                                                                                                                                  |
| No tracking or external resource activity                                         | Existing `privacy.spec.ts` (static and runtime); `regression.spec.ts` records every request origin through a search journey: only the site origin, no cookie, no storage, no IndexedDB database.                                                                                          |
| Native extension panel                                                            | Existing suites under `apps/extension/e2e*` (panel, Firefox sidebar, consent, selection). Not duplicated; the OS-native parts are manual (section 6).                                                                                                                                      |
| Primitives in three engines                                                       | Existing `packages/ui/test/primitives.spec.ts`.                                                                                                                                                                                                                                           |
| Public/private primitive drift check                                              | **OPEN**, see section 5.                                                                                                                                                                                                                                                                  |

## 4. Hosted Guest and Account state suite

`apps/web/e2e-regression/states.spec.ts`, run by
`apps/web/regression.playwright.config.ts`. It starts the real verification
web process, the worker and PostgreSQL through `startAccountApi`
(`apps/server/test/support/account-api.ts`) and serves the web app in hosted
mode. The private service is only its established HTTP edge: Guest and Account
tokens, authority and Quota answers come from the same fake edge the existing
hosted shell suite uses. This is public-client contract evidence. It is not
proof against the private service and not both-program proof.

`account-api.ts` gained a Guest token signer (`newGuest`, `guestToken`) with
the strict claims the verification API validates (`purpose: guest-access`,
`exp - iat = 300`).

Every state runs twice, once as a Guest and once as an authenticated Account:

- **Completed Check.** Exactly one `POST /v2/checks`, one Quota reserve and one
  settle, one check and one slot row for the Owner; nothing persisted in the
  browser; a reload shows an empty field.
- **Failed start and retry.** The text stays; no check exists and no Quota is
  reserved after the failure; the retry produces one Check with one reserve and
  one settle (two `POST /v2/checks` in total, one Check ID).
- **Pending, then Cancel.** The Check is held genuinely pending by holding the
  client's `bibliography` requests (zero results, not ended). Cancel posts once
  to the same Check ID, the grid shows Cancelled, the slot identity is
  unchanged, the entered text is kept and Quota is settled or released exactly
  once after the worker starts.
- **Lease expiry.** Advancing the API clock past the lease ends the same Check
  in place with the announced "connection was not renewed in time" message and a
  Cancelled Reference. No second Check, no alert, same slot identity, Quota
  settled once.
- **Access-token expiry.** Browser and API clocks are advanced together. The
  expired token is renewed exactly once (Guest: a second Guest token; Account: a
  second account token) and the next Check runs once, with no alert.

Ordering: the worker is started lazily and then stays up. The Cancel test
therefore runs first so that it can prove settlement only begins when a worker
exists.

## 5. Open: public/private primitive drift

The drift check compares the public `@source-taster/ui` primitive layer with the
private styled primitives. The private primitives are tracked by
`source-taster-service#29` and are not available to this public work. Per
`AGENTS.md` the private repository is untouched and private evidence stays
private. The check is not stubbed, mocked or simulated: the acceptance criterion
stays open until #29 lands and the comparison can run against both.

## 6. Manual and native gates for #217

Automated Chromium cannot show these. They stay open and belong to #217.

- Human screen-reader sessions (VoiceOver, NVDA, JAWS, TalkBack): reading
  order, Verdict naming, live-region phrasing and verbosity.
- Native Firefox and Safari/WebKit rendering of the same flows; this suite is
  Chromium only. The existing browser-project switch in `apps/web/browser-projects.ts`
  covers other engines for older suites, which is not the same as these
  assertions.
- Real browser zoom (200% and 400%) and OS text scaling. The suites emulate zoom
  with CSS viewport width and root font size.
- Real forced-colours and contrast modes (Windows contrast themes, macOS
  Increase Contrast) and real reduced-transparency settings. The suites emulate
  them through the DevTools protocol.
- Native extension panel and sidebar in the shipped Chromium, Edge, Firefox and
  Safari builds, and the operating system context menu.
- Email and PDF-specific accessibility (tagged PDF, PDF/UA tooling beyond the
  existing `pdfua` job, mail client rendering).
- Translation review of German and English strings by a speaker.
- Legal review of the notices and the draft legal texts, and the release gate.
- Colour-vision and low-vision judgement by people; the greyscale test shows
  distinguishable shapes, not that they are understood.

## 7. Reproducing the evidence

Run from the repository root on a clean tree. Pick free ports; other
agents may run Playwright at the same time. The values below are examples. The
recorded run used 7174/7192 (web default), 7274/7292 (bibliographic), 7374/7392
(report), 7474 (hosted regression), 7574/7592 (shell), 7670 (website), 7650/7651
(test API and service) and 7774/7792, 7874/7892, 7974/7992 (extension suites).

```sh
pnpm install --frozen-lockfile
pnpm pagefind:fetch && pnpm pagefind:build && pnpm pagefind:verify
pnpm typecheck && pnpm lint && pnpm exec prettier --check .
node --test apps/server/test/operations/ci-workflow.test.mjs
export DATABASE_ADMIN_URL=postgres://postgres:postgres@localhost:5433/postgres
export DATABASE_TEST_URL=postgres://verification_test:fixture@localhost:5433/owned
export SOURCE_TASTER_DOCUMENT_IMAGE="$(cat /tmp/source-taster-design-document-image-id)" # id of the locally built document image, as in docs/implementation/211-checking-shell.md
export SOURCE_TASTER_E2E_WEB_PORT=8140 SOURCE_TASTER_E2E_API_PORT=8141
export SOURCE_TASTER_TEST_API_PORT=8150 SOURCE_TASTER_TEST_SERVICE_PORT=8151
export SOURCE_TASTER_REGRESSION_WEB_PORT=8160 SOURCE_TASTER_WEBSITE_E2E_PORT=8170
(cd apps/web && pnpm exec playwright test)                                     # includes regression-rendered.spec.ts
(cd apps/web && pnpm exec playwright test --config regression.playwright.config.ts)
(cd apps/website && pnpm exec playwright test)                                 # includes regression.spec.ts
```

Do not wrap Playwright in `timeout`: the harness starts child servers and a
killed parent leaves them listening.

Versions of the recorded run: Node 24.14.0, pnpm 12.15.0, Playwright 1.64.1
(Chromium), PostgreSQL on `localhost:5433` (CI uses `postgres:18`), macOS (arm64).
CI runs the same commands on `ubuntu-24.04`: the rendered spec in the `e2e`
job, the hosted suite in `web-suites`, the website suite in `e2e` through
turbo.

**Linux check without CI.** The host `node_modules` are macOS-native, so the
rendered spec was also run against a Linux Chromium served by the Playwright
image of the same version:

```sh
# In the image, run `playwright run-server` on port 9333 and publish that port
# to the host. (The exact docker invocation of the recorded run was not kept.)
# A throw-away config spreads apps/web/playwright.config.ts and adds
#   use.connectOptions = { wsEndpoint: "ws://127.0.0.1:9333/", exposeNetwork: "<loopback>" }
(cd apps/web && pnpm exec playwright test --config <that config> e2e/regression-rendered.spec.ts)
```

The image is aarch64 on the author's machine; CI is x86_64, so this checks the
Linux font stack and rasteriser, not the CPU architecture. The throw-away
config is not committed.

## 8. Results of the recorded run

Code under test: `3eb7c62` (`fix/220-review`, which contains the merged
`implement/design-remaining` tip `2f858a2`). Later commits on the branch only
change documentation. `git merge-base --is-ancestor b588c9c HEAD` succeeds.
The machine-readable record, with commands, thresholds and measured values, is
`216-regression-evidence.json`. One worker per suite; distinct ports.

| Check                                                              | Result                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                   | passed                                                  |
| `pagefind:fetch`, `pagefind:build`, `pagefind:verify`              | passed                                                  |
| `pnpm typecheck`, `pnpm lint` (24 packages each)                   | passed                                                  |
| `prettier --check .`, `pnpm i18n:check`, `pnpm audit:licenses`     | passed (570 licences reviewed, 108 runtime packages)    |
| `ci-workflow.test.mjs`                                             | 13 of 13 passed                                         |
| `packages/ui`, `release-imagery`, `brand` tests                    | 3 of 3, 27 of 27, 12 of 12 passed                       |
| `regression-rendered.spec.ts`, macOS Chromium                      | 43 of 43 passed                                         |
| `regression-rendered.spec.ts`, Linux Chromium (Docker, see above)  | 43 of 43 passed                                         |
| Web default config (includes the rendered spec)                    | 169 passed, **1 failed** (12.7m), see below             |
| Web `bibliographic`, `report`, hosted `shell` configs              | 22, 2 and 8 passed                                      |
| Hosted regression config (`states.spec.ts`)                        | 10 passed                                               |
| Website suite (includes `regression.spec.ts`, 15)                  | 134 passed                                              |
| Extension panel config                                             | 17 passed, **1 failed** (5.2m), see below               |
| Extension `selection` and `report` configs                         | 14 and 2 passed                                         |

Not runnable here: the guest contract test, which needs
`SOURCE_TASTER_SERVICE_WORKTREE`.

**Open: lost presses on the merged tree.** Two e2e tests fail intermittently
and are not fixed by this work.

- `apps/web/e2e/manual-overrides.spec.ts` "a layout change in the detail during
  a Save press does not lose the press": failed in the full run (`Expected:
  2994`, `Received: 3136`) and in 5 of 30 and 7 of 40 isolated repeats. The
  outcome is bimodal and set before the press: when the page rests at its
  scroll maximum (scrollY 3136 of 3916 with a 780 px viewport) the test
  passes; when it rests 142 px above it (scrollY 2994, detail top at 171
  instead of 29) inserting 300 px at the top of `.check-detail` moves the window
  scroll to the maximum. The pointer is still down at that moment, so the press
  can be lost. Waiting for fonts or for a stable scroll position does not
  change this (the state is stable for 200 ms). Setting `overflow-anchor: none`
  on the document before the insert keeps scrollY at 2994 and passed 12 of 12,
  which points at window-level scroll anchoring choosing an anchor inside the
  detail's own scroller. A product fix would change anchoring behaviour for the
  streaming feed as well, so it was not made here; the experiment is not
  committed.
- `apps/extension/e2e/manual-overrides.spec.ts` (de): one failure in the full
  run ("No region named Historisches Ergebnis in the side panel"); 12 of 12
  passed on repeat. The `revisions` de flake (about 11% before the font wait,
  30 of 30 afterwards) is of the same class. A common cause is not proven.

**Linux control.** `negative control: the detail header measurement rejects
faint text and a faint glyph` failed once on the Linux Chromium in one cold
start and passed 25 of 25 and 16 of 16 on repeats; the message of the single
failure was not captured, so the cause is unknown.

## 9. Limits of this evidence

- Chromium only. Pixel measurements depend on the engine's text rendering. They
  were taken on macOS and on a Linux Chromium (aarch64 container); an x86_64
  Linux rasteriser is covered only by CI. Only pixels that moved at least 20%
  towards the element colour are claimed, and thresholds sit at the WCAG
  floors, not above them.
- Only painted pixels are measured. Thin, heavily anti-aliased strokes can
  contribute few pixels; each measured element must yield more than five
  (glyphs: more than twenty) or the test fails.
- The greyscale values in section 2 were observed on macOS. The Linux run
  passes the same thresholds; its observed values were not recorded.
- Glass is measured over the content the tests scroll beneath it, not over every
  possible page.
- Emulated media features and zoom are not the same as the operating system's.
- The hosted suite uses a fake private-service edge and a controlled clock.
- Passing automated tests does not demonstrate accessibility for people. The
  manual gates in section 6 remain.
