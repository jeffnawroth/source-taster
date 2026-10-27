# Wave 2 review correction pass

This is implementation evidence for the accepted round-1 Standards and Spec
findings, not review closure. The parent owns the integration branches, PRs and
fresh independent reviews. Earlier green CI predates these fixes.

The public correction branch started clean at integration
`2402531f74f728d9cade4178cefcef3023ac966e`. The exclusively assigned private
implementation checkout started clean at `3702eb8dae24a8bd1db5b276236526b1ab378a4f`;
its integration at `4ef9ae7a86c5b93449768db493c16d7285c0be49` had the identical tree.
No predecessor repository/local copy was read or cloned, and no subagents ran.

## Findings and corrections

| Accepted finding | Correction | Boundary evidence |
| --- | --- | --- |
| Spec 1, P1: source promise rejection aborts the attempt | The guarded operation returns the pending response without awaiting it. Only guard/claim/cancellation failures abort the attempt; the adapter classifies actual source timeout/error, records attempts and applies the one-retry policy. Progress guards also abort on authority failure. Recovery of an interrupted run after its original deadline produces a free failed Status under restored current authority, never a zero-attempt billable source Verdict. | Both real programs, PG, HTTP snapshots and held external source responses: red remained running after 28 seconds; green ends before 30 seconds with Not verifiable, both named sources unavailable and two actual attempts each. Source failures need no 45-second claim recovery or zero-attempt substitute. The authority Retry-After negative control is also advanced through claim recovery after restoration; red produced a zero-attempt Not verifiable, green produces failed Status. |
| Spec 2, P2: reservation expires during active I/O | A durable pre-dispatch reservation covers the remaining Reference deadline, bounded by 30 seconds. Under the current Owner guard, a short provider transaction revalidates the reservation, pacing and shared cooldown, then commits a request lease and a 100-ms dispatch window. Invocation must fit that window or reacquire without sending. Pacing includes the entire window, so actual sends cannot compress the configured spacing. No provider transaction remains at invocation; the Owner guard protects invocation only and never awaits headers/body. An explicit adapter-owned timer and AbortController remain alive through complete body reads; the reader is owned immediately at headers and explicitly cancelled on timeout/cancellation. Normal completion/cancellation releases in finally; a crash before dispatch recovers by the deadline and a committed dispatched claim by its request lease. | Two real hosted workers and delayed authentic authority responses reproduced a second Crossref request while the first was open. Green holds the response body beyond headers, observes closure before the next request and retains actual-send spacing. Existing shared public-pool, Retry-After, cancellation, supersession and killed-worker cases remain in the regression suites. |
| Standards 1 / Spec 3, P2: stale hosted peek bypasses round robin | Admission selects the **global** eligible head under the scheduler transaction lock, then checks that it matches the subject protected by the current Owner guard. A stale selection returns without admission; the callback retries with the current subject outside the old guard. Denied Owners still advance their turn, and maintenance wake-ups remain. Owner → scheduler → Check ordering never reverses. | Real hosted concurrent workers, two Checks eligible before startup, authentic authority-response barrier: red admitted 10 A / 0 B; green first admission wave is 5 / 5, then reaches 10 / 10 without stranding wake-ups. Cancel over HTTP cleans up both. |
| Standards 2, P2: same key material accepted with different PEM formatting | The independently owned private service compares derived Ed25519 public-key identity, in addition to key-ID separation, rather than PEM encoding. Access/internal/peer separation and live trust-file rotation remain. | Private process/config/HTTP test: LF versus CRLF encoding of the same material under distinct IDs previously kept serving; startup now refuses and cannot issue a Guest token. Distinct-key issuance and existing access/internal rotation tests remain. Private code stays private. |
| Standards 3, P2: breaking numeric `/v1` SSE | Numeric cursors, including previously accepted leading zeros, remain accepted and receive numeric IDs. Missing cursor also uses numeric IDs. Bound cursors opt into bound IDs; the current client sends `{checkId}:0` on initial attachment and bound cursors on resume. Current clients still validate Check identity, exact cursor, contiguous ordering and deduplication. Owner/current-authority checks are unchanged. | Frozen, unmodified public #74 client and schema artifacts from `8b156fa8b618fac94aea5a52feccbc458099000f` actually parse HTTP/SSE Status and DOI Verdict frames and reconnect with numeric cursors. Output IDs are checked numerically, and equivalent bound replay is checked separately. Malformed/future/foreign bound cursor and authority/replay controls remain. The inaccurate intentional-break statement in the #81 handoff is corrected. |
| Standards 4, P2: raw evidence reasons in DE/EN | Every current adapter reason maps to understandable DE/EN text. Unknown reasons use a localized fallback with an own-property check, never raw diagnostic text. | Four browser cases use real upstream unavailable/invalid evidence, expand the result details, assert localized messages and absence of implementation codes, and run axe in DE/EN. Red failed on missing localized explanation; green passes. |
| Standards 5, P3: repeated fencing predicate | One same-module eligibility predicate checks running Status, generation, revision and claim expiry. Progress/finish retain the Check transaction lock and lease/cancellation checks; the read-only abort probe remains an optimization. | Existing HTTP/SSE cancellation, claim expiry, supersession, recovery, lease and replay tests; no predicate-mirroring unit tests. |

