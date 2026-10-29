# #96 Guest authority implementation

This branch starts at `fb466356eed6e5be96e3d96047e757160f151b9f` on
`spec/70-doi-and-guests`, with #74 and #81 integrated. It implements the public
part of #96 under implement-spec and the TDD skill, against the approved real-PG
HTTP/SSE and browser seams. The independent proprietary implementation remains
in its private worktree. No predecessor, Account implementation, measurement
corpus, issue mutation, PR, deployment or publication is part of this work.
Parent owns integration and final Standards/Spec review.

## Transport distribution and license boundary

The first built transport pin was
`785a2f64bef1794af3e90a841237eae38526977f`. The final transport pin is
**`34af799970b7a82db2c681956b95b3e58fa71ea8`**, pushed and reachable before
private installation. Every private consumer, including its web app, uses that
full SHA for `contract-service`, `contract-internal` and `contract-verification`:

```text
github:jeffnawroth/source-taster#34af799970b7a82db2c681956b95b3e58fa71ea8&path:packages/contract-service
github:jeffnawroth/source-taster#34af799970b7a82db2c681956b95b3e58fa71ea8&path:packages/contract-internal
github:jeffnawroth/source-taster#34af799970b7a82db2c681956b95b3e58fa71ea8&path:packages/contract-verification
```

These packages contain transport schemas/client code, committed JS/declarations
and OpenAPI only, under `AGPL-3.0-or-later OR MIT`; the private consumer elects
MIT. Identity persistence, renewal policy, authority guards, cryptography,
verification, catalogs and persistence are independently owned implementations.
No registry replacement, vendored contract, workspace/local dependency or AGPL
implementation import enters the private program. FA-UEB-23's legal review of
the concrete combined arrangement remains open.

The service contract adds Guest issuance/renewal and public JWKS. The internal
contract adds current Guest binding/permission decisions and versioned Owner
invalidation/acknowledgement. Protected verification routes document 401, 403
and 503. `quota: {status: "not-implemented"}` explicitly supplies **no hosted
allowance**. Standalone's `quota: null` still means no Quota applies. #99 owns
actual Guest reservation/journal/settlement; #81's durable settlement intents
remain intact.

## Identity, tokens and keys

Each client environment generates a cryptographically random UUID v4 Guest ID.
The web adapter persists only that ID in origin-local storage, serialized across
tabs with Web Locks. The extension adapter accepts an injected
`browser.storage.local` capability and an exclusive lock. Its interface exposes
no sync store, page messaging, Preference binding or general authenticated-fetch
proxy. #92 must supply the trusted native panel/manifest/access restrictions.
Invalid or unavailable identity storage blocks hosted actions with an explicit
message; it never silently creates a replacement identity. Explicit standalone
continues working with disabled storage.

The service owns the Guest context and assigns distinct opaque actor and Owner
IDs. Renewal keeps that binding. Tokens stay in memory. The credential supplier
runs for every API fetch and SSE reconnect, renews within 30 seconds of expiry,
and shares one in-flight renewal. Forbidden issuance stays denied; there is no
automatic Guest replacement. Current denial, expiry or authority unavailability
stops the affected stream and the workspace's lease acknowledgement. Dropped
connections reconnect with a freshly supplied credential, Check-bound cursor
and client-version header. Previously delivered content cannot be recalled;
Check content is never written into client persistence.

Access tokens use native Node/OpenSSL Ed25519, fixed `EdDSA`, `typ: at+jwt` and
`purpose: guest-access`. Validation requires a known key, canonical base64url,
strict header/claim shapes, trusted issuer, exact verification audience, opaque
actor/Owner/context binding, `nbf = iat`, no future issuance, and `exp = iat + 300`.
There is no clock-skew allowance. Expiry is checked again after key refresh and
inside the local output guard: online permission cannot revive an expired JWT.
No roles or cached token permissions grant current authority.

The access JWKS cache lasts at most 30 seconds, with one refresh flight, a
one-second global refresh cooldown, two-second timeout, 16 KiB document ceiling
and at most five unique keys. Unknown keys during cooldown deny immediately.
Failed refresh discards cached material and does not extend its lifetime.
Removal can therefore take at most the remaining key-cache lifetime for local
signature validation; every operation still requires online current authority.

There are three separate key pairs: service access signing, service internal
signing and verification internal signing. A program receives only the peer's
public keys. Internal assertions require `typ: service+jwt`, the sender's
configured issuer, the receiving program's exact audience, a distinct purpose,
a 30-second lifetime, and the POST method/path plus SHA-256 of the exact body.
Access JWTs cannot authenticate internal endpoints. Read-only decision
assertions grant no cached allowance. Destructive commands additionally carry a
monotonic durable version, making replay idempotent.

