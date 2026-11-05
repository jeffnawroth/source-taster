# #93 Native selection context-menu intake

Implements #93 of #70 under ADR-0026. This is implementation evidence, not the
supported-browser or release qualification gate.

## Reconciliation

- Worktree: `/Users/jeffnawroth/.t3/worktrees/source-taster/t3-4fdc78f2`.
- Branch: `t3/check-selected-text-context-menu`.
- Initial HEAD was the local integration tip
  `1e14d63dfa85d19ce6a98e2713a5aa480bc4b10f` (no reset needed).
- Merged parked `t3/selection-context-menu-intake` at
  `f35e6a03db4fde79a9943696327c1907d8fc48de`, preserving its original ordinary-page
  RED/GREEN evidence. Merge commit: `3ff630d`.
- Initial conflicts were additive in `.gitignore` and
  `packages/ui/src/check-workspace.tsx`. Kept the Account controls, import/upload
  state and selection intake; no generated artifacts were hand-merged.
- Completion implementation: `ac24917`. Merged the then-latest integration tip,
  `939510addaccb22a1c90f081893cf40308dc7179`, in `ca04c21`, including #91 retention.
  This merge had no conflicts. Regenerated Prisma and rebuilt transport artifacts;
  tracked transport artifacts reproduce without differences.
- No integration checkout changes, push, PR, ticket mutation or nested agent.

## Behavior

The menu is registered for `selection` only, without URL restrictions. Chromium
uses `contextMenus`, Firefox uses `menus`, and both use the browser-localized DE/EN
catalog. The menu callback calls the native panel-open API before promises,
messaging or asynchronous reads, and consumes only native `selectionText`.

A trusted panel uses an extension runtime port and its window ID. The background
keeps at most one transient handoff per window for 30 seconds; failed or abandoned
opening discards it. Content never goes into extension storage. Ports reconnect
when disconnected, and a stale port cannot swallow the next selection. Only the
extension's exact `panel.html` may subscribe. There is no page message bridge,
content script, injected script or selection host access. The API host permissions
already documented in #92 remain; the only new permission is the native menu API.

Intake fills a new draft without creating or cancelling a Check. Running Checks
keep their stream/lease, and completed evidence remains reachable. A replacement
clears obsolete library/document preparation and offers one-step Undo, including
a library preview or an unsent document's visible file selection. Editing or
submitting a draft clears Undo. An empty native payload preserves the draft and
shows the copy/paste notice. Firefox's exactly 16,384-character payload shows the
possible-shortening notice. Notices, Undo and excluded-surface guidance are DE/EN.

## TDD evidence

Seams were already agreed in #70: browser E2E for intake and native panels; real
HTTP/SSE with disposable PostgreSQL for Check preservation and library import.
Only external browser/provider boundaries are substituted. No additional seam
approval was needed.

Logs are retained under `/tmp/source-taster-70/`:

| Slice | RED evidence | GREEN evidence |
| --- | --- | --- |
| Parked ordinary-page intake | `93-intake-red.log`: native menu absent | `93-intake-green.log`: 1 passed |
| Draft Undo | `93-undo-red.log`: Undo button absent | `93-undo-green.log`: 1 passed |
| Empty selection | `93-empty-red.log`: notice absent | `93-empty-green.log`: 1 passed |
| Imported draft replacement | `93-library-red.log`: old preview remained | `93-library-green.log`: 1 passed |
| Native Firefox cap | `93-firefox-cap-red.log`: notice absent after actual native truncation | `93-firefox-cap-green.log`: 2 passed including DE |
| Runtime port disconnection | `93-port-red.log`: new selection lost | `93-port-green.log`: 1 passed |
| Visible document Undo | `93-document-undo-red.log`: file input not restored | `93-document-undo-green.log`: 1 passed |

Further coverage exercises same-origin and cross-origin frames, a textarea,
contenteditable, line breaks in the delivered payload, DE notices, no automatic
API requests, storage without selection content, an actual running Check that
finishes after intake, unchanged finished evidence, and Firefox's built-in PDF
viewer with a synthetic PDF.

## Validation environment and commands