The changed measured behavior is marked `/lifecycle-2`,
`round-robin-checks-2`, `deadline-then-request-1` and its 100-ms dispatch margin in
run evidence. This is a new uncalibrated configuration, not a measured release.

## Transport and dependency provenance

The built transport correction was committed and pushed publicly **before**
private installation. The new full Git contract pin is
`bfd3edeb79866e26f7e6057712322031bc692fbc`; it replaces
`34af799970b7a82db2c681956b95b3e58fa71ea8` in all private consumers,
lockfile, evidence policy and validation handoff. The three Git subdirectory
packages still elect MIT under the existing narrow dual-license exception.
No implementation import, vendored private transport, registry replacement or
local link was introduced. Fresh independent review of this correction is pending.

The public dependency graph and controlled build recipe are unchanged. Controlled
fetch/build/verify and actual website/source-delivery qualification were rerun.
The private Git dependency graph changed, so installation, exact-commit OSV lookup,
offline npm scan and licenses were rerun rather than treating old evidence as fresh.
OSV-Scanner 2.7.0 arm64 binary matched checksum
`d4926ef8da134332543be276dff157e4c170f99ad91fc48e89448a8816bdf70b`.
Advisory databases: npm `Tue, 27 Oct 2026 19:18:16 GMT`; Rust
`Tue, 27 Oct 2026 16:33:43 GMT`. These are point-in-time results, not daily deployed
version coverage or a launch security assessment. Public matching retained 82 raw
upstream findings with zero blocking findings and no license issues; the legal
publication gate remains blocked. Private matching covered 494 npm plus three
exact Git packages with zero findings. License inventories cover 526 public
packages/68 runtime and 364 private packages/71 runtime.

## Executed validation