Internal trust files are re-read for each assertion, limited to five unique
public keys; missing, malformed, removed or unknown material denies access.
There is no stale-file fallback. Rotation uses atomic receiver public-key file
replacement with a bounded overlap, issuer restart with its new private key,
and removal of the old public key. Access rollover is exposed by the service's
current JWKS. Live signer mutation exists only in the source test harness;
there is no production key-management or Operator API in this slice. Production
key custody, rotation runbooks, clock synchronization and ASVS assessment still
need qualification.

## Current authority and serialization

The verification adapter asks the actual service on every protected request and
again after work before JSON output; each SSE replay/live frame, heartbeat and
lease mutation has its own current check. Owner mismatch remains a non-disclosing
404. Missing/invalid/expired credentials yield 401, current denial 403, and failed
service/key refresh 503 before response headers. Once streaming has begun,
denial closes silently without content-bearing errors or Hono's automatic SSE
error frame. The shared output guard also defines the obligation for future
report/export/download writers. No download endpoint exists or is tested here.

Every allow decision carries the current authority version. A decision is
obtained **outside** the local Owner lock, then checked against a durable Owner
fence while holding that lock through the effect/output. The service first
denies new decisions during a destructive transition, then retries a signed,
versioned invalidation until verification acknowledges a durable drained fence.
Acknowledgement waits for prior guarded output/commits and cancellation of
running work where work authority was removed. No service row lock is held
across that callback cycle. Older allows cannot publish after acknowledgement;
older invalidation replays cannot cancel newly accepted work. Pending delivery
remains denied across process restart.

Local lock order is Owner guard before #81's Check lock. A separate bounded
25-connection PG guard pool avoids nested Prisma pool starvation. Lock acquisition
has a three-second timeout; failure leaves invalidation pending, never completed.
Guarded writes drain before lock release. Actual upstream invocation is guarded,
but the remote response is awaited outside the Owner lock, so held I/O cannot
deadlock revocation. Abort saves I/O; Check/attempt generation, claim, revision
and lease checks remain the correctness fence for immutable result/event commits.

Workers obtain current authority before admission, before work, before progress,
after real PG source-budget waits, before every actual upstream dispatch/retry,
and before result/event commit, including technical-failure publication. Queue
payloads retain only Check/slot IDs. Check rows keep opaque context/Owner/actor
IDs, never client JWTs, Guest renewal credentials or session secrets. A denied
admission advances the scheduling turn without publishing progress, so it cannot
starve an eligible Owner. Hosted execution records `/guest-authority-1` and its
decision timeout beside #74/#81's versioned configuration.

Source outages still follow incomplete-evidence/Verdict rules. Authority failure
cannot become billed Not verifiable. Revoked work is fenced/cancelled; temporary
technical inability publishes no new Verdict and follows existing recovery/lease
cleanup. Already committed Verdicts and durable billing intents retain #81's
semantics. Account/session logout, blocking and deletion remain later features;
these tests exercise the real Guest transition only.

## Bootstrap and calibration boundary

Hosted web bootstrap uses `VITE_SOURCE_TASTER_MODE=hosted` and
`VITE_SOURCE_TASTER_SERVICE_URL` (an explicitly allowed service CORS origin).
Standalone client mode uses no Guest authority. Server mode must always be
chosen explicitly. Hosted server configuration names
`SOURCE_TASTER_AUTH_CONFIG`: trusted service origin/issuer, verification audience,
verification assertion issuer, its own internal signing key and service internal
public JWKS. Private keys are operator-owned configuration, never client bundles.
Production accepts HTTPS service origins; HTTP fixture overrides are loopback
and development only.

**Deployable hosted web/worker startup still refuses absent/ineligible exact
measurement, even with working service authority and valid Guest tokens.**
`build:release` remains closed. There is no
`ALLOW_UNCALIBRATED_HOSTED` switch, forged measurement, approved threshold or
activation permission. #94's measurement/release/Operator gate remains open.

`apps/server/test/support/guest-process.ts` is a source-only, IPC-clocked loopback
composition, excluded from deployable entrypoints and compiled artifacts. It
combines the real #74 core/source algorithm, #81 PG/pg-boss persistence/workers
and actual service tokens/current authority with synthetic/recorded upstream
fixtures. It preserves visibly uncalibrated version markers. It injects no canned
Verdict into core/store. Source and compiled deployment entrypoints are tested to
refuse this unmeasured hosted activation separately from positive development
tests. Auth success grants no Quota, abuse-control readiness or launch eligibility.

## Validation

