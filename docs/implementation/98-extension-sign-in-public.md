# #98 extension sign-in — public phase

This is the public implementation under user-invoked implement-spec #70, using
its confirmed transport/HTTP/SSE and Playwright seams and the TDD skill. It starts
from verified integration ancestor `901b22d25ed1b0db8abfcbeb630247e07e5c0255` on
`t3/public-extension-sign-in`. **#98 remains incomplete** until the parent implements
and validates the private phase after #99 frees its exclusively owned workspace.
No private or predecessor code was read/edited, no checkout was created, and no
nested agent, push, PR, issue mutation, publication or activation is part of this phase.

## Public behavior

- Separate dual-licensed `/v1/extension/*` schemas, HTTP client and generated
  OpenAPI/dist. Cookie-free challenge/confirmation uses an in-memory transaction
  proof; the opaque session bearer is scoped to extension-only endpoints. Existing
  #97 cookie endpoints and Account JWT/current-authority contracts remain compatible.
- Shared bundled DE/EN email-code controls and Account/Check lifecycle compose in
  web and native panels. Guest input/results clear when identity changes; Guest IDs
  and grants do not transfer. Sign out here/everywhere explicitly sends its scope.
- Only `source-taster-extension-session-v1` persists the opaque credential, using
  extension-local storage and an extension-origin exclusive lock. Browser restart
  restores the session, never Check content. Transaction proof, codes and API
  tokens remain in memory. Storage failure is explicit and best-effort revokes the
  orphan rather than reporting successful sign-in. Cross-panel storage changes
  remount the workspace and read current session state.
- Account tokens renew in memory near expiry, sharing an in-flight renewal. Expired
  responses are rejected; 401/403 renewal latches failure through Reset. A failed
  Account operation never obtains a Guest token. Existing API expiry, Owner checks,
  SSE reconnect/current-authority enforcement and lease-stop behavior remain in use.
- `SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN` defaults to disabled. Only the exact
  value `enabled` in hosted mode opts in. It is a development/private-completion gate,
  not a security boundary or production qualification. Missing/404/503 backends are
  failures, never successful placeholder sign-in. Standalone and hosted Guest-only
  builds retain their prior composition. No manifest permission was added, including
  no service host, scripting or broad host permission. Account Preferences are #101.

## Evidence and limits

Retained local transcripts are in this worktree's `.tmp/st98/`. The public native
suite runs the **real verification HTTP/SSE API and PostgreSQL**, using the existing
source-only uncalibrated test composition. The absent private service alone is
replaced at its external HTTP boundary. Synthetic session secrets, challenge codes,
JWKS, signed Account tokens and current-authority decisions are fixture data.
There is no private session implementation or real mail/backend acceptance here.

The initial client transport test was RED because `extensionSessionClient` did not
exist (`transport-red.log`); after implementation it passed (`transport-green.log`).
The first native sign-in test was RED with no Sign in control (`panel-red.log`), then
GREEN (`panel-green.log`). The cross-panel sign-out test was RED because the other
panel kept Account input (`cross-panel-red.log`), then GREEN after storage observation
(`cross-panel-green.log`). These are the actual test-first slices; subsequent
regressions/characterizations do not claim invented red runs.

Early client-only development probes used an HTTP refusal fixture for verification;
those logs (`token-check*`, `account-current.log`) are superseded and **not acceptance
evidence**. The retained suite instead uses real verification/PostgreSQL and fakes
only the external private boundary. Initial real-API token validation exposed a
fixture clock mismatch; aligning its issued JWT with its frozen API clock fixed it
(`account-real-api.log`, then `account-real-api-green.log`). The initial token test
also expected `/checks` before the existing `/structurings` request; its assertion
was corrected to the actual published client flow, not by changing production flow.

The DE keyboard probe initially omitted Enter's text event from CDP input; the driver
was corrected (`account-native-all.log`, `german-keyboard.log`). Offline emulation did
not close an existing SSE socket; the reconnect witness now restarts the actual API
process while retaining its owned database (`streams.log`, `streams-restart.log`).
The first web witness used the wrong Vite working directory; correcting that fixture
path made the actual web entry point pass (`web-cookie.log`, `web-cookie-green.log`).
None of these harness corrections weakens product requirements or production gates.

Final validation, integration merge and owned-resource cleanup are recorded below.
See [the exact private-service handoff](98-private-session-handoff.md) for endpoint
policy and all remaining real private/both-program requirements. No local result is
CI, calibrated release, production activation, real private session independence,
Better Auth qualification or full supported-browser/OS acceptance evidence.