Commands run from the worktree root. Installed with
`pnpm install --frozen-lockfile` (`93-resume-install.log`). No dependency or lockfile
change. Built i18n with `pnpm --filter @source-taster/i18n build` and dependencies
with `pnpm exec turbo run build --filter '@source-taster/server^...'`; its seven
non-website tasks passed, and its initial website task refused the missing local
controlled-Pagefind receipt. The receipt prerequisite was then prepared separately.

A first shared-PostgreSQL startup hit reserved connection slots. Subsequent final
runs use only this ticket's `st93-selection-postgres` container:

```sh
docker run --name st93-selection-postgres -e POSTGRES_PASSWORD=postgres \
  -p 127.0.0.1::5432 -d postgres:18
# This run allocated 32768, as reported by docker port st93-selection-postgres 5432.
export DATABASE_ADMIN_URL=postgres://postgres:postgres@127.0.0.1:32768/postgres
export DATABASE_TEST_URL=postgres://verification_test:verification_test@127.0.0.1:32768/source_taster_test
export SOURCE_TASTER_E2E_API_PORT=3901
export SOURCE_TASTER_E2E_AUX_PORT=3902
export SOURCE_TASTER_E2E_WEB_PORT=5293
```

The harness creates and drops a random database and role per run. Provider
fixtures use OS-assigned loopback ports. Serial test commands own 3901/3902/5293.

| Exact command | Result / log |
| --- | --- |
| `pnpm --filter @source-taster/server generate` | passed after integration merge; `93-prisma-integrated.log` |
| `pnpm --filter @source-taster/contract-verification build` followed by `git diff --exit-code -- packages/contract-verification/dist packages/contract-verification/openapi-v2.json` | passed, no artifact differences; `93-contract-integrated.log` |
| `pnpm --filter @source-taster/extension test:native-selection` | **13 passed** after integration; `93-selection-integrated.log` |
| `pnpm --filter @source-taster/web exec playwright test preferences.spec.ts imports.spec.ts` | **12 passed**; `93-web-regression.log` |
| `pnpm --filter @source-taster/extension test:native panel.spec.ts` | **8 passed**, including DE/EN web-panel parity, reload/storage/axe, corrections, exports and imports; `93-panel-regression.log` |
| `pnpm --filter @source-taster/extension --filter @source-taster/ui --filter @source-taster/web --filter @source-taster/server typecheck` | all four passed after integration; `93-types-integrated.log` |
| `pnpm --filter @source-taster/extension --filter @source-taster/ui --filter @source-taster/web lint` | all three passed after integration; `93-lint-integrated.log` |
| `pnpm i18n:check` | passed, 336 DE/EN messages plus website content; `93-i18n-final.log` |
| `SOURCE_TASTER_EXTENSION_API_URL=http://127.0.0.1:3901 SOURCE_TASTER_EXTENSION_WEBSITE_URL=http://127.0.0.1:5293 pnpm --filter @source-taster/extension build` | Chromium and Firefox passed after integration; `93-build-integrated.log` |
| `SOURCE_TASTER_API_URL=http://127.0.0.1:3901 pnpm --filter @source-taster/web build` | passed; `93-web-build-final.log` |
| `node apps/server/scripts/release-check.ts` | expected refusal, exit **78**, uncalibrated configuration; `93-release-refusal.log` |

The existing regression harness also needs the local controlled website preview.
The following prerequisite commands passed (no publication):

```sh
pnpm pagefind:fetch
pnpm pagefind:build
pnpm --filter @source-taster/website build
```

Transcripts: `93-pagefind-fetch.log`, `93-pagefind-build.log`,
`93-website-preview.log`. Source-built controlled Pagefind 1.5.2 was verified for
`aarch64-apple-darwin`; the website delivered its hash-bound browser source/notice
package. Initial attempts without `dist-preview` or before its final artifact
receipt existed failed at harness startup and are not behavioral failures.