Environment: Node 24.14.0, pnpm 12.15.0, PostgreSQL 18 on 5433, macOS arm64,
Chromium. Both-program tests own a unique disposable database with separate
verification/service roles and application/pg-boss schemas. All four real
processes run; runtime receives neither admin credentials nor peer schema grants
or private keys. Setup/cleanup alone uses admin. Domain, access/assertion, lease,
claim and service-worker clocks advance together; PG provider pacing stays real
and is observed at the HTTP fixture edge. No application-table, queue-state,
internal-call or log assertions were added. The existing PG isolation probes use
synthetic adapter fixtures. Task ports include 54210/54213–54216 plus OS-assigned
loopback fixture ports; 8000/4567 and unrelated containers/files are untouched.

| Check | Evidence |
| --- | --- |
| `SOURCE_TASTER_SERVICE_WORKTREE=/path/to/prepared/private/worktree pnpm --filter @source-taster/server test:authority` | 22 HTTP/SSE cases with real program processes and PG |
| Public server regression suite | 80 cases, including #74/#81/Structuring/website HTTP |
| Public application browser suite | 22 Chromium cases, DE/EN and axe |
| Hosted `pnpm --filter @source-taster/web test:guest` with the private-worktree variable | Five Chromium cases: real restart, concurrent tabs/separate contexts, denied storage, DE/EN revocation/axe |
| Website browser suite | 92 cases, including publication refusal, search, source/notices and DE/EN axe |
| Private validation counterpart | Guest HTTP, existing SMTP/HTTP/isolation, source and compiled processes, private browser/axe |
| Sequential `pagefind:fetch/build/verify`, root build/types/lint/catalog | Controlled source-build and normal pipeline; no qualification bypass |
| Transport rebuild and committed artifact comparison | Current JS, declarations and OpenAPI |
| Actual refreshed OSV audit and licenses | Public: 687 lock identities, 2,746 scan occurrences, 79 retained upstream findings with existing dispositions, zero blocking findings/license issues; 526 licenses/68 runtime packages. Private: 494 npm plus three exact Git pins, zero findings; 364 licenses/71 runtime packages |
| Deployable source/compiled web/worker plus `build:release` | Expected measurement refusal, exit 78 in the guard |

The authority cases cover real Correct development evidence and foreign Guests;
malformed/wrong signature/key/algorithm/issuer/audience/purpose/binding/time JWTs;
actual 300-second expiry and same-Guest renewal; access rollover, refresh outage
and immediate internal trust-file rollover; wrong-purpose/audience/body-bound
internal assertions; every implemented protected route; current revocation and
permission removal with still-valid tokens; held old snapshot and precommit
allows across drained invalidation/restart; prefetched replay frames, idle stream,
expiry, reconnect and service outage; no admission during outage; provider permit
and Retry-After waits; durable pending invalidation retry; and actual client SSE
renewal/reconnect with cursor and client-version preservation. Extension evidence
exercises the real local-storage capability shape and actual service/verification
HTTP contracts, **not a native extension UI**.

Red observations included absent Guest issuance, valid JWTs remaining usable
after revocation, unauthorized admission progress, Hono's extra denial frame and
blocked storage preventing page mounting. An initial private audit correctly
rejected its web app's obsolete contract pin; all consumers were aligned. One
browser regression run lost trace files because concurrent runs shared an output
directory; Guest artifacts now have a separate directory and final browser runs
are sequential. Setup failures and interrupted/failed runs are not passing
evidence. Final command results and exact clean branch SHAs accompany the handoff.

## Outstanding acceptance and human gates

Native Chromium extension Guest acceptance is recorded in
`92-extension-skeleton.md`. It covers:

- the actual manifest and trusted-context storage access
- extension-local persistence across panel close, reopen, reload and restart
- separate web identity and Preferences
- renewal with protected SSE
- revocation and permission refusal
- storage failure without fallback
- origin refusal

Browser-level issuance denial is blocked by a private-service CORS defect,
described there. Native Firefox, ESR and Safari Guest coverage, browser-store
availability and 50-Reference parity evidence are not delivered. They are not
relabeled as ordinary web or Chromium coverage. Downloads are future consumers of the shared output guard, with no
fictitious download test. Account/Better Auth, Quota (#99), abuse controls (#100),
History, full search/comparison, calibration/measurement and Operator activation
remain outside this slice. Existing legal/publication gates, exact dependency
exceptions, source-offer duties, security/privacy/accessibility assessments,
production origins/keys, supplier/load/browser qualification and human release
approval persist. No waiver or launch approval is inferred.


Native denial/CORS and discriminating trusted-storage follow-up evidence is
recorded in [92-review-corrections.md](92-review-corrections.md). The original
#92 checkpoint discovery is preserved separately; it is not the current denial
acceptance result. Broader qualification gates remain unchanged.
