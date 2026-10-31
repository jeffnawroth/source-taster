# #98 private-service phase: required implementation and acceptance

Status: **pending**. This public phase does not complete #98. The private
workspace belongs exclusively to concurrent #99; it was neither read nor edited.
The parent implements this phase after #99 releases it. Keep #98 open until the
real private and both-program evidence below passes. #101 owns Account Preferences.

## Exact public HTTP contract

The authoritative schemas, client and OpenAPI are in
`packages/contract-service/{src,dist,openapi.json}` under the existing dual license.
Consume the parent's published full public integration SHA, updating every private
contract consumer and evidence pin together; never import public UI/domain code.
Regenerate the private lockfile/builds after repinning. No private repin was made here.

All successful bodies use `{data: ..., quota: ...}` with the existing Quota slot.
Authentication alone grants neither Quota nor another Owner's content. All six
extension routes declare RFC 9457 Problems for 400, 401, 403, 429 and 503. Do not
return successful placeholder Accounts or credentials when implementation, mail,
storage, current authority or configuration is unavailable. Unknown routes remain
failures. Never enable the public build gate merely because OpenAPI exists.

| Operation | Input / authentication | Successful `data` |
| --- | --- | --- |
| `POST /v1/extension/sign-in/challenges` | `{email, language: "de" | "en"}`; no cookies or session bearer | `{challengeId: UUID, expiresIn: integer 1..300, resendAfter: integer >=60, transactionCredential}` |
| `POST /v1/extension/sign-in/confirm` | `{challengeId, code: six digits, transactionCredential}`; no cookies or session bearer | `{session: {accountId: UUID, ownerId: UUID, email}, sessionCredential}` |
| `GET /v1/extension/session` | `Authorization: Bearer <sessionCredential>` | `{accountId, ownerId, email}` |
| `POST /v1/extension/account-tokens` | same opaque session bearer, no body | Existing `AccountTokenResponse.data`: `{accessToken, tokenType: "Bearer", expiresIn: 300, expiresAt: ISO datetime}` |
| `POST /v1/extension/session/activity` | same opaque session bearer, no body | `{accountId, ownerId, email}` |
| `POST /v1/extension/sign-out` | same opaque session bearer, `{everywhere: boolean}` | `{signedOut: true}` |

`transactionCredential` and `sessionCredential` are separate unpredictable secrets,
base64url without padding, 32..512 characters. Generate at least 32 random bytes;
32 characters is a transport floor, not permission to reduce entropy. Hash secrets
at rest with independently scoped purposes; never log them, put them in URLs or
use them as verification JWTs. Only the session credential persists on the client,
under `source-taster-extension-session-v1` in trusted extension-local storage.
Transaction proof, email code and five-minute API tokens live only in panel memory.
A panel closure loses the transaction and requires a new challenge; the opaque
session survives panel closure/browser restart. No sync, ordinary page storage,
content script, message proxy or persistent Check content is added.

## Private session and email policy

Reuse the existing #97 Better Auth owned adapter/email-code machinery and stable
Account/personal Owner. Extend its *client-scoped* transaction/session policy;
do not create a parallel identity store or silently merge Guest identities.

- Bind challenge, transaction secret and successful confirmation to the initiating
  extension transaction. Web challenges/cookies cannot complete an extension
  transaction and extension proof cannot complete web sign-in. Atomically consume
  both proofs; reject expiry, superseded codes, replay and concurrent use. Initial
  policy remains six digits, five minutes, three failed entries, resend >=60s,
  five emails/address/hour plus existing cross-transaction/abuse budgets. Responses
  stay Account-existence-neutral; no plaintext delivered code or secret at rest.
- Confirmation establishes exactly one confirmed Account/personal Owner using the
  existing concurrency rules. Return an independently created extension session;
  never copy a web session or transfer Guest Checks, grants, Quota or identifiers.
- Extension endpoints **never read or set web cookies**. A web cookie, another
  bearer purpose, a claimed extension ID, Origin alone or generic app permission
  cannot authenticate them. Conversely the opaque extension bearer is rejected by
  cookie-only web endpoints. Keep #97 paths, envelopes and cookie policy compatible.
- Qualify allowed Chromium and actual Firefox extension origins; reject arbitrary,
  absent/spoofed origins according to the deployment profile, without trusting a
  caller-provided extension ID. Support cookie-free CORS/preflight for POST JSON
  and Authorization, with exact allowed origins, `Vary: Origin` and no-store on
  successes **and all Problems**. Avoid the #92/#96 lost-error-CORS regression.
  The public manifest adds no service host permission. Firefox dynamic origins
  require actual deployment qualification, not a wildcard or new broad permission.