| Command / suite | Final result |
| --- | --- |
| `pnpm pagefind:fetch`, `pnpm pagefind:build`, `pnpm pagefind:verify` | Passed; controlled arm64 source/tool build and verification |
| `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm i18n:check` | Passed; final server build/types/lint repeated after timeout/reader/recovery hardening |
| Root `pnpm test`, then final `pnpm --filter @source-taster/server test` | Passed; final server run **82 cases**, nine files |
| `SOURCE_TASTER_SERVICE_WORKTREE=<assigned-private-checkout> pnpm --filter @source-taster/server test:authority` | **25 passed** in the final stable rerun, including the extended authority-recovery negative control |
| `SOURCE_TASTER_E2E_API_PORT=54313 SOURCE_TASTER_E2E_WEB_PORT=54314 pnpm --filter @source-taster/web test:e2e` | **26 passed**, including four new DE/EN unavailable/invalid evidence and axe cases |
| `SOURCE_TASTER_SERVICE_WORKTREE=<assigned-private-checkout> pnpm --filter @source-taster/web test:guest` | **5 passed**, real hosted Guest processes/browser/axe |
| `SOURCE_TASTER_WEBSITE_E2E_PORT=54315 pnpm --filter @source-taster/website test:e2e` | **92 passed**, including source/notices, DE/EN axe and publication refusal |
| Private source / compiled / browser | **14 / 14 / 1 passed**, independently owned service checkout |
| Public/private dependency and license checks | Passed with actual refreshed databases and exact new Git pin; scopes/limits above |
| Source/compiled deployable entrypoints, reachable service and valid Guests | Expected measured-configuration refusal in the authority suite |
| `node apps/server/scripts/release-check.ts` | Expected **exit 78**, uncalibrated release refused |
| Committed transport comparison with `bfd3edeb79866e26f7e6057712322031bc692fbc` | No artifact drift after builds; frozen legacy fixture matches original public artifacts byte for byte |
| `git diff --check`, Prettier | Passed |

Raw local transcripts are task-owned `/tmp/st-wave2-*.log`; audit reports remain
in each checkout's ignored `.tmp/audit/` directory. The 100-ms send window is
included in conservative pacing and can reduce achieved rates below the configured
ceiling; fixture compliance is not a live throughput claim. The existing 12-request
fairness observation allows 2.5 seconds rather than the default one second for this
pacing, still before the three-second held-request timeout; its exact count,
ten-per-Check, other-Check admission and cancellation assertions remain.

Test seams are the pre-approved real PostgreSQL public HTTP/SSE and browser E2E
boundaries, with external source/service-transport fixtures only. There are no
application-table, queue-state, internal-call/spying or log assertions. Frozen
legacy client artifacts are public transport, not a predecessor implementation.
The task-owned PostgreSQL 18 container uses loopback 5433 with sufficient connection
capacity for independent real processes; each test provisions unique owned
roles/databases. Runtime receives restricted per-program roles, not admin or peer
keys/schema grants. Keys/configuration are ephemeral and are not printed. Task
HTTP ports are 54310–54316 plus isolated harness/OS-assigned ports. Ports 8000/4567,
unrelated containers/files and the root private checkout remain untouched.

Earlier setup failures (absent local PG, missing generated/build artifacts),
interrupted artifact rebuild/browser runs and timing failures under overlapping
preparation are not passing evidence. The response-body and expired authority-
recovery negative controls also exposed gaps during this pass; both were corrected
and their red/green transcripts retained. Final prepared runs are reported separately.

## Integration reconciliation

The latest local public `spec/70-doi-and-guests` remains
`2402531f74f728d9cade4178cefcef3023ac966e` and is already an ancestor of this
correction branch. It is reconciled before the final push; the integration root
is not changed. The private correction branch merged latest local
`spec/70-guest-authority` at `4ef9ae7a86c5b93449768db493c16d7285c0be49` and is
clean/pushed at `100e329d0a5d1e81a38514f444e3d25298f40c5b`.
Both original private baseline/integration trees were independently verified as
`08a763fcfcd36c8310cf7349ca9863d12d26f9fc`; the reviewed public tree and required
public integration tree also match. The parent still owns merging the correction
results into both integrations and fresh independent review.

## Remaining limits

No release, calibration, publication, authorization or dependency waiver is made.
The source-only loopback uncalibrated both-program harness remains outside
compiled/deployable outputs. Source/compiled deployment entrypoints and the
measured-release guard still refuse unmeasured hosted activation. #94 calibration,
#99 real Quota, #100 abuse controls and human legal/security/privacy/tax/provider/
load/native-browser/accessibility/release qualifications remain open. #92 native
extension/panel/store/parity evidence is absent; injected adapter evidence does
not close it. Downloads do not exist and remain future guarded-output consumers.
Both integrations and fresh independent Standards/Spec re-review belong to the
parent; this correction report does not claim review closure.
