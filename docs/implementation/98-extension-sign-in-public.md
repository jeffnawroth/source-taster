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