- Sessions retain configurable seven-day idle and thirty-day absolute limits.
  Session reads, background refresh, SSE reconnect and token issuance do not extend
  idle expiry; only foreground activity does, within the absolute deadline. Do not
  rotate the session secret on routine reads/token renewal: the present public
  contract has no credential-rotation response. Any rotation change requires a
  coordinated contract/client transition, with logout/refresh race tests.
- Issue the existing five-minute `purpose: account-access` JWT, binding the same
  stable actor/Owner plus this extension's session ID, using current JWKS. Preserve
  the current-authority check at every protected request/output/replay/download and
  worker dispatch/commit, expiry checks and fail-closed service/key outage behavior.
  Generic permissions never override resource Owner checks, including Operator.
- `everywhere: false` revokes only this extension session. Web sign-out here revokes
  only that web session; other authorized clients continue. `everywhere: true`,
  from either client, revokes all Account sessions across web/extension. Reuse the
  existing versioned fence/drain protocol; do not blanket-cancel another client's
  valid work for ordinary sign-out. Lease expiry, unfinished reservation release,
  late-result rejection, blocking/deletion and completed billing remain unchanged.
- Serialize confirmation, renewal, revocation and account deletion. Client storage
  writes happen after confirmation: storage failure performs best-effort revoke
  of the orphan session and **does not** expose a signed-in workspace. Lost replies
  can still leave an orphan; bound it through session policy and test recovery.
  A server revoke followed by a failed local removal must never revive authority.
- Restore invalidates all pre-restore sessions/challenges, including opaque extension
  credentials and already issued JWTs through current authority. Preserve surviving
  Account/Owner identities, legitimate grants and tombstones; no backup revival.
- Preserve the #97 Better Auth transitive Selected-release gate, human security,
  mail/key custody, browser/OS qualification and release/source activation gates.
  This handoff grants no qualification or publication approval.

## Required real private and both-program tests

Use #70's confirmed HTTP/SSE/download seam with **real PostgreSQL**, actual private
Better Auth/session policy, captured mail transport and adapter-edge provider/time
fixtures; use actual web and native clients for browser-only behavior. The public
HTTP fixture in `e2e-account` is explicitly *not* this evidence and cannot replace
these tests. Run focused serial suites with owned resources; parent assigns ports
if 4601/4602/5361 are no longer available.

1. Deliver a real captured code to new/existing Account extension sign-in; prove
   stable Account/personal Owner, challenge binding/replacement/guess limits,
   concurrent consumption, replay rejection, mail failure and no Guest transfer.
   Exercise web/extension proof and session-purpose substitution in both directions.
2. Independently sign in web and extension to the same Account. Verify same current
   Owner/Plan/Quota/History, distinct server sessions, extension-local opaque storage,
   HttpOnly host-scoped web cookie and memory-only API tokens. Close/reopen panels,
   restart browsers and update the extension; no Check input/results may restore.
   Observe actual trusted/untrusted, sync, ordinary page, URL and diagnostic boundaries.
3. Sign out here in each direction while both clients are active: only that session
   and its streams/leases stop, other authorized client remains usable. Sign out
   everywhere from each client: both sessions and stale JWT reads/streams/replays/
   downloads fail. Cover refresh/logout races and session storage/removal failures.
4. Drive idle and absolute clocks through exact boundaries; foreground activity
   extends idle only, background token refresh does not. Expired response tokens,
   revoked/unknown sessions and service/JWKS partitions fail closed. Reset/reconnect
   never switches a failed Account operation to Guest or reuses expired authority.
5. Test current permission revocation, cross-Owner substitutions with generic app
   permission (including Operator), SSE replay/live denial, download refusal, worker
   start/dispatch/commit, block/delete fences, late results and reservation settlement.
6. Restore revoked sessions/consumed challenges and prove all old credentials deny
   before traffic; validate current Account/Owner blocks/tombstones and no duplicate
   identity or restored content. Exercise standalone compatibility separately.
7. Run native Chromium and Firefox against the real service, including readable
   error CORS, actual supported origin/install behavior, DE/EN, keyboard/code paste,
   accessibility, restart/reconnect and sign-out scopes. Development-browser fixture
   runs do not qualify all supported releases, ESRs, OSs or assistive technologies.
8. Merge latest public/private integration, repin published contracts, regenerate
   committed artifacts, typecheck/build both programs and rerun #97 cookie/Guest
   regressions plus these focused cross-program cases. Record actual commands,
   versions, SHAs, red/green failures and limitations. Only after this evidence may
   the parent enable `SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN=enabled` in a qualified
   hosted build and accept/close #98. Leave Account Preferences to #101.