## Final merged-tree validation (31 October 2026)

Implementation commit `ec3644c` merged integration
`dc39bbeab3da55bc410ad866be65f5ee724318b9` as `6961171` without conflicts.
This includes #94 while preserving the required `901b22d` ancestor. Transport
source was regenerated after this merge; generated output was never hand-merged.

| Check | Actual result / retained transcript |
| --- | --- |
| `DATABASE_ADMIN_URL=<owned admin URL> DATABASE_TEST_URL=<owned role URL> pnpm --filter @source-taster/extension test:native-account` | **15/15 passed**, serial, 44.7s; `account-final.log` |
| Typecheck: extension, ui, web, server, contract-service | All exit 0; `types-*-final.log` |
| `pnpm exec eslint apps/extension packages/ui/src/web-account-workspace.tsx packages/contract-service apps/server/test/support/extension-api.ts` | Exit 0; `lint-final.log` |
| Prettier on changed extension, transport source/script, shared UI, test support and #98 docs; `git diff --check` | Passed; `prettier-final.log` |
| `pnpm --filter @source-taster/extension build` | Chromium and Firefox passed; `build-extension-final.log` |
| `pnpm --filter @source-taster/web build` | Passed; `build-web-final.log` |
| `pnpm --filter @source-taster/i18n i18n:check` | 351 DE/EN messages validated; `i18n-final.log` |
| contract-service, contract-internal, contract-verification builds; generated dist/OpenAPI comparison to committed output | Passed, no artifact diff; `regenerate-*.log`, `generated-reproducibility.log` |
| `node apps/server/scripts/release-check.ts` | Expected refusal, exit 78; `release-refusal.log` |

The final 15 cases cover native sign-in/reload; Account bearer use with real API
current-authority refusal; sign-out here/everywhere request scopes; cross-panel
content clearing; expired token rejection through Reset; revoked renewal latch;
503 and missing/404 backend failures; disabled default gate; German keyboard flow
and automated axe; Firefox native sign-in/reopen/sign-out; real Check creation,
SSE reconnect after process restart, current denial and cross-Owner 404; actual web
cookie UI compatibility; real full-storage failure; browser restart without Check
content; and strict cookie-free transport versus existing cookie web transport.
The apparent session-policy behavior in the HTTP fixture is **not** real private
backend coverage. Neither idle/absolute private expiry nor actual global revocation,
mail delivery, restore, private persistence or both-program Quota was tested here.

Browsers were Google Chrome for Testing **156.0.8078.4** and Firefox Developer
Edition **160.0b3**, headless, on this macOS arm64 workstation (Playwright 1.64.1).
Builds retain Vite's >500 kB extension chunk warning; no size threshold was changed.
No full verification, private, live-provider, Quality measurement, supported-browser/
OS qualification or CI suite was run. #94's release refusal remains intact.

The suite used fixed API/aux/browser ports **4601/4602/5361** and owned PostgreSQL18
container `st98-public-pg`, with its own randomly assigned loopback database port.
Its disposable database/role was removed by fixture teardown. Cleanup inspected
only that owned PostgreSQL instance, found no remaining `source_taster_test_*`
database, then stopped/removed that container. All three owned application ports
had no listeners afterwards (`database-cleanup.log`, `container-cleanup.log`,
`listeners-after.log`). No shared database settings or unknown resources were changed.

The parent must consume [the private-phase handoff](98-private-session-handoff.md),
repin after public publication, implement all six real service endpoints and session
policy, run the listed real private/both-program tests, and only then consider
activation/acceptance of #98. The default sign-in gate stays disabled in this delivery.

## Parent integration verification

The public phase merged into `spec/70-launch-integration` at `192272a` without
source conflicts. The merger completed validation before its model usage limit;
the parent recovered and checked its retained result ledger rather than rerunning
unchanged code. `.tmp/spec-70-orchestration/98-merge-results.json` records successful
frozen install, core/i18n and all transport builds, Prisma generation, relevant
server/client/transport typechecks, lint, formatting, i18n and application builds.
`98-merge-native-account.log` records **15/15 passed**, in 49.0 seconds, against the
real verification API and owned PostgreSQL with the private service replaced only
at HTTP. Generated-artifact fingerprints are in `98-merge-generated.json`.
The clean-tree release guard refused with exit **78**, and the owned PostgreSQL
container was removed (`98-merge-cleanup.log`). No shared resource was removed.

This verifies the public phase only. The feature stays disabled by default; real
private endpoints/session policy, contract repinning and the exact both-program
acceptance in `98-private-session-handoff.md` remain pending. #98 is not closed.