An assertion script inspected both emitted manifests and locale catalogs
(`93-manifests.log`): exact native menu permissions, unchanged API-only host
patterns, no content scripts or external connection bridge, and literal DE/EN menu
translations all passed. A first dependent build/test run raced the contract
rebuilder's deletion/recreation of `dist`; dependent validation was rerun after
regeneration, serially. Those setup failures are not counted as TDD evidence.

The package assertion command (after the explicit-origin extension build above):

```sh
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
for (const target of ['chromium', 'firefox']) {
  const directory = `apps/extension/dist/${target}`;
  const manifest = JSON.parse(readFileSync(`${directory}/manifest.json`, 'utf8'));
  assert.deepEqual(manifest.permissions, target === 'chromium'
    ? ['sidePanel', 'storage', 'contextMenus'] : ['storage', 'menus']);
  assert.deepEqual(manifest.host_permissions, [target === 'chromium'
    ? 'http://127.0.0.1:3901/*' : 'http://127.0.0.1/*']);
  assert.equal(manifest.content_scripts, undefined);
  assert.equal(manifest.externally_connectable, undefined);
  for (const [locale, title] of [['en', 'Check selected text'], ['de', 'Ausgewählten Text prüfen']]) {
    assert.equal(JSON.parse(readFileSync(`${directory}/_locales/${locale}/messages.json`, 'utf8')).check_selected_text.message, title);
  }
  console.log(`${target}: native menu permission only; existing API host scope; no content scripts; DE/EN menu titles passed`);
}
JS
```

## Evidence limits and gates

- Chromium automation supplies the menu-click event at the browser API boundary,
  retaining the real gesture dispatch, native side panel, runtime ports and shared
  workspace. It does not click the OS menu or prove Chromium PDF selection or
  native line-break preservation. No contingency permissions were added.
- Firefox automation chooses the real menu entry through trusted browser-window
  input, with actual native `selectionText`, native truncation and the built-in PDF
  viewer. Test DOM selection is performed only by the test driver, never by the
  extension. Synthetic PDF text carries no private/customer content.
- Runtime-port disconnection is tested. CDP worker-stop probes stalled and are
  not evidence of actual worker suspension/restart. Their owned browsers were
  terminated and temporary profiles cleaned up.
- Executed on macOS arm64, Chrome for Testing 156.0.8078.4 and Firefox Developer
  Edition 160.0b3. Branded Chrome/Edge/Brave, Firefox release/ESR, Windows/Linux,
  Reader View, restricted/file pages, private-window exclusions and human/AT
  accessibility remain in browser qualification. No source activation, Quality
  gate, release, store or publication qualification is claimed.

## Cleanup and final checks

`docker exec st93-selection-postgres psql -U postgres -Atc "SELECT 'owned test databases=' || count(*) FROM pg_database WHERE datname LIKE 'source_taster_test_%'; SELECT 'owned test roles=' || count(*) FROM pg_roles WHERE rolname LIKE 'verification_test_%';"`
reported **2 remaining owned test databases and 2 owned test roles** after the
harness runs, which included aborted startup attempts. Removing the dedicated
container removed these remaining test resources as well.
`docker stop st93-selection-postgres` and `docker rm st93-selection-postgres`
passed. `lsof -nP -iTCP:3901 -iTCP:3902 -iTCP:5293 -iTCP:32768 -sTCP:LISTEN`
reported no listeners. See `93-cleanup.log`. Other containers, processes and
checkouts were untouched. Successful browser runs remove their profiles/builds;
the two aborted worker probes' exact owned profile paths were also removed.
Ignored local test logs, website build tooling/receipts, and application builds
remain for inspection.

`git diff --check` and the targeted Prettier check passed. The implementation and
this receipt are committed on the ticket branch. A final
`git merge --no-edit spec/70-launch-integration` confirmed the latest integration
ancestor before handoff.

## Shared-root integration continuation

See [the combined integration handoff](70-launch-integration-log.md#launch-integration-90-93-and-137-with-91) for the
#90/#91 retention composition, selected-text draft compatibility, scoped #80
browser-fixture default, current validation and unchanged qualification gates.
Earlier temporary logs named above disappeared during the interruption; new
continuation evidence lives in `.tmp/spec-70-orchestration/` in the integration
checkout.
