# #92 Extension skeleton and native #96 Guest acceptance

This delivery adds explicit Chromium and Firefox extension targets built by Vite
from one codebase (`apps/extension`). It also covers the remaining native
extension acceptance of #96. It is the final implementation ticket of the
authorized 75→77→82→92 wave. It does not authorize or complete the rest of #70.
It adds no source-selection or context-menu work (#93, ADR-0026) and no store,
download or production availability.

## Ancestry

| Point | Commit |
| --- | --- |
| Required baseline (`spec/70-shared-workspace-extension`, includes reviewed #82) | `d9a9dec25e14089b795d832f784f1ffcaedd3acb` |
| Integration tip after `git fetch origin` at final reconciliation | `d9a9dec25e14089b795d832f784f1ffcaedd3acb`, unchanged; nothing to merge |

The baseline was confirmed as an ancestor (`git merge-base --is-ancestor`)
before work and again at handoff. The root integration checkout was not changed.

## Design

- **One codebase, two targets.** `vite build --mode chromium` and
  `vite build --mode firefox` emit `dist/{chromium,firefox}`. The panel bundle
  and CSS are byte-identical in both targets, with the same SHA-256. Only
  `manifest.json` and the 0.1 kB `background.js` differ.
- **Owned platform adapter.** `src/platform.ts` is the only panel module that
  touches the extension namespace. `src/background.ts` is self-contained. It
  has no imports, messaging or network, and registers at top level:
  - Chromium: `sidePanel.setPanelBehavior({ openPanelOnActionClick: true })`.
  - Firefox: `action.onClicked` → `sidebarAction.toggle()`.
  No WXT, Plasmo or other framework was added.
- **Shared workspace reused unchanged.** `src/panel.tsx` mounts
  `@source-taster/ui/check-workspace` with the host adapters documented in #82:
  - preferences: `extensionPreferenceStorage`, the same never-block policy as web
  - identity: `extensionGuestIdentity` over `extensionGuestIdentityStorage`
  - transport: the existing v2 client, `client: "extension/0.0.0"`
  - site: an explicit `websiteUrl`

  Tailwind sources and `workspace.css` come from the shared UI package. The
  extension has no scoring, comparison, identity parameters or lifecycle code.
- **Explicit development configuration only.** `extension-config.ts` accepts
  only HTTPS origins, or HTTP on loopback. Origins must not carry a path, query
  or user. The defaults are local development origins
  (`http://127.0.0.1:3100` API, `http://127.0.0.1:5173` information site). The
  name is "Source Taster (development)", and the gecko ID is
  `development@source-taster.invalid`. No public domain, legal text, listing or
  download is implied.
- **Modes.** Standalone mode is the default. Hosted mode requires
  `SOURCE_TASTER_EXTENSION_MODE=hosted` and
  `SOURCE_TASTER_EXTENSION_SERVICE_URL`. In hosted mode only, the panel creates
  `guestCredentials({ client: "extension" })`. Tokens, Check input and results
  stay in page memory.

### Permissions, derived from evidence

| Manifest field | Chromium | Firefox | Reason |
| --- | --- | --- | --- |
| `permissions` | `sidePanel`, `storage` | `storage` | Native panel; extension-local Guest ID and Preferences |
| `host_permissions` | `http://127.0.0.1:3100/*` (API origin only) | `http://127.0.0.1/*` | The verification API sends no CORS headers, so the panel needs host access to it. The Guest service answers CORS for configured extension origins and gets no host permission. |
| CSP | `script-src 'self'; object-src 'self'` | same | All executable code is packaged; no remote code |
| Minimum | `minimum_chrome_version` 116 (`sidePanel.open`/side panel API) | `strict_min_version` 128.0 | See below |

There are no content scripts, `web_accessible_resources`,
`externally_connectable`, `scripting`, `tabs`, `contextMenus` or broad host
patterns. A grep of both dists finds no remote `import()`, remote script `src`
or `importScripts` (`.tmp/st92/dist-final.txt`).

Firefox match patterns cannot carry a port. MDN, *Match patterns*: "Firefox
doesn't support the inclusion of a port number due to (Firefox bug 1362809)
and (Firefox bug 1468162)." The Firefox pattern is therefore host-scoped to the
configured API host, whose loopback host is `127.0.0.1`.

MV3 `host_permissions` were not shown in the Firefox install prompt before
Firefox 127. MDN, *Firefox 127 release notes*: "host_permissions for Manifest
V3 extensions are now displayed to users during installation (Firefox bug
1889402)". Before 127 these permissions are effectively optional. The original
115.0 floor was therefore unsupported and was raised to 128.0, the first ESR
after 127. **Firefox 128 ESR itself was not executed.** Only Developer Edition
160.0b1 ran (see Limits). A user who revokes the host permission gets the
explicit connection-failure message. There is no fallback.

### Trusted extension storage

- **Chromium.** The background calls
  `storage.local.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" })`. The
  native test also observes that call resolving, an empty `storage.sync`, and
  only `BACKGROUND` and `SIDE_PANEL` contexts. From an ordinary web page it
  observes no `chrome.runtime.id`, no `chrome.storage`, and blocked fetches of
  `panel.html` and `manifest.json`.
- **Firefox.** It has no `setAccessLevel`. The restriction rests on the
  manifest: no content scripts, `web_accessible_resources`,
  `externally_connectable` or `scripting`.
- **Panel guard.** `trustedExtensionPage()` refuses to mount unless the page
  origin is the extension's own `runtime.getURL("/")`.
- **Identity storage.** The Guest ID is serialized by the extension-origin Web
  Lock `source-taster-guest-id-v1`. A missing lock manager, an unavailable store
  or a corrupt value block hosted actions with an explicit message. There is no
  web or new-ID fallback, no sync store, no page messaging and no
  credential-bearing fetch bridge.

## Native automation (actual browsers, isolated profiles)

All browsers ran on the same host: macOS 27.2 (26B123), arm64, Node 24.14.0,
pnpm 12.15.0. Every profile is a fresh `mkdtemp` directory (`st92-*`) that is
deleted on close. No user profile, tab or installed browser state is used.

- **Chromium.**
  - Browser and driver: Google Chrome for Testing 156.0.8078.4
    (`ms-playwright/chromium-1248`, Playwright 1.64.1 `channel: "chromium"`),
    new headless mode.
  - Loading: the real build is loaded with `--load-extension` and
    `--disable-extensions-except`, plus `--enable-unsafe-extension-debugging`.
  - Toolbar: the action is invoked with CDP `Extensions.triggerAction` on the
    active browser tab target. This dispatches the browser's own action path,
    with real `openPanelOnActionClick`, not a pixel click on the toolbar icon.
  - Panel: the opened side panel is found as the browser's `SIDE_PANEL`
    context (`runtime.getContexts`). It is driven through a CDP session
    attached to its target, using accessibility-role queries, trusted input
    and axe.
  - Closing: a second `triggerAction` closes the panel. The panel URL is never
    opened as an ordinary page.
- **Firefox.**
  - Browser: Firefox Developer Edition 160.0b1 (`firefox --version`; BiDi
    `browserVersion` 160.0), headless.
  - Driver: W3C WebDriver BiDi over `--remote-debugging-port`, installed with
    `webExtension.install` (temporary install of the built directory).
  - Toolbar: a trusted BiDi `input.performActions` pointer click on the
    extension toolbar button in the browser chrome window.
  - Sidebar check: the open sidebar is confirmed with `SidebarController.isOpen`
    and the `webext-panels-browser` URI
    `moz-extension://<uuid>/panel.html`.
  - Reading the sidebar: the browser's accessibility tree
    (`nsIAccessibilityService`), with trusted pointer and key input.
  - System access: chrome-scope evaluation requires
    `--remote-allow-system-access`/`MOZ_REMOTE_ALLOW_SYSTEM_ACCESS=1`, used
    only for this owned throwaway profile.

## Commands

Owned environment:

- PostgreSQL 18 container `st92-native-pg-20261029-89f1` on loopback 55492.
  `DATABASE_ADMIN_URL`/`DATABASE_TEST_URL` point only there.
- Guest cases also set
  `SOURCE_TASTER_SERVICE_WORKTREE=/Users/jeffnawroth/Developer/Repositories/source-taster-service`.
  The peer is read-only at `cc316900eedde83c5e21f23383d3fa4c940937c9`, clean,
  and its contract pin `bfd3edeb79866e26f7e6057712322031bc692fbc` is unchanged.

Evidence images use
`SOURCE_TASTER_NATIVE_EVIDENCE_DIR=$PWD/docs/implementation/92-evidence`.

```sh
pnpm --filter @source-taster/extension build             # both targets, standalone dev config
pnpm --filter @source-taster/extension test:native        # Chromium native panel (standalone, actual API)
pnpm --filter @source-taster/extension test:native-guest  # Chromium native hosted Guest (both programs)
pnpm --filter @source-taster/extension test:native-firefox # Firefox native sidebar smoke (standalone)
```

Each native test builds its own target into a test-owned temp directory with
explicit configuration (`e2e/support/build.ts`). The checked behaviour is
therefore the real build output.

## Native Chromium #92 coverage (`e2e/panel.spec.ts`, 4 passed)

1. **Toolbar opens the panel.** No panel exists before the action. After it, a
   `SIDE_PANEL` context at `<extension origin>/panel.html` shows the shared
   workspace at panel width (≤ 480 px).
2. **Parity, EN and DE (one test each).** For 12 synthetic development
   witnesses, the same text is checked in the native panel and in the web app.
   Both run against the same API and fixtures at the same 360 px width.
   - The witnesses are the 10 comparison fixture cases plus ranked and tied
     Candidates.
   - Each outcome must match independent expected values taken from fixtures
     and specifications, not from either client: Verdict, displayed Scores,
     server Candidate order and exactly one server-selected Best match label.
   - The two rendered details, including evidenced Candidate blocks, must be
     equal after normalizing only server observation timestamps.
   - These are **synthetic witnesses, not the frozen 50-Reference release
     parity set**.
3. **Close, reopen and reload.**
   - Set DE and MLA, then run a Check: the verdict is correct, axe reports no
     violations, and Hilfe links to the configured site (`/docs/de/`).
   - `storage.local` holds only the validated Preferences.
   - Reload: the input and detail are empty and MLA is kept.
   - The toolbar action closes the panel, so no `SIDE_PANEL` context remains.
   - Reopen: the panel is empty. Switching to EN and running a Check passes,
     with no axe violations.

## Native Chromium #96 Guest coverage (`e2e-guest/guest.spec.ts`, 9 passed)

Setup:

- Actual both-program harness: API, PostgreSQL and the actual private peer
  service with its authority process. It is source-only and uncalibrated. The
  worker is off, the lease is 1.5 s and the clock is frozen.
- External provider and time fixtures only.
- Hosted Chromium build. The web app runs hosted on its own loopback origin.
- The peer allowlists the learned extension origin and the web origin.

| # | Case | Asserted |
| --- | --- | --- |
| 1 | Persistence | Random UUID v4 Guest ID in `storage.local` is the only key. No token, `eyJ`, `accessToken` or reference text in it. Panel `localStorage`, `sessionStorage` and IndexedDB stay empty, and axe reports no violations. The same ID survives panel close/reopen, reload and a full browser restart on the same profile. Issuance after restart is `{ guestId: same, client: "extension" }`. |
| 2 | Separation | In one native profile, web and extension get different Guest IDs, issued as `client: "web"` and `client: "extension"`. The web DE Preference stays in web `localStorage`, and extension storage has no Preferences key. The panel keeps its own language. Web storage never contains the extension ID. |
| 3 | Renewal and protected SSE | The token expires 40 s ahead and the harness clock jumps 60 s. The next Check renews the token for the same ID. `/v2/checks` uses a new Bearer, which differs from the structuring token. The `/v2/checks/{id}/events` stream uses the same current Bearer and returns 200. The clock is resynced in `finally`. |
| 4 | Revocation | Revoke during a running Check: an alert appears and lease renewals stop. After Reset, a new Check gets an API 403 and "Sie haben keine Berechtigung…". After reload, the Check stops with an explicit alert and no new token. The ID is unchanged and never replaced, there are no results, and axe reports no violations (DE). |
| 5 | Permission denial | Removing `check:create` makes the API refuse a new Check with 403 and "You do not have permission for this action." The ID is unchanged and there are no results. |
| 6, 7 | Storage failure: corrupt / full | A corrupt stored ID, or `storage.local` filled to quota through the service worker, gives "Browser storage is required to keep your Guest identity…". There is no issuance, no API request and no results. The corrupt value is never replaced, and a full store gets no ID. Panel web storage stays empty and axe reports no violations. |
| 8 | Trusted contexts | See *Trusted extension storage* above. |
| 9 | Origin refused | If the peer does not allowlist the extension origin, the panel shows only "The connection failed. Please try again." with no API request and no fallback. Once allowed, the same stored ID checks successfully. |

**Discrimination evidence.** The Guest cases passed on their first run against
the already-implemented #96 adapters, so they are not labelled RED/GREEN. Two
temporary production mutations, reverted afterwards (`panel.tsx.orig`), turned
the matching cases red:

- **Fallback mutation:** a new random ID when storage fails. Cases 6 and 7
  failed, "The storage failure was not reported"
  (`.tmp/st92/guest-mutation-fallback.log`).
- **localStorage mutation:** the Guest ID in page `localStorage` instead of
  extension storage. Cases 1 and 2 failed
  (`.tmp/st92/guest-mutation-localstorage.log`).

The #92 slices ran RED→GREEN:

- `slice1-red.log`: the build failed before the target existed.
- `slice2-parity-red.log`: no detail region in the panel.
- Then `slice1-green.log`, `slice2-parity.log` and `slice3-close.log`.

### Cross-repo finding: denied Guest issuance is unreadable by browsers

The private service's `POST /v1/guest-tokens` sends no
`Access-Control-Allow-Origin`, `Vary` or `Cache-Control` headers on its 403
problem response, **even for an allowlisted Origin**. The 200 response carries
all three. Reproduced against the actual peer with
`node .tmp/st92/cors-repro.ts` (`.tmp/st92/cors-repro.log`):

```
allowed-200 200 {"access-control-allow-origin":"chrome-extension://abcd…","cache-control":"no-store",…,"vary":"Origin"}
allowed-403 403 {"connection":"keep-alive","content-type":"application/problem+json","date":…,"transfer-encoding":"chunked"} {"type":"urn:source-taster:problem:forbidden",…
```

Browsers therefore surface every issuance denial as a CORS network error. The
client shows "The connection failed" instead of the denial message.
`guestCredentials`' permanent-denial latch, which applies to `GuestTokenError`
403, is unreachable from any browser client, web included. The system still
fails closed: no token, no Check, no new identity, as case 4 asserts after
reload.

The likely cause is that headers set by the CORS middleware are lost on the
service's error path. No private edit or pin bump was made. The fix belongs in
the peer, and a browser-level denial-latch test should follow it. Case 4 is
named for what is proven, revocation fail-closed, not issuance denial.

## Native Firefox coverage (`e2e-firefox/sidebar.spec.ts`, 1 passed)

1. A trusted click on the toolbar button opens the real sidebar at
   `moz-extension://<uuid>/panel.html`.
2. A typed Reference is checked against the actual standalone API. The detail
   shows the fixture's DOI marker, its Verdict and, after expanding the
   evidence, its Score.
3. A second toolbar click closes the sidebar. Reopening it shows an empty input
   and no detail.

`92-evidence/firefox-sidebar-check.png` is a capture of the browser window,
showing the real sidebar with its result.

## Evidence images (`docs/implementation/92-evidence/`)

All were reviewed visually:

- `chromium-panel-open.png`
- `chromium-parity-{en,de}.png`
- `chromium-panel-{de,en}-result.png`
- `chromium-guest-panel.png`
- `chromium-guest-revoked-de.png`
- `chromium-guest-storage-{corrupt,full}.png`
- `firefox-sidebar-check.png`

The corrupt and full storage images are identical, because both show the same
explicit message.

## Final executed validation

Commands were run serially from this worktree in the owned environment.
Transcripts are in `.tmp/st92/`.

Server port overrides were 54923–54928. The web normal and article stages used
web 54921 and API 54922. The native standalone suites use their own e2e server
ports. The hosted Guest harness uses OS-assigned ports.

| Command / check | Result | Transcript |
| --- | --- | --- |
| `pnpm install --frozen-lockfile` | passed | `install-final.log` |
| `pnpm pagefind:verify` | passed against the current lock | `pagefind-verify-final.log` |
| `pnpm build --force` | 12/12 tasks | `build-final.log` |
| Committed artifacts after build (`git status --porcelain`) | no differences | `artifacts-final.log` (empty) |
| Extension dist contents and SHA-256 | panel JS/CSS identical across targets | `dist-final.txt`, `dist-hashes-final.txt` |
| `pnpm audit:licenses` | 526 packages, 68 runtime | `licenses-final.log` |
| `bash scripts/refresh-advisories.sh`; `OSV_SCANNER_BIN=.tmp/st92/tools/osv-scanner pnpm audit:dependencies` | 0 blocking, 82 retained findings, 0 license issues; npm DB 29 Oct 2026 03:03:16 GMT | `advisories-final.log`, `security-final.log` |
| `pnpm typecheck` | 20/20 | `types-final.log` |
| `pnpm lint` (ESLint and Prettier) | 20/20, formatting clean | `lint-final.log` |
| `pnpm i18n:check` | 181 DE/EN messages | `catalog-final.log` |
| `pnpm --filter @source-taster/server test` | **224 passed / 12 files** | `server-final.log` |
| `pnpm --filter @source-taster/server test:authority` | **31 passed**, actual peer | `authority-final.log` |
| web `playwright test` (normal) | **48 passed** | `web-final.log` |
| web `playwright test --config bibliographic.playwright.config.ts` | **18 passed** | `article-final.log` |
| `pnpm --filter @source-taster/web test:guest` | **5 passed** | `web-guest-final.log` |
| `test:native` (Chromium panel) | **4 passed** | `native-chromium-final.log` |
| `test:native-guest` (Chromium Guest) | **9 passed** | `native-guest-final.log` |
| `test:native-firefox` | **1 passed** (rerun after the 128.0 floor change) | `native-firefox-final.log` |
| `node apps/server/scripts/release-check.ts` | expected refusal, **exit 78** | `release-refusal.log` |

**Lock and receipt binding.** The new extension importer adds 49 lockfile lines
and no new packages. The current lock SHA-256 is
`033be5baab8648a1db5b6c4751db901d1128d9b52cf3a53bedf298171d64bd21`. It is bound
by the rebuilt `.tmp/pagefind/receipt.json` and the corresponding-source
receipts: `pagefind:fetch`, `pagefind:build` and `pagefind:verify` were rerun
on this lock. No earlier receipt was reused across the change, and no approval
is inferred from it.

**Coverage of audit scripts.** `licenses.ts` inventories every workspace
importer (`pnpm -r`), which includes `@source-taster/extension`. The OSV audit
reads `pnpm-lock.yaml`. No release, packaging or store script for the extension
dist exists, and none was added: publication is closed.

**Other changes.**

- `turbo.json` adds the extension build task, with `SOURCE_TASTER_EXTENSION_*`
  as env inputs.
- The browser ESLint block covers `apps/extension/src`.
- The both-program harness's completion poll now passes the change's `client`,
  because completion is per Guest and client. This is required for
  extension-client revocation. The 31 authority cases still pass.

## Limits and remaining gates

- **Native supported-browser/OS gate: not passed.**
  - Only Chrome for Testing 156 and Firefox Developer Edition 160.0b1 on macOS
    27.2 arm64, headless, were executed.
  - Not executed: branded Chrome, Edge, Firefox release, Firefox ESR 128/140,
    Safari, Windows, Linux and headed or assistive-technology runs.
  - Chromium is not the whole native gate.
- **Firefox coverage is a standalone smoke.**
  - Hosted Guest, extension storage and trusted-context behaviour were not
    exercised natively in Firefox.
  - Its temporary install granted the API host permission. The normal-install
    grant on 128+ comes from MDN and was not executed.
- **Toolbar automation.** Chromium uses CDP action dispatch. Firefox uses a
  trusted pointer click in the browser chrome. Neither is an OS-level human
  click.
- **Parity scope.** Parity is the synthetic development witness set above, not
  the frozen 50-Reference release parity.
- **Accessibility.** Automated axe checks cover only the tested Chromium DE/EN
  scope. Human WCAG, translation, security, privacy and legal reviews remain
  pending.
- **Issuance denial in browsers is blocked by the peer CORS defect above.** The
  permanent-denial latch has no browser-level evidence.
- **Remaining gates.**
  - Calibration (release check exit 78) and production or hosted activation
    remain closed. No qualification receipt was produced.
  - Store listings, signing, downloads and publication remain closed. Public
    domain and legal content stay unapproved.
  - Live provider, load, and #93 selection/context-menu work also remain
    outside this delivery.

## Owned-resource cleanup

At handoff:

- The owned test build directories and profiles (`$TMPDIR/st92-*`) are removed.
  Every native test deletes its profile and build on close; leftovers from
  aborted probes are removed by exact `st92-` prefix.
- Container `st92-native-pg-20261029-89f1` is stopped and removed with
  `docker stop` then `docker rm`, without force.

Unrelated containers, including `source-taster-demo-k60piqfh` and
`st-verification-dev-postgres-1`, as well as other worktrees, `.claude`,
services and ports 8000/4567 were not touched. The private peer remains clean
at `cc316900…`. Ignored local transcripts stay in `.tmp/st92/` for review.
