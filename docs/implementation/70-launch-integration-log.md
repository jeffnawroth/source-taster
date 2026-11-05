# #70 launch integration log

One durable log for the cross-ticket notes written while the #70 launch integration was
assembled, reviewed and published. Each section below keeps the decisions, scoped evidence,
known limits and open follow-ups of one former dated or interim note. Ticket-specific facts
live in the matching per-ticket note (for example [#72](72-parser.md) or
[#104](104-history.md)).

Reading rules:

- Every pass count belongs to the scope and date stated beside it. Intermediate and final
  counts, and runs on different commits, are kept as separate statements and are not merged
  into one claim.
- Local checks are not hosted CI evidence, and nothing here is provider permission, browser or
  release qualification, activation, deployment approval, or PDF/UA conformance beyond what a
  section states. Wording that says a gate is "not claimed" or "open" is kept as written.
- Local log names, ports, container names and similar run-specific details were dropped as
  transient; commit SHAs, counts, advisory IDs and decisions were kept.

## Former notes and their sections

| Former note                           | Section                                                                |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `first-wave-review-fixes`             | First-wave review fix pass (October 2026)                              |
| `wave2-review-fixes`                  | Wave 2 review corrections (October 2026), round-1 pass                 |
| `wave2-retry-evidence`                | Wave 2 review corrections (October 2026), retry evidence correction    |
| `wave2-peer-keys`                     | Wave 2 review corrections (October 2026), peer-key canonicalization    |
| `70-integration-90-93-137`            | Launch integration: #90, #93 and #137 with #91                         |
| `70-merge-104-105-111`                | Launch integration: History, PDF reports and operator administration   |
| `70-integration-100-101-117`          | Staging: #100, #101, #117 and the #102 public phase                    |
| `70-integration-100-101-102-117`      | Staging: #100, #101, #117 and the #102 public phase                    |
| `cross-browser-local-nov4`            | Local cross-browser run — 4 November 2026                              |
| `70-ci-regressions-nov4`              | Public CI regressions — 4 November 2026                                |
| `dependabot-pagefind-alerts-nov4`     | Dependabot alerts on the Pagefind upstream snapshots, 4 November       |
| `dependabot-triage-nov5`              | Dependabot alerts on the Pagefind upstream snapshots, 5 November       |
| `audit-gaps-p5-erw-nov5`              | Audit gaps P-5 and FA-ERW-02/03/05 — 5 November 2026                   |
| `70-final-review-corrections`         | Final #70 review, corrections                                          |
| `70-final-review-validation`          | Final #70 review, implementation validation and correction residuals   |
| `70-final-review-publication`         | Final #70 review, publication acceptance                               |

## First-wave review fix pass (October 2026)

The pass implemented the parent's disposition of the first-wave review on a dedicated fix
branch. It started from integration `ea550fb`, then merged the local website
`feat/115-static-website` at `fa558adb167c734026dd7d42a5ef74792cb39374` without resetting
its work. Integration was verified as an ancestor. No integration branch or PR was changed.
The approved test seams were real-PostgreSQL HTTP/SSE, browser end-to-end, and captured
SMTP in the private repository. No predecessor or heldout corpus was read, and no real
recipient or unrelated container was used.

### Review responses

- **Catalog labels.** All shared help/contact/legal link labels and the navigation
  accessible name now come from the DE/EN Paraglide catalog, using the supplied interface
  language explicitly. Existing browser language-switch checks cover it.
- **Broken default destinations.** The local Vite server uses the same static hosting
  boundary for built, marked website drafts, on loopback. The browser regression clicks all
  six links in each language, observes the new tab, checks language, heading and draft
  marker, then closes it. Before the fix it opened the SPA fallback instead. `pnpm build`
  is the documented prerequisite. A qualified separate website origin remains configurable
  for production and future extension consumers. No domain or seller identity is invented.
- **Reconnect help/claims.** Both languages describe automatic reconnect and Last-Event-ID
  resume while the page stays open, permanent client-error behavior, and the actual
  cancellation/reload/History limits. Claim evidence links the transport client and SSE
  tests. Website browser coverage checks both texts; the existing dropped-stream browser and
  ordered/replay HTTP tests are retained.
- **Check limit.** Creation enforces `SOURCE_TASTER_REFERENCE_LIMIT` before
  persistence/enqueue, returning a Problem with the actual limit. The regression first
  returned 201 for 1001 References; it now returns 400. Additional HTTP coverage proves an
  Operator-configured limit of two. The placeholder Check still counts nonempty lines;
  parser preview uses recognized References.
- **Shared transport.** The dual-licensed contract client provides Check and Structuring
  requests, schema validation and a common `ApiError` carrying an optional validated
  Problem. The app shares one localization mapping. A browser regression first showed
  connection copy for non-JSON HTTP errors; both actions now show safe localized
  server-failure copy. Network errors remain distinct. Built JavaScript, declarations and
  OpenAPI are regenerated and committed.
- **TypeScript tooling.** Website inventory is strict TypeScript and included in root
  script typechecking/linting. This is a type-only conversion: traversal, retained
  native/bundled/platform entries, metadata requests, prerequisites, qualification wording
  and advisory coverage are unchanged. It was not rerun to regenerate the parent's
  inventory or qualify website dependencies.
- **Local standards.** Website environment selection is in `loadConfig`; draft production
  refusal is shared; language/legal IDs/review shape are shared; the publication CLI is
  separated from the imported runtime gate. The preview handler no longer shadows `fetch`.
  API ownership includes versioned, health and internal paths, covered over HTTP. Long Astro
  route/component expressions are split into readable blocks. Website source headers follow
  the existing AGPL license. German information content consistently calls References
  `Referenzen`.
- **Parser fixture breadth.** The original style fixtures had only one or two entries. A
  separately authored synthetic bibliography varies author names, multiple authors, Unicode,
  year suffixes, article values and book layouts across all four styles, with independently
  transcribed CSL values and a literal title span. It passed without parser changes after
  correcting a hand-counted expected offset (the parser's span was correct). No production
  quality target is inferred.

### Decisions retained and limits

The private readiness SPA and opt-in internal diagnostic are intentional observable
infrastructure seams and are retained. The tested full-SHA MIT contract pin is unchanged.
Later authentication, commerce and seven business mail types remain outside this fix pass.

No new parser heuristics were added: the varied examples did not substantiate a rule
defect, and speculative sentence/author guesses would conflict with the requirement to leave
uncertain fields empty. Existing grammar limits and the separate line-based Check remain
explicit in [72-parser.md](72-parser.md).

Security/publication gates remain **closed**. The parent's investigation of 73 upstream-lock
website audit findings, prereleases and native/WASM license/source obligations is separate.
This pass changes no audit coverage, suppressions, exceptions, dependency versions or
publication approvals. Passing installed npm license checks is not native/bundled website
dependency clearance. Legal drafts, real domain/support/seller configuration, human
translations, manual accessibility and later product functionality remain unqualified.

### Validation (Node 24.14.0, PostgreSQL 18, Chromium)

- `pnpm install --frozen-lockfile`, build, typecheck, lint and catalog completeness passed.
  Workspace-only dependency links were added for shared i18n/hosting; no external
  dependency version changed.
- `pnpm test` with isolated ports: **35 HTTP/SSE tests passed**, with unique database/role
  fixtures.
- App Playwright: **14 passed**, including link navigation, dropped stream reconnect, DE/EN
  Preferences/Structuring and axe.
- Website Playwright: **13 passed**, including search, privacy, accessibility, legal
  versions and publication refusal after the Astro cleanup.
- `pnpm audit:licenses`: 529 installed package licenses, 67 runtime packages; no website
  dependency/security clearance asserted.
- `git diff --check` passed. The integration ref was merged again before handoff.

## Wave 2 review corrections (October 2026)

Three notes cover the second round of review responses on the DOI tracer (#74) and Guest
authority (#96) integrations: the round-1 correction pass, the retry-evidence correction
and the peer-key canonicalization. All are implementation evidence, not review closure; the
parent owned the integration branches, PRs and fresh independent reviews.

### Round-1 correction pass

The public correction branch started clean at integration
`2402531f74f728d9cade4178cefcef3023ac966e`. The exclusively assigned private implementation
checkout started clean at `3702eb8dae24a8bd1db5b276236526b1ab378a4f`; its integration at
`4ef9ae7a86c5b93449768db493c16d7285c0be49` had the identical tree. No predecessor
repository/local copy was read or cloned, and no subagents ran. Earlier green CI predates
these fixes.

| Accepted finding                                                          | Correction                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Boundary evidence                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec 1, P1: source promise rejection aborts the attempt                    | The guarded operation returns the pending response without awaiting it. Only guard/claim/cancellation failures abort the attempt; the adapter classifies actual source timeout/error, records attempts and applies the one-retry policy. Progress guards also abort on authority failure. Recovery of an interrupted run after its original deadline produces a free failed Status under restored current authority, never a zero-attempt billable source Verdict.                                                                                                                                                              | Both real programs, PG, HTTP snapshots and held external source responses: red remained running after 28 seconds; green ends before 30 seconds with Not verifiable, both named sources unavailable and two actual attempts each. Source failures need no 45-second claim recovery or zero-attempt substitute. The authority Retry-After negative control is also advanced through claim recovery after restoration; red produced a zero-attempt Not verifiable, green produces failed Status. |
| Spec 2, P2: reservation expires during active I/O                          | A durable pre-dispatch reservation covers the remaining Reference deadline, bounded by 30 seconds. Under the current Owner guard, a short provider transaction revalidates the reservation, pacing and shared cooldown, then commits a request lease and a 100-ms dispatch window. Invocation must fit that window or reacquire without sending. Pacing includes the entire window, so actual sends cannot compress the configured spacing. No provider transaction remains at invocation; the Owner guard protects invocation only and never awaits headers/body. An explicit adapter-owned timer and AbortController remain alive through complete body reads; the reader is owned immediately at headers and explicitly cancelled on timeout/cancellation. Normal completion/cancellation releases in finally; a crash before dispatch recovers by the deadline and a committed dispatched claim by its request lease. | Two real hosted workers and delayed authentic authority responses reproduced a second Crossref request while the first was open. Green holds the response body beyond headers, observes closure before the next request and retains actual-send spacing. Existing shared public-pool, Retry-After, cancellation, supersession and killed-worker cases remain in the regression suites.                                                                                                       |
| Standards 1 / Spec 3, P2: stale hosted peek bypasses round robin          | Admission selects the **global** eligible head under the scheduler transaction lock, then checks that it matches the subject protected by the current Owner guard. A stale selection returns without admission; the callback retries with the current subject outside the old guard. Denied Owners still advance their turn, and maintenance wake-ups remain. Owner → scheduler → Check ordering never reverses.                                                                                                                                                                                                              | Real hosted concurrent workers, two Checks eligible before startup, authentic authority-response barrier: red admitted 10 A / 0 B; green first admission wave is 5 / 5, then reaches 10 / 10 without stranding wake-ups. Cancel over HTTP cleans up both.                                                                                                                                                       |
| Standards 2, P2: same key material accepted with different PEM formatting  | The independently owned private service compares derived Ed25519 public-key identity, in addition to key-ID separation, rather than PEM encoding. Access/internal/peer separation and live trust-file rotation remain.                                                                                                                                                                                                                                                                                                                                                                                                      | Private process/config/HTTP test: LF versus CRLF encoding of the same material under distinct IDs previously kept serving; startup now refuses and cannot issue a Guest token. Distinct-key issuance and existing access/internal rotation tests remain. Private code stays private.                                                                                                                              |
| Standards 3, P2: breaking numeric `/v1` SSE                                | Numeric cursors, including previously accepted leading zeros, remain accepted and receive numeric IDs. Missing cursor also uses numeric IDs. Bound cursors opt into bound IDs; the current client sends `{checkId}:0` on initial attachment and bound cursors on resume. Current clients still validate Check identity, exact cursor, contiguous ordering and deduplication. Owner/current-authority checks are unchanged.                                                                                                                                                                                                    | Frozen, unmodified public #74 client and schema artifacts from `8b156fa8b618fac94aea5a52feccbc458099000f` actually parse HTTP/SSE Status and DOI Verdict frames and reconnect with numeric cursors. Output IDs are checked numerically, and equivalent bound replay is checked separately. Malformed/future/foreign bound cursor and authority/replay controls remain. The inaccurate intentional-break statement in the #81 handoff is corrected. |
| Standards 4, P2: raw evidence reasons in DE/EN                             | Every current adapter reason maps to understandable DE/EN text. Unknown reasons use a localized fallback with an own-property check, never raw diagnostic text.                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Four browser cases use real upstream unavailable/invalid evidence, expand the result details, assert localized messages and absence of implementation codes, and run axe in DE/EN. Red failed on missing localized explanation; green passes.                                                                                                                                                                  |
| Standards 5, P3: repeated fencing predicate                                | One same-module eligibility predicate checks running Status, generation, revision and claim expiry. Progress/finish retain the Check transaction lock and lease/cancellation checks; the read-only abort probe remains an optimization.                                                                                                                                                                                                                                                                                                                                                                                       | Existing HTTP/SSE cancellation, claim expiry, supersession, recovery, lease and replay tests; no predicate-mirroring unit tests.                                                                                                                                                                                                                                                                              |

The changed measured behavior is marked `/lifecycle-2`, `round-robin-checks-2`,
`deadline-then-request-1` and its 100-ms dispatch margin in run evidence. This is a new
uncalibrated configuration, not a measured release.

**Transport and dependency provenance.** The built transport correction was committed and
pushed publicly **before** private installation. The new full Git contract pin is
`bfd3edeb79866e26f7e6057712322031bc692fbc`; it replaces
`34af799970b7a82db2c681956b95b3e58fa71ea8` in all private consumers, lockfile, evidence
policy and validation handoff. The three Git subdirectory packages still elect MIT under the
existing narrow dual-license exception. No implementation import, vendored private
transport, registry replacement or local link was introduced. Fresh independent review of
this correction was pending.

The public dependency graph and controlled build recipe are unchanged. Controlled
fetch/build/verify and actual website/source-delivery qualification were rerun. The private
Git dependency graph changed, so installation, exact-commit OSV lookup, offline npm scan and
licenses were rerun rather than treating old evidence as fresh. OSV-Scanner 2.7.0 arm64
binary matched checksum `d4926ef8da134332543be276dff157e4c170f99ad91fc48e89448a8816bdf70b`.
Advisory databases: npm `Tue, 27 Oct 2026 19:18:16 GMT`; Rust `Tue, 27 Oct 2026 16:33:43
GMT`. These are point-in-time results, not daily deployed version coverage or a launch
security assessment. Public matching retained 82 raw upstream findings with zero blocking
findings and no license issues; the legal publication gate remains blocked. Private matching
covered 494 npm plus three exact Git packages with zero findings. License inventories cover
526 public packages/68 runtime and 364 private packages/71 runtime.

Executed validation:

| Command / suite                                                              | Final result                                                                                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `pnpm pagefind:fetch`, `pnpm pagefind:build`, `pnpm pagefind:verify`         | Passed; controlled arm64 source/tool build and verification                                                        |
| `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm i18n:check`               | Passed; final server build/types/lint repeated after timeout/reader/recovery hardening                             |
| Root `pnpm test`, then final `pnpm --filter @source-taster/server test`      | Passed; final server run **82 cases**, nine files                                                                  |
| `test:authority` against the assigned private checkout                       | **25 passed** in the final stable rerun, including the extended authority-recovery negative control               |
| `pnpm --filter @source-taster/web test:e2e` (isolated ports)                 | **26 passed**, including four new DE/EN unavailable/invalid evidence and axe cases                                |
| `pnpm --filter @source-taster/web test:guest`                                | **5 passed**, real hosted Guest processes/browser/axe                                                              |
| `pnpm --filter @source-taster/website test:e2e` (isolated port)              | **92 passed**, including source/notices, DE/EN axe and publication refusal                                        |
| Private source / compiled / browser                                          | **14 / 14 / 1 passed**, independently owned service checkout                                                       |
| Public/private dependency and license checks                                 | Passed with actual refreshed databases and exact new Git pin; scopes/limits above                                  |
| Source/compiled deployable entrypoints, reachable service and valid Guests   | Expected measured-configuration refusal in the authority suite                                                     |
| `node apps/server/scripts/release-check.ts`                                  | Expected **exit 78**, uncalibrated release refused                                                                 |
| Committed transport comparison with `bfd3edeb79866e26f7e6057712322031bc692fbc` | No artifact drift after builds; frozen legacy fixture matches original public artifacts byte for byte             |
| `git diff --check`, Prettier                                                 | Passed                                                                                                             |

The 100-ms send window is included in conservative pacing and can reduce achieved rates
below the configured ceiling; fixture compliance is not a live throughput claim. The
existing 12-request fairness observation allows 2.5 seconds rather than the default one
second for this pacing, still before the three-second held-request timeout; its exact
count, ten-per-Check, other-Check admission and cancellation assertions remain.

Test seams are the pre-approved real PostgreSQL public HTTP/SSE and browser E2E boundaries,
with external source/service-transport fixtures only. There are no application-table,
queue-state, internal-call/spying or log assertions. Frozen legacy client artifacts are
public transport, not a predecessor implementation. Runtime receives restricted per-program
roles, not admin or peer keys/schema grants; keys/configuration are ephemeral and not
printed. Earlier setup failures (absent local PG, missing generated/build artifacts),
interrupted artifact rebuild/browser runs and timing failures under overlapping preparation
are not passing evidence. The response-body and expired authority-recovery negative controls
also exposed gaps during this pass; both were corrected and their red/green runs retained.

Integration reconciliation: the latest local public `spec/70-doi-and-guests` remained
`2402531f74f728d9cade4178cefcef3023ac966e`, already an ancestor of the correction branch.
The private correction branch merged latest local `spec/70-guest-authority` at
`4ef9ae7a86c5b93449768db493c16d7285c0be49` and was clean/pushed at
`100e329d0a5d1e81a38514f444e3d25298f40c5b`. Both original private baseline/integration trees
were independently verified as `08a763fcfcd36c8310cf7349ca9863d12d26f9fc`; the reviewed
public tree and required public integration tree also match. The parent still owned merging
the correction results into both integrations and fresh independent review.

Remaining limits: no release, calibration, publication, authorization or dependency waiver
is made. The source-only loopback uncalibrated both-program harness remains outside
compiled/deployable outputs. Source/compiled deployment entrypoints and the measured-release
guard still refuse unmeasured hosted activation. #94 calibration, #99 real Quota, #100 abuse
controls and human legal/security/privacy/tax/provider/load/native-browser/accessibility/
release qualifications remain open. #92 native extension/panel/store/parity evidence is
absent; injected adapter evidence does not close it. Downloads do not exist and remain
future guarded-output consumers. Both integrations and fresh independent Standards/Spec
re-review belong to the parent; this correction report does not claim review closure.

### Retry evidence correction

The second Spec review found one new P2: a schema-valid payload from a failed HTTP response
survived into a later retry whose headers were successful but whose body failed. Combining
that stale payload with the newer status could invent Correct or DOI conflict. The review
considered the three original Spec findings resolved by inspection; its attempted behavioral
rerun had no PostgreSQL service.

Response parsing is now local to each attempt. Only a fully read, deadline-compliant
successful/404 response can provide the payload returned for interpretation. Resolver,
singleton and combined Crossref classification additionally require the completed-response
marker before treating a status or payload as source evidence. An oversized, timed-out or
otherwise incomplete body remains unavailable evidence. The original deadline, provider
permits, retry budget, authority checks and result publication fences remain in place.

The changed Search strategy version is `doi-crossref-public-tracer-3-uncalibrated`. This
records changed outcome behavior; it is not calibration or release eligibility. The
transport artifacts and private contract pin `bfd3edeb79866e26f7e6057712322031bc692fbc` are
unchanged.

Tests use the approved real PostgreSQL HTTP/SSE seam with actual verification web and worker
processes. Only the external HTTP source fixture supplies responses. Its sequence support
produces a 503 with valid Handle/metadata JSON followed by a 200 response whose body is
oversized or never completes. There are no application-table, queue-state, internal-call or
log assertions.

- **Red:** a 503 carrying a matching nonexistent Handle followed by oversized 200 returned
  DOI conflict, with the first payload recorded as successful 200 evidence.
- **Green:** the same sequence produces Not verifiable and unavailable resolver evidence,
  preserving two attempts and the response-size reason.
- A Crossref 503 with matching metadata followed by 200 headers and a timed-out body
  produces Not verifiable, no Candidate and unavailable Crossref evidence.
- All 35 DOI HTTP/SSE tests and 80 server regression tests across eight files pass
  (`--exclude test/website.test.ts`; the unchanged website artifact is not built in that root
  checkout). The final complete authority run passes all 25 cases.

Build/typecheck for server and core, changed-file ESLint/Prettier and `git diff --check`
passed. The measured release guard refuses with exit 78. An initial preparation run could not
start because the root checkout's ignored core build was stale; a frozen install and core
rebuild corrected preparation. That startup failure is not the red behavioral observation.

The first full authority run passed 24/25 cases; the held-snapshot revocation case failed
with a local `ECONNREFUSED`. Its targeted rerun passed. Inspection found the source-only Guest
process reporting IPC readiness immediately after initiating the HTTP listener, before its
`listening` event. The fixture now awaits that event before reporting ready, including on
restart. The complete rerun passes all 25 cases; the failed run is retained as a failure, not
counted as passing evidence.

No private implementation changes or new dependency/controlled-recipe inputs were introduced.
The prior audit is retained with its recorded date and scope; no fresh advisory scan is
claimed for this fix. The existing source-only uncalibrated development composition,
release/publication gates, native extension dependency on #92, and #94/#99/#100 plus human
qualification limits remain. This response is implementation evidence; independent re-review
and current-head CI were still required.

### Peer-key canonicalization

The second Standards review confirmed fairness, numeric `/v1` SSE compatibility, DE/EN
evidence messages and the extracted attempt fence. It found one remaining P2 in key
separation: Ed25519 JWK coordinates with different unused base64url bits can identify the
same public key. Comparing their encoded strings alone can admit an own signing key as a peer
key.

Both independently owned program adapters now require canonical, 32-byte base64url
coordinates before comparing peer keys with their own public identities. Each adapter uses
the same local validation on initial configuration and every trust-file reload. Empty trust
sets and duplicate key IDs are rejected too. The private implementation remains in its own
repository. No cryptographic helper or implementation is shared through the transport
packages.

Three actual both-program HTTP/configuration cases cover verification's own internal key, the
service access key and the service internal key. Each first accepts a correctly signed request
from the legitimate distinct peer. It then installs the receiver's own key under a peer ID
with equivalent noncanonical JWK encoding and sends a correctly signed program assertion using
that key.

- **Red:** all three receivers incorrectly returned 200 after trust-file reload.
- **Green:** all three return 401, and restarting with the same invalid trust file refuses
  startup. These are actual signature/HTTP/process observations, not assertions on the
  cryptographic adapter's internal functions.
- The private process suite additionally checks alias refusal in source and compiled
  execution alongside the existing equivalent-PEM refusal.

The focused three-case rerun and all 28 authority cases pass. Private source and compiled
suites each pass 15 cases, including the new alias refusal. Public server build/typecheck and
changed-file lint/format pass; private root build, typecheck and lint/format pass. Tests use
ephemeral keys, disposable per-run databases/roles and real program processes, with only
external HTTP/transport fixtures. No verification content, keys or tokens are printed, and no
application-table/queue-state/internal-call assertions were added. The authority suite is run
with `pnpm --filter @source-taster/server test:authority` and
`SOURCE_TASTER_SERVICE_WORKTREE` pointing at the private checkout; the private suite runs with
`pnpm test` and `SERVICE_TEST_COMPILED=1 pnpm test` after `pnpm build`.

Contracts, all three full-SHA MIT dependency pins (`bfd3edeb79866e26f7e6057712322031bc692fbc`)
and dependency graphs are unchanged. Prior dated advisory/license evidence remains applicable
to that unchanged graph; no fresh scan or legal approval is claimed. The retry-evidence
correction and its `doi-crossref-public-tracer-3-uncalibrated` version remain in place. This
is a narrow review correction. Source-only development composition, measured-release refusal,
legal/publication gates and the outstanding native extension, calibration, Quota, abuse and
human qualification work are unchanged. Fresh independent review and exact-head CI were still
required.

## Launch integration: #90, #93 and #137 with #91

The interrupted integration was continued in the shared root on `spec/70-launch-integration`.
#91 was already merged at `939510a` and was not merged again. The following separate local
merge commits are retained:

- `6fa1593`: #90, bibliography selection (`c910d93`).
- `9ff98af`: #93, native selected-text intake (`f78ddb0`).
- `246f449`: #137, Semantic Scholar journal attestations (`dadcea3`).

### Compatibility changes

The #90 HTTP conflict preserves invalid-selection errors, expired-content errors and
frozen-v1 behavior. Selection preview and edit responses use the Check's publication lifetime
guard. #93's UI conflict preserves the bibliography editor, upload/library intake, Account
controls and native selection notices/Undo. Its excluded-surface guidance has a separate DE/EN
message key from bibliography editing help. #137 merged without conflicts and retains its
attributed journal aliases and stored search/scoring versions.

The integration fixes extend #91's AES-GCM codec to the complete stored bibliography document,
including unselected text and selected regions. Daily rollover rewraps it, and startup
recovery detects missing/expired document keys. Purging locks the row without decrypting
unavailable content, deletes the document along with References/events, and preserves the
content-free tombstone. The codec passes Prisma's database-null marker through rather than
encrypting it. No persistent raw upload store was added. Migration order remains #84's manual
overrides, #91's content retention, then #90's bibliography selection.

Native selected text clears a prepared bibliography draft and its Reference limit notice.
Undo restores the document, moved regions, limit notice and prior intake state. Boundary edits
clear obsolete Undo. Intake itself starts no Check.

The bibliographic-web and native-panel Playwright configurations enable their synthetic
web-page fixtures when `SOURCE_TASTER_E2E_WEB_FIXTURES` is unset; explicit `false` opts out.
The main web suite retains its DOI-only harness. Production source and qualification gates are
unchanged.

### Validation evidence

The logs of an earlier run disappeared during the interruption. They are historical reported
evidence only, and no missing log is counted as a current run. The existing #70 seams remain
HTTP/SSE/download contracts with real PostgreSQL, external adapter-edge fixtures and
Playwright client/native-panel behavior. Red/green evidence from the continuation:

- The saved retention regression failed because an encrypted value remained in the post-expiry
  dump. It passes after database-null handling: no plaintext document in operator exports,
  keyless restore fails closed, daily rollover preserves the exact document and regions, and
  expiry leaves no encrypted document in the backup artifact.
- Selected text could not replace a prepared bibliography draft. It passes with moved regions
  restored by Undo, no Check creation and no axe violations.
- The existing English web-page case failed to show its expected archive Verdict with the flag
  unset. An initial shared-harness default passed both DE/EN cases but activated bibliographic
  verification in the main web suite, causing selection timing failures. The final fix scopes
  the default flag to the two configurations containing #80 cases.

Tests used an owned disposable PostgreSQL 18 container on a dynamically allocated loopback
port and the exact existing extraction image for uploads. Focused HTTP suites (retention,
bibliography selection, documents and limits, reference revisions, exports, manual overrides,
imports, revision lifecycle, article sources, journal abbreviations) ran serially:
**117/117 passed in 11 suites**, then **5/5 selected cases passed** (118 unrelated cases
filtered out), including versioned received-PMCID behavior and Operator-disabled web-source
behavior.

Static checks passed: server `generate`, `prisma validate`, scripts `tsc`, workspace
typecheck and lint, `pnpm i18n:check` (DE/EN parity covers **351 messages**) and
`pnpm audit:licenses` (**547 installed / 89 runtime packages**). A first lint pass rejected an
unnecessary type assertion in the new rewrap; removing it and rerunning workspace lint passed.
The combined contract build and a second rebuild reproduce **40 artifacts** byte for byte,
including both OpenAPI files; the tracked generated diff is empty. No generated artifact was
hand-merged.

Final browser runs, all with the fixture flag unset and executed serially:

| Run                                                                                  | Result       |
| ------------------------------------------------------------------------------------ | ------------ |
| Web selection, upload, import/export, revision and Manual override paths             | 21/21 passed |
| Web-page archive evidence, DE/EN                                                     | 2/2 passed   |
| Native selection intake, Undo, storage, active/completed Check preservation and Firefox cap/PDF viewer | 14/14 passed |
| Native Chromium selection/upload and web-page parity, DE/EN                          | 6/6 passed   |

These are **43 distinct passing browser cases**, including all four original #80 web/native
cases with the default configuration. The newly added prepared bibliography Undo case also
checks axe accessibility. Existing cases retain their accessibility and privacy assertions.
Server, web and extension (Chromium and Firefox) builds also passed using local fixture URLs
only. Whole-repository Prettier and `git diff --check` passed. After all database/browser
runs, the owned PostgreSQL container was stopped and automatically removed; shared resources
were left untouched.

`node apps/server/scripts/release-check.ts` still refuses with exit **78**:
calibration/ADR-0006/0025/#94 qualification is required. The full Turbo/repository test suite,
website production build, vulnerability audit, private-service and both-program suites were
not run in this focused integration pass.

### Boundaries and parent handoff

No pushes, PR changes, issue changes, new worktrees, delegation or private-repo mutations were
performed. #94 is concurrent, remains excluded from this checkout, and must merge this final
integration tip before its handoff.

The private integration remains pinned to public `1e14d63`. Its actually imported
service/internal contract sources have not changed since that pin. The public verification
contract gained optional document/selection transport and 410 responses, but the private
service currently imports neither that contract nor its changed entrypoints. No private re-pin
is required for these runtime paths. A future private consumer of the new verification schemas
must re-pin its `@source-taster/contract-verification` dependency and lockfile to a reachable
published integration commit; this task does not publish or change that pin.

Synthetic regressions do not qualify deployment/backups (#116), Semantic Scholar
rights/recordings (#136), book sources (#138), approved web recordings (#140 → #114),
calibration/Quality gates, browser coverage or release. The Better Auth Selected release gate
remains open. Local checks are not GitHub CI evidence; CI was previously billing-blocked. No
completion of the overall #70 is claimed.

## Launch integration: History, PDF reports and operator administration (#104, #105, #111)

The interrupted merger continued from public `85fff557c66f8170974c5c6bd5b983ec5f92d752` (the
local #104 merge) and private `a1b7dfc`. Only the two `spec/70-launch-integration` branches are
published. No issue state, PR readiness, provider, mail, deployment or qualification action is
part of this integration.

### Merge decisions

- Inspected #104 merge `85fff55`, checked issue #104 and its implementation handoff, and found
  no conflict remnants. Its 17 HTTP acceptance tests passed before any subsequent merge, on an
  owned PostgreSQL 18 container.
- Merged #105 source `4be49ad` with `--no-ff` as `7a416c6`. Additive conflicts in ignore rules,
  Prisma models, HTTP error imports and DE/EN translations retain both History and reports.
  Generated transport artifacts were rebuilt with the package scripts; new report transport
  outputs were explicitly added.
- Added HTTP/download regressions for paid History report access, downgrade locks, upgrade,
  entry deletion, revocation and signed downgrade during held report authorization. These pass
  with the existing authority/publication fences; no application fix was necessary. One initial
  fixture failure omitted the report feature when re-enabling paid History; it is not a product
  red.
- The History web fixture now honors `SOURCE_TASTER_ACCOUNT_TEST_WEB_PORT`. The production
  server build passes, including PDF font copying. Bundled OFL text whitespace was normalized
  in `39f1409`.
- Compared `packages/contract-*` from `7518bc9` to public `39f1409`; History and report
  transport changed. Private commit `41852ca` updates all five consumers to published public
  `39f1409939cc950f9ce7874183a8d69567024ba9`, with installation and frozen-lockfile checks. No
  workspace contract overrides were introduced.
- Merged private #111 source `fc77c3f` with `--no-ff` as `1e80d73`. Retained the integration
  pins, newer session epoch/recovery handling, Account deletion checks and extension sessions.
  Operator-session revocation on sign-out everywhere is placed inside the newer session
  transaction. Schema retains both `deletedAt` and Operator relations; fixture options retain
  both policy overrides and allowed origins. Commit `81151ed` makes Operator browser tests honor
  `SERVICE_E2E_PORT`.

### Environment and validation

Suites ran serially on an owned PostgreSQL 18 container with the extraction image used for
document tests; the both-program tests used the private integration checkout.

| Scope                                                         | Result                                                                                                                 |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| History acceptance, before report merge                       | 17/17                                                                                                                  |
| Final History + report + outgoing content boundary            | 20/20                                                                                                                  |
| Public full server                                            | Initial 672/677; five targeted cases pass; completed rerun on `0108a01`: 676/677; lifecycle completion-poll recovery below |
| Web default and bibliographic e2e                             | 89 + 22 passed                                                                                                         |
| Web Quota / Guest / sensitive / History / report              | 9 / 5 / 16 / 3 / 2 passed                                                                                              |
| Native Account / History / report                             | 26 / 2 / 2 passed                                                                                                      |
| Private server / readiness / Operator browser                 | 52 / 1 / 2 passed                                                                                                      |
| Private build, lint/Prettier, typecheck                       | passed                                                                                                                 |
| Both-program Account / Guest / Quota / extension              | 2 / 33 / 8 / 4 passed                                                                                                  |

The initial full-server failures included four retention restore port collisions: the live
service and restored service had both been assigned the same port. Restored services now use a
separate one. The fifth was a calibration duplicate-run assertion while the repository identity
changed during the suite. With the tree held stable, the same assertion passes; calibration
identity and write-once checks are unchanged. All five failed cases passed the targeted rerun.

Real both-program validation additionally caught the History worker passing a full attempt
(including `input`) to the quota snapshot HTTP client. The private strict request correctly
rejected it; the public HTTP-edge fixture had accepted it. A new red outgoing-body regression
was added, then the client was fixed to project only `ownerId`/`actorId` (`4078309`). The
regression is green and Account workers again produce Verdicts. CI run `41329124985` found
unsafe JSON reads in the new report interaction tests; these now parse through `ReportResponse`
without relaxing lint or assertions. That run's dependency job succeeded.

Private migration and schema overlap also duplicated `PersonalOwner.cancelWork` from #98.
Private commits `d5ba662` and `5a5c700` retain the earlier definition and remove the
duplicates. The first setup had continued after failed Prisma regeneration; the corrected
generation, full server suite and build pass. No migration error, assertion or validation gate
was bypassed. The private validation handoff for #111 was pushed at `6395246`.

The extension restore acceptance requires an explicit owned container name
(`SOURCE_TASTER_TEST_POSTGRES_CONTAINER`), which enables its real `pg_dump`/restore. No
substitute restore proof is used.

### Limits and private follow-up

History's private bounded grant/version view and paid entitlement invalidation still require
the work described in [104-history.md](104-history.md). Report Plan/grant feature allocation and
the real hosted granted-path acceptance remain as described in
[105-accessible-pdf-report.md](105-accessible-pdf-report.md). Repinning contracts does not
implement those private behaviors. Operator payment status remains explicitly unavailable until
the commerce projection is integrated. No whole-ticket paid/backend acceptance is claimed from
HTTP-edge entitlement fixtures.

PDF tagging/structure tests do not establish PDF/UA certification, veraPDF or manual
screen-reader/OS qualification. PDFKit's dependency exception, font/NOTICE human review and all
human legal/privacy/recovery/source/calibration/launch gates remain applicable. Better Auth
remains exactly pinned at 1.7.14 and ADR-0013's Selected-release gate stays open. No
predecessor repository was read. Baseline CI run 41307020161 on `7518bc9` succeeded
(dependencies and checks); new local evidence is distinct from CI evidence.

### 2 November publication recovery

The clean public integration at `0108a01` was resumed, preserving both unpublished commits
(`4078309` and `0108a01`). Public #104/#105 and private #111 were already merged; no ticket was
merged again. The private integration remains at published
`63952462cb70bc2c8ce17fdcc464d7c17fd564b1`. Only the public root and private integration were
owned; no source worktree was edited and no agent was started.

The completed full-server rerun is **676 passed, 1 failed / 677**, not a pending run. Its only
failure was the first completion poll in `lifecycle-recovery.test.ts`, which observed two
running Checks when Vitest's default **1,000 ms** polling timeout expired. It occurred before
the cooldown phase. The unmodified focused test passed in 7.55 s, including setup.

A controlled process-scheduling probe stopped both real workers after one Crossref request
occupied the shared pool, released the HTTP fixture and resumed the workers after 1,200 ms. The
unchanged completion assertion reproduced the exact two-running-Checks failure at
**1,002.69 ms**. Continuing observation without a product change found both Checks ended at
**1,288.10 ms**, two Crossref requests and empty worker error output. This demonstrates a
completion-readiness timeout, not a requirement to change pool or cooldown behavior. The
original full run did not capture scheduling traces, so its particular host delay cannot be
reconstructed from that log.

The regression retains the 1,200 ms worker pause and bounds completion observation at five
seconds, matching the later completion poll in the same test. Both workers are resumed in
cleanup even on failure. It advances no domain clock and changes no production code, provider
budget, deadline or fairness rule. The held-pool assertion still requires exactly one request;
every subsequent request after the 429 still must wait at least **950 ms**. This completion
observation does not qualify a performance target.

| Check                                                                  | Result                                                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Original focused scenario                                              | 1 passed, 10 skipped                                                           |
| Controlled scheduler pause, before test fix                            | exact completion-poll failure; subsequent observation ends both Checks         |
| Complete lifecycle recovery file, including the retained pause         | 11/11 passed                                                                   |
| Server typecheck and ESLint                                            | passed                                                                         |
| Four transport package builds and comparison to published `39f1409`    | passed, no transport changes                                                   |
| Direct release guard                                                   | refuses with exit 78                                                           |

The other 676 full-server successes and the earlier browser, private and both-program results
above are reused as unchanged evidence. There was no new full-server rerun after this test-only
correction, and no claim of a new green 677-test run. Compared all four transport package trees
to `39f1409` after rebuilding. Also compared the actual installed private consumers' shipped
manifests, licenses, OpenAPI and compiled files to that published commit: server internal/
service/verification and web service match (10/12/51/12 files). All five dependency and
evidence pins still use real published `39f1409`; no public workspace override or private
repin/reinstallation is needed for these implementation/test/doc changes.

CI remains distinct from the local evidence. Previous public run `41329124985` on `39f1409` had
passing dependencies and failing checks (unsafe JSON access in the report regressions,
corrected in preserved `0108a01`). Private run `41332740922` on `6395246` has **passing checks
and failing dependencies**. Its downloaded evidence identifies `minimatch@10.2.6`, advisory
`GHSA-g3hv-75wg-m249` / `CVE-2026-118764` (globparts amplification denial of service). The
dependency gate remains closed; no exception, dependency-policy change or Better Auth version
change was made in this recovery. Public new-head CI status must be read from PR #139 after
publication, not inferred from these local results. Both PRs remain drafts; no issue was closed
or PR made ready.

All source-rights, real-load, calibration, human/legal/security and Better Auth Selected-release
gates and the private follow-ups above remain open. Publishing the integration is not release,
deployment or launch qualification.

## Staging: #100, #101, #117 and the #102 public phase

Two public staging handoffs, both prepared before #99 released exclusive integration
ownership and both handed to the parent root merger. The #102 handoff was cumulative: it
started from the completed #100/#101/#117 staging. Neither was integrated into
`spec/70-launch-integration`, pushed or published at handoff, and neither is whole-spec
acceptance, CI evidence or release qualification. No private checkout was read or changed, no
private pin was moved, and nothing was activated. The merger publishes and repins the final
public integration SHA in all private contract consumers, lockfiles and evidence pins.

### Staging merge of #100 public, #101 public and #117 harness

The branch `t3/stage-public-harness-merge` preserved all three histories through merge commits:

| Source                                         | Exact tip                                  | Staging merge |
| ---------------------------------------------- | ------------------------------------------ | ------------- |
| #117 `t3/replay-release-entrypoint`            | `4d7b26f266836d414a3e7acf36b17227aae9f050` | `b996fde`     |
| #100 public `t3/public-verification-limiter`   | `6f85675fe0dfb59ff6aa7abfc63db397d8f88039` | `994c5ae`     |
| #101 public `t3/public-account-preferences`    | `c6eff229e42532048e9a1dce651f6c51c2ea980a` | `1dfb83b`     |

It included the committed integration tip `56f251f520792f3e3e808b30c1b598f325f9b47a` (#99
public, containing #98). No uncommitted integration work was copied and the integration ref was
never moved. Validated application and test source is `2c1cec7`.

#117 and #100 merged without conflicts. The only source conflict in #101 was additive in
`contract-common/src/index.ts`: both the typed abuse-limit Problem/response and the canonical
eleven-style manifest were kept. DE/EN messages and shared workspace source combined
automatically. All four contract packages were rebuilt from source, as were Paraglide and
Prisma; no generated file was hand-merged. Test-only endpoint overrides preserve the source
defaults and allow serial use of distinct ports for load CLI tests, abuse, Preferences and
quality-gate fixtures. No production authority, Plan, Quota, search setting, performance target
or release rule was changed.

Local verification ran serially on an owned disposable PostgreSQL 18 container; each harness
provisioned its own disposable database and role.

| Check                                                                                                | Scope/result                                                                                  |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Server `test:load`                                                                                   | 63/63: measurement, replay, exact binding/refusals, real-process bounded CLI                  |
| Quality release/CLI/gate suites                                                                      | 30/30                                                                                         |
| Server abuse (real HTTP/SSE/PostgreSQL/export)                                                       | 14/14                                                                                         |
| Structuring, checks, SSE compatibility, corrections, exports                                         | 70/70                                                                                         |
| Web abuse clients (DE/EN web/native Chromium, actual limiter responses, semantic continuation time)  | 4/4                                                                                           |
| Extension/web Preferences (web/native Chromium)                                                      | 9/9                                                                                           |
| Extension Account transitions (native Firefox, Chromium, web, typed transports)                      | 16/16                                                                                         |
| Root-script and 11-package typecheck/ESLint                                                          | passed                                                                                        |
| `pnpm i18n:check` and full Prettier                                                                  | passed: 369 DE/EN messages; website paired content complete, human translation review pending |
| `pnpm install --frozen-lockfile`                                                                     | passed; unchanged lockfile |
| Direct serial affected builds                                                                        | passed: four contracts, core, i18n, server (canonical style/locale validation), web, Chromium/Firefox extension |

The focused matrix contains **206 distinct passing cases**. The rendering/export subset was
also rerun with both auxiliary service overrides pointing at the assigned port (18/18).
Composition covered: entrance denial before effects without Quota reservation; current
Account/Guest and Plan changes without aggregate-budget reset; hosted creation with the
mandatory #99 public Quota adapter; typed 429 and SSE admission; #98 pending/failed/expired
Account denial through Reset/reconnect; no fallback to Guest authority; #101 existing-Account
preference authority, immediate partial writes, refocus/race fencing and independent Guest
stores. ADR-0023 sign-out and session expiry copy the **last displayed Account values**, not
pre-sign-in values. All eleven styles, RTF and immutable evidence/export behavior remain
covered. No UI-local authority or entitlement was introduced.

Public private-service HTTP edges are synthetic adapter fixtures. Their Quota DTOs, policy
decisions and Preferences state prove public composition only, not the real shared accounting
ledger, Account storage/mail or whole #100/#101 acceptance. Real both-program #99/Quota suites
require the private implementation and were not run here.

No application regression was found, so no production fix or red/green claim is made. Two
first validation invocations (quality-release and abuse) accidentally overlapped; both passed
but are not the final serial evidence, and serial reruns passed under an exclusive local
validation lock.

Top-level `pnpm typecheck`, `pnpm lint` and `pnpm build` each exit 1 because Turbo requires a
current controlled Pagefind source build in that checkout. No Pagefind cache or uncommitted root
artifact was copied and no controlled-build requirement was bypassed. These results claim no
passing whole-repository build or publication qualification. The normal extension chunk size
advisory remains; no budget was increased.

#117's earlier failed synthetic performance evidence remains intact in
[its note](117-load-harness.md): 50×3 failed; the bounded 50×100/540-second run failed with
4,331 unfinished References, 50 incomplete Checks and missed means (268.9 s findable, 301.3 s
not-findable from Check start). No unchanged long measurement was repeated or replaced by a
reduced-scope pass claim. The literal Check-start clock, 50×100 scope, 500 ms minimum delay,
fixed targets, same clean code/configuration binding and rejection of every enabled unreplayed
source remain enforced. Synthetic bounded tests are regression evidence only.

Final verification: the clean-tree load suite passed 63/63; all **58 tracked contract/OpenAPI
artifacts** and **752 generated Paraglide files** reproduced byte for byte; Prisma validation
and whole-repo Prettier passed. Direct `node apps/server/scripts/release-check.ts` exits **78**
on a clean tree, naming `no-load-report`, `uncalibrated`, `no-measured-configuration` and
`no-measurement-location`; no dirty-tree refusal is used as a substitute. Direct
`load-test.ts --release` exits **78** before provisioning (authorized recording, reviewed
configuration and report location absent), and `build:release` stops at its guard (child 78,
lifecycle wrapper 1). These are expected refusals, not passing release checks.

Private follow-up (nothing in staging changed a private pin or backend): #100 needs its real
private shared entrance ledger, policy, deduplication, origin/rotation settings,
retention/restore admission fences and both-program acceptance; follow
[100-private-abuse-handoff.md](100-private-abuse-handoff.md). #101 needs real Account
persistence, atomic partial writes, registration initialization, mail language/outbox behavior,
export/deletion and cross-client/service-restart acceptance; follow
[101-private-preferences-handoff.md](101-private-preferences-handoff.md). #98's incomplete
private session/extension gate stays disabled pending its own handoff and acceptance.

All existing backend, source, qualification and release gates stay open/closed as before:
actual #99 accounting acceptance, #100/#101 private phases, rights-cleared recordings and
#140/#114 source work, calibration/Quality measurement, recorded and live provider-compliant
load/capacity, full replay source coverage, protected release automation, #136/#138/#116,
controlled Pagefind/publication, Better Auth transitive clearance, supported browser/OS/AT and
Word/LibreOffice/Zotero qualification, deployment/parser isolation/ingress/restore proof, and
human legal/security/privacy/translation/provider approvals. No activation, launch approval,
full-suite pass or CI success is claimed.

### #102 public phase merged into that staging

Branch `t3/stage-public-102-merge` built on the staging above (`6c8da03`). It merged the #102
public phase `0a2ba71` (see [#102](102-sensitive-account-actions.md)) as `ead8d8e`, updated the
#102 service stand-in to model #101 Preferences (`556fd7a`), merged the committed, published
integration tip `aee07b4` (#99 acceptance fixes) as `29e919f`, and added the #101 × #102
interaction fix (`6e7f958`). At handoff `spec/70-launch-integration` was still `aee07b4`.

All conflict resolutions were additive and generated outputs were rebuilt from source:

- `contract-service/src/routes.ts`: #101 Preferences routes plus the #102 `sensitive()` routes
  for `/v1` and `/v1/extension`. After the `aee07b4` merge the build corrected auto-merged
  `contract-service` declaration/OpenAPI text that had lost generated entries; a second build
  left the tree clean.
- `ui/check-workspace.tsx`: #101 controlled patch Preferences, #99 `QuotaPending`, and the Quota
  passed to the #102 account controls.
- `ui/web-account-workspace.tsx`: #101 `useAccountPreferences`/`sessionEnded` plus the #102
  removal state and `SensitiveAccountActions`.
- DE/EN messages: union of both sides (408 messages, `i18n:check` passes).

#### Interaction findings and rulings

1. **Deletion removes Account Preferences, no copy to Guest.** In the merged code, deletion
   ran the #101 session-end path, which copies the last displayed values into Guest storage.
   ADR-0023 says Preferences "are deleted with" the Account; only sign-out and session expiry
   copy. #102 requires that deletion clears Account storage and that in-progress deletion never
   falls back to Guest. Red: both extension deletion specs failed on an extra
   `source-taster-guest-preferences-v1` entry. Fix: the hook has `forget()`, which fences pending
   Preference work and skips the copy; the shared `AccountWorkspace` (web and extension) calls it
   on every deletion outcome. Sign-out and expiry are unchanged and still covered by the #101
   lifecycle spec. Displayed values stay in memory only.
2. **#99's mount-time Guest Quota read after deletion. User decision: no read on mount; the
   Quota is read at the first Start.** `aee07b4` read the Quota when a hosted workspace mounts.
   After a _completed_ deletion the workspace remounts as Guest, so it requested a Guest token
   and read the Guest Quota at once; on the web a fresh context can mint a new device Guest
   identity that way. The user ruled that this must not happen. Now:
   - After a completed deletion the hosted workspace (web and extension) does not request a
     Guest token and does not read the Quota on mount. `AccountWorkspace` passes
     `deferQuotaRead={removal === "deleted"}` to `CheckWorkspace`, which skips its mount-time read.
   - The Quota slot is neutral: nothing is rendered, the same as where no Quota applies. No
     "loading" or "unavailable" text, because nothing is loading or failing. No new copy, so no
     DE/EN change.
   - The first Start uses the existing fail-closed start read (`readQuota()` before
     `planStart`). It requests a Guest token, reads the Quota, and the meter then shows. A failed
     read still stops the Start. Ordering is unchanged: structuring first, then the Quota read,
     then Check creation.
   - The extension keeps its existing Guest ID. Storage is exactly
     `{source-taster-guest-id-v1: <same id>}` after deletion and after the Start.
   - A plain Guest visit that is not after a deletion is unchanged (#99: Quota visible before
     the first Start). In-progress deletion still makes no Guest request.
   - **Limit:** the deferral lives in the workspace state, not in storage. Storing a "deleted"
     marker would keep a trace of the Account that ADR-0023 and #102 say must not remain. So a
     page reload after a deletion is a plain Guest visit and reads the Quota on mount like any
     other. A spec asserts that.
   - Also asserted: no Guest token or Quota request before the deletion answer, no
     Preferences/Account-token/activity request after deletion, and no Account ID, Owner ID or
     email left in storage. No content or grant moves to Guest, and no Account-to-Guest
     restoration exists.

   Evidence was test-first. Web: after a completed deletion the page had requested
   `["guest-token","quota","quota"]` (the second `quota` is the dev build's double effect),
   expected `[]`; green is `[]` until Start, no Quota meter, then
   `["guest-token","structuring","quota"]` after Start with the meter shown. A web control
   (reload after a deletion is a plain Guest visit) passes before and after. Extension: red was
   a Guest-token request after the deletion answer; green is no service or API request until
   Start, then a Guest token POST and `GET /v2/quota` with that token and the Guest ID
   unchanged. The re-run for the merge commit was red with the two `packages/ui` product files
   reverted and green with them (web sensitive 16/16, native Account 26/26). Plain-Guest
   behavior before the first Start is unchanged: the #99 count/consumption, returning-Guest,
   refused-Guest and pending-session cases pass (web Quota 8 of 9, see below) and the default
   web e2e passes 87/87.

   Guest traffic is answered by in-browser routes (web) and a recording stand-in API
   (extension) via `apps/server/test/support/guest-start-stub.ts`, because the stand-in service
   has no Guest identity. These fixtures prove _when_ requests happen, not Guest identity or a
   real balance. The extension specs now take their ports from
   `SOURCE_TASTER_ACCOUNT_TEST_SERVICE_PORT` and `SOURCE_TASTER_ACCOUNT_TEST_API_PORT`.

   **Known failures that also occur without this change** (product files reverted for the
   baseline): the quota spec "a signed-in Account sees its Free Quota before starting" (the
   Account email never appears; a signed-in view, not touched by the deferral), and the
   timing-sensitive Guest-lease spec "revocation stops renewal" (`renewals` changes during the
   1.5 s wait; passes in some runs, fails in others, with and without the change). In one of
   four Guest runs with the change, "Guest identity survives a real browser restart" also
   failed once (Quota still loading, 5 s wait); it passed in the other three and in the baseline
   run. Not investigated further.
3. **#101 lifecycle × #99:** after sign-out the extension may now hold its own Guest ID beside
   the Guest Preferences. The spec asserts the Preferences entry exactly and that it is not
   keyed to that ID (ADR-0023).
4. The #102 private-service stand-in got an in-memory `/preferences` GET/PATCH. Without it,
   9/14 web sensitive specs failed on the extra Preferences alert. This changes the fixture only.

No ADR conflict requiring a user decision was found.

#### Validation (local; not CI)

| Check                                                                                       | Result                                          |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Server Owner deletion                                                                       | 5/5                                             |
| Web sensitive actions EN/DE                                                                 | 14/14                                           |
| Extension Account incl. #102 panel/transport and stream reconnect                           | 25/25                                           |
| Extension/web Preferences                                                                   | 9/9                                             |
| Web abuse clients                                                                           | 4/4                                             |
| Server abuse HTTP/SSE/PostgreSQL                                                            | 14/14                                           |
| Server retention/lifecycle/lifecycle-recovery/check-events                                  | 24/24                                           |
| HTTP regressions (structuring, checks, SSE, corrections, exports)                           | 70/70                                           |
| `test:load` (bounded)                                                                       | 63/63                                           |
| Quality release/CLI/gate                                                                    | 30/30                                           |
| `release:check`                                                                             | exit 78 (intended unqualified-release refusal)  |
| Per-package typecheck/ESLint (11 packages incl. website), scripts, `i18n:check`, Prettier   | passed                                          |
| Direct serial builds (contracts, core, i18n, ui, server, web, Chromium/Firefox extension)   | passed, no artifact drift                       |

That is 258 passing cases. Server suites ran on `29e919f`; `6e7f958` changes only UI and specs,
and the UI/browser suites were rerun on it. The extension stream-reconnect spec that failed on
the old baseline passes with #99's published fixes.

Not run: the web `quota` and `account` Playwright configurations (they need the private
checkout; a guard error, not a product result) and server `test:quota`/`test:authority`.
Top-level Turbo `typecheck`/`lint`/`build` still stop at the website's controlled Pagefind
source build; that requirement was not bypassed. The unchanged long 50×100 measurement was not
repeated, #117's recorded failure stands, and no target, budget or default changed.

#### Gates and pending private phase

- Both sensitive-action gates stay **off by default**:
  `VITE_SOURCE_TASTER_SENSITIVE_ACCOUNT_ACTIONS` (web) and
  `SOURCE_TASTER_EXTENSION_SENSITIVE_ACCOUNT_ACTIONS` (extension) enable them only on the exact
  value `enabled`. No fake private proof or session was accepted outside test fixtures.
- Owner deletion accepts only the signed, purpose-, path- and method-bound program assertion.
  `apps/server/test/owner-deletion.contract.ts` refuses unsigned, wrong-purpose, wrong-path and
  wrong-method assertions and an Account bearer token with 401, with no tombstone. The
  tombstone denies still-signed tokens even when the backend answers a false allow.
- Pending private/both-program work: real fresh proof, mail and session revocation;
  server-side Preferences and Account deletion; the tombstoning trigger and program-assertion
  issuance; eight-year billing retention storage; real Quota ledger and both-program
  #99/#100/#101/#102 acceptance; release qualification (exit 78 remains) and the controlled
  Pagefind build.

## Local cross-browser run — 4 November 2026

Local source investigation on `test/cross-browser-local`, based on `main` at `0ff6751`. It is
**not** hosted CI, **not** browser qualification and **not** a release claim. No qualification,
release-eligibility or maturity status in docs or code was changed; Firefox, Safari and
assistive technology stay "not qualified". Nothing was pushed.

"WebKit" below is **Playwright's WebKit build, which is not Safari**. A pass there is evidence
about the engine's behaviour on this suite, not about Safari the product (its release train,
its extensions, VoiceOver, iOS).

### What the specification asks for

From the platforms section of `docs/requirements-specification.md`:

- The web app "must run without installation in the two latest major versions of Chrome, Edge,
  Firefox and Safari; the acceptance tests are run in all browsers listed."
- The extension "must work in Chromium-based browsers … and in Firefox, in each case in the two
  latest major versions; for Firefox additionally in the current ESR." Safari is not an
  extension target.
- FA-UEB-04: WCAG 2.2 AA, "automated check, test with keyboard and screen reader".

### Setup and change

Web app e2e: `apps/web/playwright.config.ts` (`e2e/`, 91 tests per browser) and
`apps/web/bibliographic.playwright.config.ts` (`e2e-bibliographic/`, 22), both under
`pnpm test:e2e`. Website a11y/privacy/site e2e: `apps/website/playwright.config.ts` (92 tests).
The extension builds `dist/chromium` and `dist/firefox` from one Vite config; native Chromium
and Firefox suites are separate configs. Tools: Playwright 1.64.1, Chromium revision 1248,
WebKit 27.2 (revision 2370), Firefox 157.0 (revision 1555), PostgreSQL 18 in a dedicated
container.

`SOURCE_TASTER_E2E_CROSS_BROWSER=true` adds Firefox and WebKit projects:

```sh
pnpm --filter @source-taster/web test:e2e:cross-browser
# website: SOURCE_TASTER_E2E_CROSS_BROWSER=true pnpm --filter @source-taster/website test:e2e
# one engine: ... pnpm exec playwright test --project=webkit
```

CI is **unchanged**. Without the variable, `playwright test --list` shows only `[chromium]`
(91 + 22 web, 92 website). CI pins `playwright install --with-deps chromium` and a 60-minute
budget per job. Locally, Chromium plus WebKit took 12.7 minutes for the main suite and 5.6 for
the bibliographic suite (Chromium alone was not timed), and Firefox cannot be shown to pass
reliably, so none is added to CI. `apps/server/test/operations/ci-workflow.test.mjs` passes
(10/10).

### Results (local, one run each)

| Suite                    | Chromium | WebKit (Playwright)                                                                                                | Firefox                    |
| ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| web `e2e/`               | 91/91    | 91/91 (88 in the first run; a clean full re-run on the final code passed 182/182 for Chromium + WebKit in 11.8 min) | 0 results (launch failure) |
| web `e2e-bibliographic/` | 22/22    | 22/22                                                                                                              | not attempted              |
| website `e2e/`           | 92/92    | 92/92                                                                                                              | not attempted              |

Not run on any engine: the other web configs (guest, quota, account, history, report, rights,
sensitive, abuse, dpa), which are outside `test:e2e`, and the extension native suites.

**Firefox: attempted, no results.** Playwright's Firefox 157 (revision 1555) exits immediately
with "Could not find profile folder" even with an existing profile directory; the previous
revision (1497) starts but never completes the automation handshake (`RenderCompositorSWGL` graphics error). The
first full run therefore failed all 91 Firefox tests at browser launch, before any product code
ran. Those are not product failures and are not reported as such. A second attempt outside any
sandbox on the same host (macOS 27.2) failed the same way, so the cause is the Playwright
Firefox build on this host, not the sandbox and not the product. Run the Firefox projects on
another machine, or after a Playwright update, before drawing any conclusion. Firefox status:
**no results (Playwright Firefox does not launch on macOS 27.2)**.

To run it on a host where Firefox launches (the steps used for the Chromium and WebKit runs):

```sh
pnpm install --frozen-lockfile
mkdir -p .tmp && pnpm pagefind:fetch && pnpm pagefind:build && pnpm pagefind:verify
pnpm build
node apps/server/scripts/extractor-image.ts > .tmp/document-image-id   # needs Docker
pnpm --filter @source-taster/web exec playwright install firefox

# Own PostgreSQL 18 on any free port; remove it afterwards.
docker run -d --name <owned-container> -p 127.0.0.1:<port>:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres postgres:18

export DATABASE_ADMIN_URL=postgres://postgres:postgres@127.0.0.1:<port>/postgres
export DATABASE_TEST_URL=postgres://verification_test:verification_test@127.0.0.1:<port>/source_taster_test
export SOURCE_TASTER_DOCUMENT_IMAGE=$(cat .tmp/document-image-id)
export SOURCE_TASTER_E2E_CROSS_BROWSER=true

cd apps/web
pnpm exec playwright test --project=firefox
pnpm exec playwright test --config bibliographic.playwright.config.ts --project=firefox
cd ../website && pnpm exec playwright test --project=firefox

docker rm -f <owned-container>
```

The tests create and drop their own databases and roles, so the container needs no schema.
Expect about 91 + 22 web tests and 92 website tests on Firefox. If Firefox fails, look for
launch errors in the first failure before reading any result as a product defect.

### Failures and fixes

Three WebKit failures, one cause: **a test-harness limit, not a product bug**.
`corrections.spec.ts` called `context.grantPermissions(["clipboard-read", "clipboard-write"])`;
Playwright's WebKit rejects `clipboard-write` as unknown, and it cannot read the clipboard back
from the page.

- Fix: grant permissions and read the clipboard back only on Chromium. On the other engines the
  specs assert the visible outcome of the same copy gesture (the `role="status"`
  "Copied."/"Kopiert."), which renders only after `navigator.clipboard.write`/`writeText`
  resolves; a rejection shows the copy-failed message. The first test previously never asserted
  the status; it now does on every engine. The Chromium path is otherwise unchanged and still
  reads the clipboard content and the `text/html` flavour.
- **Open gap.** On WebKit the status assertion shows only that the copy promise resolved. It
  does **not** verify what landed on the clipboard: the plain-text content and the rich
  `text/html` flavour (italic journal title) are checked on Chromium only. Wrong or empty
  clipboard content on WebKit would pass. A stub of `navigator.clipboard.write` that inspects
  the blobs on every engine would close it. Nothing here shows that real Safari copies
  correctly.

**No product bug was found**, so there is no product fix. Test-first did not apply: the harness
failure was the failing test, and the spec change is the fix.

### Accessibility (automated, axe)

The repo already uses `@axe-core/playwright` (WCAG 2.0/2.1/2.2 A and AA tags). 15 of 21 web
`e2e/` specs and 3 of 3 `e2e-bibliographic/` specs run axe on the loaded workspace; all pass on
Chromium and on WebKit (included in the counts above). `apps/website/e2e/accessibility.spec.ts`
runs axe on every built page at 320 px and 1280 px plus the not-found and search states: all
pass on Chromium and WebKit. The extension's axe checks live in native Chromium specs only; they
were not run here and no Firefox equivalent exists. axe finds a subset of WCAG failures. It is
not keyboard, zoom or screen reader testing and not a conformance claim.

### Extension in Firefox

`pnpm --filter @source-taster/extension build` already emits `dist/firefox` (MV3,
`background.scripts`, `sidebar_action`, gecko id, `strict_min_version` 128.0, `host_permissions`
without a port). A one-off `web-ext@10.8.0 lint -s apps/extension/dist/firefox` reports **0
errors, 4 warnings**:

- `MISSING_DATA_COLLECTION_PERMISSIONS`: the manifest has no `data_collection_permissions`
  declaration. Declaring which data categories the extension transmits (reference text goes to
  the Check API) is a privacy decision, so it was **not** changed. Needed before any Firefox
  store submission.
- `UNSAFE_VAR_ASSIGNMENT` ×2 (`innerHTML`) and `DANGEROUS_EVAL`: all in the bundled library
  code. `innerHTML` is React DOM internals and an aria-live clear; `Function("")` is a Zod JIT
  feature test inside try/catch, so it degrades safely under the `script-src 'self'` policy.
  Only the built bundle was inspected, not the product source for other dynamic-HTML paths.

`web-ext` and its linter are **not added** as a dependency: both are MPL-2.0, and
`docs/dependency-policy.md` limits MPL tooling to explicitly named development packages, so
adding one is a policy change. Nothing was added to `package.json` or the lockfile. Loading the
package into a real Firefox is covered by the existing `test:native-firefox` (it drives the
installed Firefox Developer Edition over WebDriver BiDi with native input), which was **not
run** here.

### Needs a human

- Run the Firefox projects (`test:e2e:cross-browser --project=firefox`) in a plain terminal and
  triage the result.
- Real Safari (current and previous major), including its clipboard behaviour, on macOS; iOS
  Safari is a separate matter.
- Real screen readers and keyboard/zoom review (VoiceOver, NVDA, JAWS, Orca, TalkBack), as
  FA-UEB-04 requires. None was exercised.
- Extension on real Firefox ESR and the two latest majors (`test:native-firefox`), plus Edge,
  Brave and Opera; and the `data_collection_permissions` decision.
- Any qualification or release decision.

## Public CI regressions — 4 November 2026

Focused implementation on `t3/fix-public-ci-regressions`, based on published public
`28056f575cb165f7d511c268a5d16036c98b3efd`. This is local source validation, not hosted
CI qualification or the final #70 whole-spec review. No release, Quality, load,
calibration, provider, source approval, rights, Selected or production activation gate
is waived. No private source, dependency, job, issue or PR was changed; nothing was
pushed.

### Completed hosted evidence

Completed failed-job logs were downloaded with `gh run view --log-failed`:

| Run                                                                                | Head                                       | Observed result                                                                                                                         |
| ---------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| [41775234932](https://github.com/jeffnawroth/source-taster/actions/runs/41775234932) | `d50b0ac24273515e5f291de58aa29d7856f99475` | 679 passed, four failed: OpenAPI comparison, maximum Check cancellation (500), two report lifecycle polls (`generating`)                |
| [41683390600](https://github.com/jeffnawroth/source-taster/actions/runs/41683390600) | `7b2c0644cf37ba00a83d7db11f3bfdb68249a146` | 672 passed, those four failures plus concurrent article-fairness request order `[61, 51]` versus `[51, 61]`                              |
| [41633238132](https://github.com/jeffnawroth/source-taster/actions/runs/41633238132) | `c74b1a1208d06a155352e3ec5e56be685da59a5a` | 674 passed, maximum cancellation and both report lifecycle failures                                                                     |

Run [41798367252](https://github.com/jeffnawroth/source-taster/actions/runs/41798367252)
on `28056f5` was in progress at the initial read. It was not polled or watched. No
hosted pass is claimed.

### Feedback loop and ranked diagnosis

Approved seams: real PostgreSQL, HTTP/SSE/download, report generation adapter and
measurement/release commands. Tests do not replace internal stores, write fake
qualified configurations, call real providers or regenerate linked contracts.

After ordinary frozen installation, Prisma generation and core/i18n builds, the focused
command (`vitest run` over `bibliographic`, `lifecycle-recovery` and `report-lifecycle`
tests, selected with `-t`) reproduced the exact OpenAPI diff and passed the other three
cases. The first attempt before building core was an environment/setup failure, not a
product red.

Ranked falsifiable hypotheses, recorded before probing:

1. Runtime documents omit delivery routes registered only after document capture;
   registering their existing schemas before capture should remove the exact diff.
2. Per-slot cancellation exceeds Prisma's five-second transaction deadline with slower
   PostgreSQL; controlled transport latency should reproduce HTTP 500.
3. Valid asynchronous PDF work exceeds the one-second default report poll; delaying
   actual rendering should reproduce `generating` without a report fault.
4. Concurrent HTTP arrival order causes the older fairness assertion failure;
   repetition might reproduce a reversed order while the per-Check cap still holds.

**OpenAPI.** The runtime document is captured in `createApp`; hosted delivery is mounted
later. The committed generator already includes its two published `/v1/data-subject`
routes in both majors. Those same schemas are now registered before runtime document
capture. Delivery handlers and hosted-only authorization remain unchanged. The existing
HTTP comparison failed before this change and passed afterwards for both complete
documents. No generated contract/OpenAPI bytes change.

**Maximum-size cancellation.** The existing maximum-Check assertion moved into a
dedicated real HTTP/SSE test that keeps its 1,000 References and idempotency checks and
adds v2 plus a transport-only PostgreSQL proxy. Provisioning and creation run without
delay, then database responses are delayed by 1 ms during cancellation. No SQL,
application response or transaction deadline is mocked. The original loop returns 500 at
**5,010 ms**, with temporary allow-listed Prisma code **P2028**, reproducing transaction
expiry twice. This establishes a local cause for the matching symptom; the hosted job
did not capture that error code, so its exact cause is not retrospectively proven.

A proposed 30-second lifecycle window also expired under this probe and was rejected. No
timeout increase remains. Instead, slot updates, immutable result inserts, settlement
intents and ordered event inserts are batched under the existing Check lock and
five-second transaction deadline. Generation increments, result revision/configuration
identities, complete v2 event References and the single final Check event are preserved.
PostgreSQL notifications remain wakeups; the durable ordered event log is authority.

The content codec now encrypts `createMany` rows using the same per-field AES-GCM codec
and current transient/History key selection. History lookup caching lasts only for that
batch, never across retention-changing operations. No raw plaintext bulk insertion
bypass is introduced. Existing individual result writes are unchanged.

Measured green cancellation responses with the same proxy: **2,405 ms (v1)** and
**2,178 ms (v2)**. Both tests then consume and verify all 1,000 ordered cancellation SSE
updates and repeat cancellation to verify the immutable snapshot. Timings are local
observations, not load qualification.

**Report lifecycle.** The original tests use `expect.poll`'s **1,000 ms** default, while
the neighboring report suite already observes completion for ten seconds. An injectable
report-generation adapter now exists at the worker composition boundary. The controlled
test composition waits 1,500 ms and then invokes the real resource-limited PDF
generator; real dispatch/publication checks, storage, HTTP polling and download remain in
use. Both unchanged polls fail specifically at `generating` before changing their window.

Only these two report-completion polls now observe for **10,000 ms**. Both pass with the
deliberately slower real renderer, then verify the 15-minute file expiry or shorter Check
deadline. Production's 120-second rendering limit, memory/output limits, failure states
and retention/authority fences are unchanged. No ready flag, fake PDF, retry wrapper or
skipped test replaces real publication. This reproduces the timing failure class; no
trace proves how long the original hosted render took.

**Older fairness finding.** Eight unchanged local executions of the cap test passed. The
temporary repetition was removed. No causal attribution, production change or relaxed
assertion is claimed for the earlier hosted `[61, 51]` ordering failure. It remains
unreproduced and should be revisited if a new hosted run reports it.

### Private advisory (read-only)

The committed private dependency-blocker note for the minimatch advisory was read and the
current registry/advisory checked once. minimatch latest is now **11.0.4**, but newest
10.x remains **10.2.6**. Current parent declarations remain incompatible with the
advisory's first patched **11.0.1**: ESLint 10.14.0 requires `^10.2.6`, config-array
0.23.5 requires `^10.2.4`, and typescript-estree 8.72.1 requires `^10.2.2`.
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) still marks
`<11.0.1` affected. A new 11.x release does not satisfy those ranges.

No compatible remediation is available within the authorized policy. The private advisory
gate remains blocked. No forced major, waiver, lock churn, Node requirement, Selected
change or Better Auth change is introduced. The existing private checkout, overrides,
backup bytes and history were left untouched; no private branch or companion commit was
created.

### Validation and ancestry

Local environment: Node 24.14.0, pnpm 12.15.0, PostgreSQL 18 in a task-labelled
container on loopback with owned alternate test ports. The fixture credentials are
disposable loopback values, not deployed secrets.

| Verification                                                                                                                  | Result            |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Maximum cancellation, report lifetime, lifecycle/recovery, revision lifecycle, retention, bibliographic lifecycle, Check events | 35 passed, 8 files |
| Quality CLI, quality release, quality gate, load release guards                                                               | 47 passed, 4 files |
| Actual report/PDF/download suite and article fairness                                                                         | 10 passed, 2 files |
| Full v1/v2 OpenAPI HTTP document comparison                                                                                   | 1 passed          |
| Server typecheck/lint/build; DE/EN i18n checks                                                                                | Passed            |

That is **93 distinct passing tests**. The earlier two maximum-size timing cases and eight
temporary fairness repetitions are overlapping observations, not added to that total.
Focused `-t` invocations naturally report unselected cases; no test is disabled or
skipped in the source, and the three complete groups above have zero skipped tests. The
initial aggregate typecheck refusal for an unfinished controlled Pagefind build is a setup
boundary, not a bypass or product regression.

Final aggregate `pnpm build`, `pnpm typecheck`, `pnpm lint` and `pnpm i18n:check` passed.
Normal `pnpm pagefind:fetch`, `pnpm pagefind:build` and `pnpm pagefind:verify` passed on
aarch64 Darwin. Direct `pnpm --filter '@source-taster/contract-*' build` followed by
`git diff --exit-code` reproduced all **78 tracked contract/OpenAPI outputs** without
drift. No transport pin changed. The source-only release command refused with exit
**78**, including missing load, calibration, measurement location and eligible
configuration.

The public integration ref and published remote ref still equalled the base
`28056f575cb165f7d511c268a5d16036c98b3efd`; it is already an ancestor, so there was no new
public integration commit to merge. The private source stayed at
`8f5e132bc2146e8aa64a65e20a36c442249bbc15` with only its existing workspace/lock
overrides dirty; no private changes require an integration merge. The owned container held
zero fixture databases and roles before it was removed, and no unknown container,
database, listener, source checkout or override backup was removed. The controlled
Pagefind cache is retained. No temporary debug instrumentation or disabled test remains
in source.

Remaining boundaries: new hosted validation is the parent publisher's task; the earlier
fairness ordering failure remains unreproduced; the private minimatch gate is still
blocked. Real measured Quality/calibration/frozen-dataset evidence, scoped load
acceptance, provider/EU/zero-retention approval, applicable #138/#140/#136 source rights
and replay evidence, Selected/Better Auth, legal/security, release and independent #116
deployment qualification remain required. No long 50×100 replay, provider/mail/cloud
call, browser qualification, production activation, issue closure, push, PR, scheduler or
five-hour-job change occurred. The final whole-spec review followed integration
separately.

## Dependabot alerts on the Pagefind upstream snapshots (4 and 5 November 2026)

Two read-only analyses of the same alert source, taken on consecutive days. No alert was
dismissed, commented on or modified through the API, no lockfile or manifest was edited, no
override was added and no Pagefind bump was made. Everything is derived from public sources.
The alert counts differ between the two dates (32 open alerts on 4 November, 22 open alerts on
5 November, numbered 2–32); each section keeps its own date's count and the two were not
reconciled.

### Assessment of 4 November 2026

All 32 open alerts sit in two **verbatim upstream snapshots** under
`apps/website/qualification/upstream/`:

- `pagefind-js/package-lock.json` (20 alerts: brace-expansion, tar, js-yaml, minimatch, glob,
  esbuild; every alert has scope `development`).
- `pagefind-native/Cargo.lock` (12 alerts: rustls, rustls-webpki, quinn-proto, actix-http, tar,
  rand).

Neither file is installed, resolved by a build, or shipped; they are audit and provenance
inputs. By the recorded macOS arm64 build evidence, none of the vulnerable crate/package
versions is in the compiled Pagefind CLI or the browser WASM. The project's own
`pnpm-lock.yaml` contains `brace-expansion@5.0.12` and `minimatch@11.0.3`, both at or above the
fixed versions of the matching alerts, and none of the other four alerted npm packages. The
`dependencies` job on the latest `main` CI run (run 41908432843, head `d40e3ea`) passed
`Match all lockfile packages offline`, so the OSV gate reported no finding in the selected
Linux graph or in `pnpm-lock.yaml`. (That run's overall conclusion was a failure from
`server-tests (4/4)` and `checks`, unrelated to this analysis.) No runtime exposure was found in
the website, web app, extension or server, and no build-time exposure in the selected graph.

#### What the directories are and how they are used

- `upstream/*/` hold byte-for-byte copies of lockfiles from Pagefind v1.5.2 (commit `bf17396`),
  compiler-rs, Sätteri and Rolldown. `provenance.json` pins tag, commit and SHA-256 of each file.
- Consumers are `scripts/audit.ts` (the OSV scan behind `pnpm audit:dependencies`, which runs in
  CI), `scripts/website-inventory.ts` and `scripts/website-qualification.ts`. They read these
  files as data and need the exact paths and hashes.
- `pnpm pagefind:fetch|build|verify` (`scripts/pagefind-source.ts`, run in CI and in
  `deploy-scalingo.yml`) downloads the checksum-pinned Pagefind 1.5.2 source tarball, applies
  `controlled/patches/minimal-pagefind.patch`, **replaces its lockfiles with
  `controlled/locks/native.Cargo.lock` and `web.Cargo.lock`**, then builds offline with the
  pinned Rust toolchain. Nothing reads `upstream/pagefind-native/Cargo.lock` during the build,
  and nothing runs `npm install`/`npm ci` against `pagefind-js/package-lock.json`. The browser
  JS is bundled by the pinned Rolldown 1.2.15 binding straight from `pagefind_web_js/lib`
  sources (`bundle.json` lists every module).
- Policy: ADR-0020 (controlled minimal Pagefind source build, owned maintenance, raw upstream
  findings preserved with dispositions), `docs/dependency-policy.md`, `docs/validation-115.md`,
  `docs/research/website-dependency-qualification.md` and
  [115-controlled-build.md](115-controlled-build.md).
- The repo's own gate already holds the raw findings. `audit.ts` records each one in
  `website-dispositions.json` with `blocks: false` for raw-upstream sources and **blocks on any
  finding in the selected build graph or in `pnpm-lock.yaml`**. The latest macOS evidence has 79
  raw findings, 0 blocking (`qualification/evidence/macos-arm64/advisory-dispositions.json`).
- The `upstream/` files are not copied into the served site, the server, the web app or the
  extension.

#### What is compiled into what we ship or run

Source: `evidence/macos-arm64/graphs.json` and `*.tree.txt` (selected normal+build closures
from `cargo tree`, target `aarch64-apple-darwin`), captured at implementation commit `eb23649`
(27 October 2026); the recipe files have not changed since. The Linux amd64 evidence in
`evidence/historical/` predates the current recipe; the live CI `dependencies` job above is the
current Linux check. The closures were not re-derived; this is a read of recorded evidence.

| Artifact                        | Features                                      | Packages  | actix-http / rustls / rustls-webpki / quinn-proto / tar / rand |
| ------------------------------- | --------------------------------------------- | --------- | -------------------------------------------------------------- |
| Pagefind CLI (native)           | `--package pagefind --no-default-features`    | 151       | none present                                                   |
| Pagefind WASM (de, en, unknown) | `--no-default-features` + language            | 19 each   | none present                                                   |
| Astro compiler (`astro_napi`)   | `--no-default-features`                       | 156       | `rand 0.8.6` only, a fixed version with no alert               |
| Rolldown / Sätteri              | release selection                             | 282 / 127 | none present                                                   |

`actix-http` arrives only via the `serve` feature (default upstream); the patch makes it
`default = []` and the CLI additionally refuses `--serve/--service/--write-playground`.
`rustls`/`webpki` come from `reqwest` in the dictionary build for the `extended` tokenizer,
which is not selected (`reqwest/http3`, hence `quinn-proto`, is absent even from the full tree).
Where the `tar` crate enters upstream was not established; it is absent from the selected tree
either way. The unmodified lock still lists all of these versions because a lockfile lists
every feature combination, which is why Dependabot matches them.

#### Per-alert assessment

"Runtime" means a shipped artifact or server code path; "Build" means a build or CI step on
our side. Each advisory's exploit mechanics were not analysed in depth; the conclusions rest on
the package not being installed or compiled and on there being no attacker-controlled input to
the upstream tooling.

| Group (alerts)                                                                | Advisories                                                                                                                                   | Runtime | Build                                                            | Exploitable with inputs we control?       |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- | ----------------------------------------- |
| **tar (npm)** #3, #7, #8, **#9 critical**, #10, #11                           | GHSA-vmf3-w455-68vh, -gvwx-54wh-qm9j, -8x88-c5mf-7j5w, **-23hp-3jrh-7fpw**, -w8wr-v893-vjvp, -r292-9mhp-454m                                 | No      | No. Dev-tooling ancestry in Pagefind's JS test setup, never installed | No. Nothing extracts archives with it.    |
| brace-expansion #1, #5, #12, #13, #16, #17, #18                               | GHSA-jxxr-4gwj-5jf2, -3jxr-9vmj-r5cp, -mh99-v99m-4gvg, -rgw5-rvv9-x895, -6j4f-fj2g-mc7p, -qhr7-859c-m2p7, -q2hr-2g5m-vwhr                    | No      | No (not installed)                                               | No                                        |
| js-yaml #4, #6, #14, #15                                                      | GHSA-h67p-54hq-rp68, -52cp-r559-cp3m, -5p4m-2wfm-xmqj, -2883-xcg3-v3hh                                                                       | No      | No                                                               | No                                        |
| minimatch #32, glob #31                                                       | GHSA-g3hv-75wg-m249, GHSA-3g3m-2fjr-6pw4                                                                                                     | No      | No                                                               | No                                        |
| esbuild #2 (low)                                                              | GHSA-g7r4-m6w7-qqqr                                                                                                                          | No      | No. The JS build uses Rolldown, not this esbuild.                | No                                        |
| actix-http #21                                                                | GHSA-xhj4-vrgc-hr34                                                                                                                          | No      | No (`serve` removed and refused)                                 | No. A web server is never started.        |
| quinn-proto #26                                                               | GHSA-4w2j-m93h-cj5j                                                                                                                          | No      | No (not in any selected tree)                                    | No. No QUIC.                              |
| rustls #27–#30; rustls-webpki #19, #20, #24 (high)                            | GHSA-2mjx-qc3c-rqvc, -h2v8-394m-p7vv, -c8m5-c952-6cm4, -w44r-93j7-qv28; GHSA-965h-392x-2mh5, -xgp8-3hg3-c2mh, -82j2-j2ch-gfr8                | No      | No (extended-tokenizer dictionary download path, not selected)   | No. No TLS client in the shipped CLI/WASM. |
| tar (crate) #25                                                               | GHSA-3pv8-6f4r-ffg2                                                                                                                          | No      | No (absent from the selected tree)                               | No                                        |
| rand #22, #23 (low)                                                           | GHSA-cq8v-f236-94qc                                                                                                                          | No      | No (only the fixed 0.8.6 in the compiler)                        | No                                        |

CI and local builds do run a Rust toolchain and the pinned binaries, but only on public pinned
sources, and run no code from the vulnerable crates and npm packages above.

#### Options considered

- **(a) Bump the upstream pin to a fixed Pagefind release.** v1.6.0 was released 2026-11-01.
  Its tag's lockfiles (checked against the vulnerable ranges in the alerts, not rescanned for
  new advisories) contain actix-http 3.12.1, tar 7.5.22, brace-expansion 5.0.12, js-yaml
  3.15.2, esbuild 0.28.1, rand 0.8.6/0.10.1, and no rustls, rustls-webpki, quinn-proto or tar
  crate. That would clear 30 of 32 alerts; **minimatch 10.2.6 (#32) and glob 13.0.6 (#31)
  remain vulnerable** there (fixed in 11.0.1 and 14.0.2), and v1.6.0 may bring alerts of its
  own. It is a requalification, not a lockfile swap: it touches `provenance.json` hashes,
  `controlled/inputs.json`, the patch (written against 1.5.2 sources), the controlled locks,
  the WASM source-reproduction controls, the license gate and fresh evidence receipts. The
  shipped artifacts are unaffected by the alert versions, so it buys alert hygiene, not risk
  reduction. Do it when the project wants 1.6.0 for its own reasons.
- **(b) Exclude the paths via `.github/dependabot.yml`.** Not effective: `exclude-paths` is a
  version-update scan option, and GitHub's documentation says `dependabot.yml` settings do not
  interact with Dependabot alerts, which come from the full dependency graph. The current
  config covers only `npm` at `/` and `github-actions`, so these directories are already
  outside version updates, and no open Dependabot PR touches them. No config change was made.
  Renaming or moving the lockfiles to dodge graph detection would break the SHA-256 provenance
  and the `audit.ts`/OSV path expectations and is not recommended.
- **(c) Dismiss as "vulnerable code is not actually used"** (human action). Accurate per the
  sections above and immediate, and the real control (OSV gate on the selected graph, blocking
  at 0 findings) stays in force. Dismissals are per alert, so new advisories on the same
  snapshot will re-alert until the pin moves, and a dismissal hides a later change in the
  selected graph from the Dependabot view, though not from the OSV gate.
- **(d) Patch the snapshots.** Rejected: it destroys the byte-for-byte provenance the audit
  gate relies on ("raw upstream locks remain unchanged", ADR-0020), and would not change what
  is compiled because the controlled locks are separate files.

Recommendation: dismiss all 32 alerts as "vulnerable code is not actually used", grouped by
package, with a comment stating "raw upstream snapshot, not installed or compiled; selected-graph
OSV gate stays at 0" and linking the evidence in `advisory-dispositions.json`. This is a human
action and was not taken. Keep the OSV gate as the real control and re-check `graphs.json`
whenever the Pagefind recipe changes. Plan the Pagefind 1.6.0 requalification as a separate
ticket (expect two remaining dev-only alerts, minimatch and glob). Optionally look at GitHub's
Dependabot alert rules for a rule scoped to these manifest paths; it could not be confirmed
from the documentation whether rules can filter by manifest path.

Limits: closure evidence is the recorded macOS arm64 qualification plus the Linux CI
`dependencies` job result for the OSV outcome, and the closures were not re-run. Advisory
titles, ranges and patched versions were read from the alert API, not each advisory's full text.
The v1.6.0 comparison is lockfile versions against the alerts' vulnerable ranges only.

### Triage of 5 November 2026

Scope: the 22 open Dependabot alerts of the public repository (numbers 2–32, queried read-only).
Advisory titles are the public GHSA summaries.

**No dependency update is possible or needed. No `package.json`, `pnpm-workspace.yaml`,
override or `pnpm-lock.yaml` change was made.** All 22 alerts concern one of two kinds of
manifest, neither part of the product's installed or shipped dependency graph:

1. `pagefind-js/package-lock.json` (11 alerts) and `pagefind-native/Cargo.lock` (11 alerts)
   under `apps/website/qualification/upstream/` are **byte-pinned copies of Pagefind v1.5.2's
   own lockfiles**, bound to a SHA-256 in `upstream/provenance.json` and re-checked by
   `scripts/website-qualification.ts` ("Raw upstream lock changed"). They are evidence inputs
   for the #115 advisory scan, not manifests anything installs. Editing them would break the
   provenance check and not change what is built.
2. The pnpm graph (`pnpm-lock.yaml`) is clean. `pnpm audit` reports no known vulnerabilities,
   and `pnpm why -r tar js-yaml esbuild` finds none of them. `brace-expansion` is at 5.0.12 and
   `minimatch` at 11.0.3, both at or above every patched version below.

The actual fix for the Rust alerts is upstream: a Pagefind release whose lockfile carries the
patched crates. v1.6.0 (published 2026-11-01) was not evaluated here; adopting it means
re-pinning `provenance.json`, regenerating the controlled locks and re-running full #115
requalification, a separate task.

#### Evidence for "not reachable"

- Current build evidence is `evidence/macos-arm64/`, which covers **macOS arm64 only**. Linux
  amd64 evidence is the older `evidence/historical/cb04e23/linux-amd64/` receipt, which belongs
  to an earlier recipe and does not qualify the current one. Both show the same result for the
  crates below.
- `graphs.json` and `*.tree.txt` record the exact normal and build closure of the executed
  native and WASM artifacts. `native` has 151 packages and no `rustls`, `rustls-webpki`,
  `quinn-proto`, `actix-http`, `tar` or `rand`; `web-de`/`web-en`/`web-unknown` (the WASM that
  ships) have 19 packages with none of them; `rolldown` and `satteri` have none either. The
  Astro compiler closure contains `rand` **0.8.6**, the patched version.
- The Rust alerts exist because the raw upstream `Cargo.lock` is the _full_ workspace lock,
  covering every optional feature and platform alternative. The controlled build compiles the
  native CLI with no default/serve/extended features, and the recorded closure does not contain
  these crates. Which upstream feature pulls each one in was inferred from the lock's
  dependency edges (actix-web, reqwest/quinn/hyper-rustls, lindera-dictionary, portpicker) and
  was not separately verified per feature.
- The `pagefind-js` npm lock belongs to Pagefind's own JS tooling (ava, tsx, esbuild) and is
  never installed or executed. The shipped JS is bundled from the pinned `pagefind_web_js/lib`
  sources by the Rolldown 1.2.15 binding.
- **Caveat:** the committed `advisory-dispositions.json` does not list every currently open
  GHSA (by GHSA id it has no entries for #28–#30; they may appear under RUSTSEC aliases). The
  reachability argument rests on closure membership, not on that file. Refreshing it is part of
  the Pagefind follow-up.

#### Alerts

"Runtime?" is by product role, not Dependabot's scope field: the Pagefind CLI is website _build
tooling_ and only the WASM/JS it produces ships to readers. "Direct?" is relative to the
manifest, derived from the lock's dependency edges, because Dependabot reports `unknown` for
Cargo. Every alert below was classified "dismissed-rationale, no change" (a rationale for the
maintainer, not an applied dismissal).

npm, `pagefind-js/package-lock.json` (locked there: tar 7.5.13, js-yaml 3.14.2, brace-expansion
5.0.5, minimatch 10.2.5, esbuild 0.28.0 plus 0.27.7 nested under `tsx`; all dev-only):

| #  | Package         | Severity | GHSA                | Direct?        | Reachable?                                                                                                                  |
| -- | --------------- | -------- | ------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 2  | esbuild         | low      | GHSA-g7r4-m6w7-qqqr | direct (dev)   | no: not in pnpm graph, Windows dev-server only (the nested 0.27.7 copy under `tsx` falls under the same rationale)           |
| 3  | tar             | medium   | GHSA-vmf3-w455-68vh | transitive     | no: not in pnpm graph, upstream tooling never run                                                                           |
| 4  | js-yaml         | medium   | GHSA-h67p-54hq-rp68 | transitive     | no                                                                                                                          |
| 5  | brace-expansion | high     | GHSA-3jxr-9vmj-r5cp | transitive     | no: pnpm graph has 5.0.12 (patched ≥ 5.0.7)                                                                                 |
| 6  | js-yaml         | high     | GHSA-52cp-r559-cp3m | transitive     | no                                                                                                                          |
| 10 | tar             | medium   | GHSA-w8wr-v893-vjvp | transitive     | no                                                                                                                          |
| 14 | js-yaml         | high     | GHSA-5p4m-2wfm-xmqj | transitive     | no                                                                                                                          |
| 15 | js-yaml         | high     | GHSA-2883-xcg3-v3hh | transitive     | no                                                                                                                          |
| 18 | brace-expansion | medium   | GHSA-q2hr-2g5m-vwhr | transitive     | no: pnpm graph has 5.0.12 (patched ≥ 5.0.12)                                                                                |
| 32 | minimatch       | medium   | GHSA-g3hv-75wg-m249 | transitive     | no: concerns the raw lock's 10.2.5; the repo graph is at 11.0.3 (≥ patched 11.0.1). **minimatch 11.0.3 override intentionally untouched** |

Rust, `pagefind-native/Cargo.lock` (locked there: rustls 0.23.37, rustls-webpki 0.103.10,
quinn-proto 0.11.14, actix-http 3.12.0, tar 0.4.45, rand 0.8.5 and 0.9.2; all **transitive** of
`pagefind`, via actix-web/actix-files, reqwest/quinn/hyper-rustls, lindera-dictionary,
portpicker). All are build tooling only and absent from the controlled native and WASM closures:

| #  | Package       | Severity | GHSA                | Notes                                                                                           |
| -- | ------------- | -------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| 19 | rustls-webpki | low      | GHSA-965h-392x-2mh5 | transitive (via rustls). Fixed upstream in 0.103.12                                             |
| 20 | rustls-webpki | low      | GHSA-xgp8-3hg3-c2mh | transitive                                                                                      |
| 24 | rustls-webpki | high     | GHSA-82j2-j2ch-gfr8 | transitive. Fixed upstream in 0.103.13                                                          |
| 27 | rustls        | medium   | GHSA-2mjx-qc3c-rqvc | transitive (hyper-rustls, quinn, reqwest). Fixed upstream in 0.23.45                            |
| 28 | rustls        | low      | GHSA-h2v8-394m-p7vv | transitive. Fixed upstream in 0.23.46                                                           |
| 29 | rustls        | medium   | GHSA-c8m5-c952-6cm4 | transitive                                                                                      |
| 30 | rustls        | low      | GHSA-w44r-93j7-qv28 | transitive                                                                                      |
| 26 | quinn-proto   | high     | GHSA-4w2j-m93h-cj5j | transitive (via quinn); absent from every selected closure. Fixed upstream in 0.11.15           |
| 21 | actix-http    | medium   | GHSA-xhj4-vrgc-hr34 | transitive (via actix-web/actix-files); no Pagefind server is built or run. Fixed upstream in 3.12.1 |
| 25 | tar           | medium   | GHSA-3pv8-6f4r-ffg2 | transitive (via lindera-dictionary); absent from every selected closure. Fixed upstream in 0.4.46 |
| 22 | rand 0.9.2    | low      | GHSA-cq8v-f236-94qc | transitive (via quinn-proto). Fixed upstream in 0.9.3                                           |
| 23 | rand 0.8.5    | low      | GHSA-cq8v-f236-94qc | transitive (via actix-http, lindera-dictionary, portpicker); the only `rand` in a selected closure is the Astro compiler's already-patched 0.8.6 |

#### Suggested dismissal reasons (for the maintainer to apply)

The alert state was not touched. If the maintainer chooses to dismiss, the GitHub reason is
"Vulnerable code is not actually used" for both groups:

- #2–#6, #10, #14, #15, #18, #32 (npm, `pagefind-js` lock): the lock is an unmodified upstream
  evidence copy; the packages are not installed, and the pnpm graph is clean.
- #19–#30 (Rust, `pagefind-native` lock): crate absent from the controlled native, WASM,
  Rolldown, Sätteri and Astro-compiler closures; it exists only in the raw full upstream
  workspace lock. Evidence: `evidence/macos-arm64/graphs.json`, checked on macOS arm64 only;
  Linux rests on the historical receipt.

Dismissal removes the alerts from view, but they will recur whenever Dependabot re-reads these
files. Excluding `apps/website/qualification/upstream/**` from Dependabot would need a
`.github/dependabot.yml` decision the maintainer has not made, and Dependabot's npm update there
is not feasible because the file must stay byte-equal to upstream.

Constraints respected: `better-auth` stays at exactly 1.7.14 and the minimatch 11.0.3 override
stays; no alert concerned `better-auth`; no new override, so `docs/dependency-policy.md` needs
no new entry; no major bump was considered.

#### Follow-ups

1. Evaluate Pagefind **v1.6.0**: re-pin `upstream/provenance.json` and the controlled locks,
   rebuild, regenerate the evidence and advisory dispositions. This should clear most Rust
   alerts at source.
2. Linux amd64 evidence for the current recipe is still pending (see `evidence/README.md`).
3. Decide whether Dependabot should ignore `apps/website/qualification/upstream/**`.

#### Verification

The baseline had no dependency changes, so verification confirms the tree is unchanged and
healthy: `pnpm install --frozen-lockfile` passes; `pnpm audit` reports no known
vulnerabilities; `pnpm turbo run lint typecheck --continue` passes 30 of 31 tasks (the one
failure is the website build, which needs the network-dependent controlled Pagefind source
build and is unrelated to dependencies); `pnpm test:scripts` passes 9/9. The server test suite
needs PostgreSQL and was not run, because nothing in the server's dependency graph changed.

## Audit gaps P-5 and FA-ERW-02/03/05 — 5 November 2026

Narrows the two PARTIAL gaps from the 4 November requirements audit as far as the public
repository can; neither is fully closed (see each "Limit" and "Remaining"). It is test
evidence about source behavior only. It does not qualify or activate anything, does not assert
provider permission, release eligibility or a passed Quality gate, and does not change the
#138/#140 gates that hold #114 activation. No real provider, payment, mail or identity service
was contacted.

### P-5: #114 AC3 "New Checks use the active configuration; results record it"

**Finding.** The product already did this. `Check.measuredConfiguration` is snapshotted in the
Check transaction, `ReferenceResult.measuredConfigurationId` is written with each stored
result, and `toCheck` exposes both (`apps/server/src/checks/store.ts`). The gap was in tests:
the only assertions were in `apps/server/test/configurations.contract.ts` (second test), which
is not matched by the default `test/**/*.test.ts` include, is not listed in any package script
or workflow, and shares a file with a test that needs the private service. No product change
was needed.

**Added.** `apps/server/test/check-measured-configuration.test.ts` (real PostgreSQL, real web
and worker processes, published HTTP contract; the active pointer is the existing controlled
`TEST_CONFIGURATION_POINTER` adapter):

- A new Check returns the active ID; after the worker ends it, the Check and its stored result
  expose the same ID, and the database row `reference_results.measured_configuration_id` holds
  it (not a response-side value).
- The ID survives a web restart and a switch of the pointer; the old Check and result keep ID A
  while only a new Check takes ID B.
- With no active configuration, no ID is invented at Check or result level or in the database.

**Evidence.** Passed on the first run, as expected for existing behavior. To show it can fail,
the result-level mapping in `toCheck` was temporarily disabled: the first test failed; the
change was reverted and is not committed.

**Limit.** The controlled run ends in a failed Status because the pointer names a configuration
with no local executable. A Verdict carrying the ID needs a qualified, locally executable
measured configuration and real source recordings; that path cannot be exercised source-only
and stays covered by the existing store check (`configuration-result-mismatch`) and
qualification work under #114/#138/#140. AI-preview binding (`ai-extraction.test.ts`) is
unchanged.

### FA-ERW-02, FA-ERW-03, FA-ERW-05: simulations

Where each part lives:

| Part                                                                         | Public repo                                            | Private service only                       |
| ---------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------ |
| Opaque Owner key on every Check (`owner_id`, `actor_id`); Owner-scoped reads | yes (`Principal.ownerId`, store)                       | Owner creation, personal Owner per Account |
| Named permissions and the `Entitlements.resolve` / `can()` port              | yes (`apps/server/src/entitlements.ts`, `http/app.ts`) | role → permission map (ADR-0013, ADR-0014) |
| Membership (Account, organization Owner, role)                               | no                                                     | yes (ADR-0004 "Joining")                   |
| Issuer/subject → Account mapping and linking after proof of both accesses    | no                                                     | yes (ADR-0013 "future identity linking")   |

The public program never sees roles, memberships, issuers or subjects. The tests therefore use
**test-defined stand-ins** for the private tables (`ROLES`, `memberships`, `IDENTITIES`) behind
a test `resolve` function. They show what the public seams accept and require; they do not show
that the private service's join, role mapping or linking works.

`apps/server/test/extension-seams.test.ts` (in-process `createApp` on real PostgreSQL, no
ports):

- **FA-ERW-03.** The test fails if any business route of `/v1` or `/v2` (read from
  `app.routes`) is missing from its reviewed route → permission table, so a new route cannot go
  unclassified. For each route, denying one named permission yields 403 exactly for the route's
  permission (a route that 403s for another reason, or a mis-classified table entry, would not
  be caught); an anonymous request yields 401. A **simulated new role** (`read-only-reviewer`,
  added as one row in the test role table with no change to any route) passes only `check:read`
  routes; an unknown role authenticates nothing.
- **FA-ERW-02, scenario "Account joins an organization".** Account A with session S creates a
  Check under its personal Owner. A membership (A, organization Owner O, role) is added to the
  test stand-in. The public program needs no data migration for this: the personal Check's
  database row is identical before and after, including after a Check is created under O, and
  the same Account and session headers keep working (the test supplies them; it does not
  exercise the private session store). A Check created under O has `owner_id = O`,
  `actor_id = A`; the personal Owner cannot read O's Check and O cannot read the personal one
  (404); a read-only membership cannot create under O while the personal Owner keeps full use;
  an unrelated organization is refused.
- **FA-ERW-05, scenario "a further sign-in method is added".** An email-code identity creates a
  Check. A simulated university issuer/subject is mapped to the same Account; the Check row is
  unchanged, the new identity sees it and creates further Checks under the same Owner/Account,
  and a different Account's identity gets 404. `verification.checks` has `owner_id` and
  `actor_id` but no issuer, subject, provider, session, identity or email column, so ownership
  cannot depend on the method (a name-based check: a differently named column would not be
  caught).

**Evidence.** Passed on the first run. Mutations, each reverted and not committed: skipping
`principal.can` in `authorize` failed the permission, role and join tests (3 failures);
removing the Owner comparison in `ownerSnapshot` failed the join and identity tests (2
failures).

**Remaining — private service or human.** Public-repository tests cannot cover these; they need
tests in the private service (not touched here):

1. **Join (ADR-0004).** Creating a membership leaves the personal Owner's Plan, grants, Quota
   and History unchanged; a personal Pro subscription continues independently; blocking one
   Account does not block the organization Owner; no personal History becomes visible to
   organization members.
2. **Role (FA-ERW-03).** Adding a role to the private permission map changes decisions for
   existing named permissions with no change to the protected actions; every private protected
   action is covered by the same route/permission completeness check as above.
3. **Identity (ADR-0013 continuity list).** Attaching a simulated new method preserves one
   Account and one personal Owner; rejects same-email and unverified-claim linking; rejects an
   issuer/subject already bound elsewhere; requires fresh proof of both accesses; refuses
   invoice-only takeover.
4. **Human.** The FA-ERW acceptance reviews in `docs/requirements-traceability.md` remain
   architecture reviews by the client. A live federation login, metadata trust and no-email/
   collision cases stay deferred to the FA-ORG-07 trigger (ADR-0013); nothing here is that proof.

Running: the new tests run in the default server suite
(`pnpm --filter @source-taster/server exec vitest run test/check-measured-configuration.test.ts test/extension-seams.test.ts`)
against `DATABASE_TEST_URL` / `DATABASE_ADMIN_URL`. `check-measured-configuration` uses the port
named by `SOURCE_TASTER_TEST_MEASURED_RECORD_PORT`; `extension-seams` binds no port.

## Final #70 review

The final whole-spec review of #70 produced nine substantiated findings, corrected in a
coordinated public and private implementation, then a validation receipt, correction-review
residuals and a publication acceptance. The three original notes are folded here.

### Corrections

All nine final review findings were substantiated against the accepted issues, GLOSSARY and
ADR-0001/0004/0010/0012/0013/0017/0019. No finding was waived.

| Public finding                | Correction                                                                                                                                                                                                                                                                                                                                                                                                  | Verification                                                                                                                                                                                                                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account-management ownership  | Open clients contain a safe private-web `/account?language=…` link, under their existing host flags. No Account-management form or workflow remains in open UI code. Sign-in, session transport, Guest identity, Check workspace and normal revocation enforcement remain open. The private page was independently implemented; no AGPL UI or internal verification implementation was imported or copied into private code. | Real Chromium web tests in DE/EN cover the private page against both real programs: sign-in, fresh proof, wrong code, new-address confirmation and deletion. Public link/gate tests and real extension builds cover forwarding without credentials.                                                                  |
| Report test seam              | Both real programs now create/download Verification reports for paid packs and subscriptions, assert unchanged Quota through `/v2/quota`, then sign out and prove download refusal with the still-signed token. Supplemental PDF structure fixtures remain. Removed the internal reservation-call counter assertion.                                                                                        | `apps/server/test/commerce.contract.ts`, using real PostgreSQL, verification web/worker and private service with fake external payment/mail only.                                                                                                                                                                  |
| Grounded AI References lost   | Parser recognition is no longer an acceptance prerequisite. Parser comparison still identifies changed fields; exact original text/spans, schema validation, field grounding/proposals and fallback notices remain.                                                                                                                                                                                         | New HTTP regression for embedded author/title text without year or identifier failed with an empty Reference list before the fix; all 21 AI extraction tests pass.                                                                                                                                               |

The private corrections cover recoverable limiter authority without shortening 24-hour
windows, idempotent refund/chargeback grant fencing, durable exact invoice archive delivery
with eight-year COMPLIANCE holds, full temporary Pro History features, current Account
language for delayed pack purchase mail, and transaction-scoped Operator activation
completion.

This is local implementation evidence. Both-program report tests and private Account
browser tests run the real programs on owned disposable PostgreSQL. Payment, SMTP, AI and
object-storage fixtures are synthetic external adapters, not qualified production
providers. Invoice archive tests compare exact PDF/UBL bytes through authorized downloads;
the delivery-disabled mutation is a sensitivity check, not an original-baseline red run.
Other code regressions have original red logs. The Operator bookkeeping extraction retains
existing activation behavior/tests.

The independent limiter-authority option refines ADR-0012's original one-instance
placement. Human deployment/architecture acceptance, EU/legal/cost evidence and a fresh
durable authority surviving primary account/region loss remain prerequisites; no
production second database is claimed approved or provisioned. Missing/corrupt authority
refuses service. The code enables recovery with preserved consumption; it does not qualify
the eight-hour RTO. The invoice bucket must be provisioned separately from 13-day database
backups and its actual Object Lock/lifecycle and recovery qualified.

All release refusal (exit 78), quality/load/calibration, source #138/#140/#136, EU/provider/
legal, Selected dependency and private minimatch gates remain mandatory. Nothing changes
scheduled jobs or marks human qualification complete.

No public transport source changed. All five private dependency pins stay at
`d50b0ac24273515e5f291de58aa29d7856f99475`; no repin or temporary workspace override is
required. Application publication must be coordinated so the private `/account` page
exists before links are enabled. The implementation owned only the two integration roots
starting at public `9970b4c1211c48dedd790fd29e5af1c8de52d26b` and private
`2823c0840f599c5a2041e74ea6c32ab57bb3523d`. No predecessor, nested agents, pushes, PR/issue
writes, cloud/mail/provider actions or shared port-5433 resources were used.

### Implementation validation receipt

Implementation commits: public `c5a6eb9d8efda5f20c1f82a777ad27db76627167`, private
`ce8db71b492d3921b035594da56b43d2cad9175f`. The accompanying handoff commits add the
receipt and wording clarifications only.

| Finding                         | Evidence                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Grounded AI Reference retention | RED on the missing Reference; GREEN with all 21 extraction tests, including grounding, invalid output and fallback behavior.                                                                                                                                                                                                                                                                       |
| Full temporary Pro scope        | RED on the API scope; GREEN for scope and expiry.                                                                                                                                                                                                                                                                                                                                                  |
| Delayed purchase language       | RED on the expected German subject. The test capture was extended to retain actual HTML rather than stripping it. GREEN for subject, HTML, localized summary and unchanged legal evidence after an Account Preference update.                                                                                                                                                                       |
| Recoverable limiter authority   | RED records the original missing configuration capability; GREEN proves one-hour recovery with preserved 24-hour origin consumption, exhaustion at the original limit and refusal for missing/corrupt state. Existing shared-budget concurrency is green.                                                                                                                                         |
| Refund/chargeback fencing       | RED on retained paid capacity. The final private suite passes consumed-slot preservation, duplicate refund processing and lost chargeback discovery before activation; refunded Pro is covered; an early-refund case proves invoice retention/archive when refund precedes paid notification.                                                                                                       |
| Exact durable invoice archive   | The delivery-disabled run is an explicit sensitivity check, not an original baseline red run. The final private suite passes exact PDF/UBL byte comparison against downloads, COMPLIANCE retention, outage/restart/retry and subscription delivery. The pre-existing TRUNCATE protection assertion now accepts PostgreSQL's earlier foreign-key refusal as well as the append-only trigger; no destructive operation is allowed. |
| Operator activation completion  | Both existing activation paths pass in the final private suite, including proof expiry, idempotency, stale/concurrent operations and audits.                                                                                                                                                                                                                                                      |
| Sensitive Account UI ownership  | Five real Chromium web tests pass, including both real programs plus the independent private web page for DE/EN email change/deletion; the two affected real-program cases repeat after private catalog generation; two native extension fixture/gate cases and the native extension case against both real programs also pass.                                                                       |
| Hosted report seam              | Both pack and subscription cases pass using real programs/PostgreSQL, actual report job/PDF download, unchanged Quota API snapshot and revoked-session download refusal. The initial expectation of 401 was corrected to the contract's actual 403 denial; authorization was not relaxed.                                                                                                           |

The final private regression run passes **51 tests** across abuse, Operator, commerce and
subscription suites. The subsequent early-refund regression passes separately. Initial
parallel validation exhausted the owned PostgreSQL connection limit; serial reruns exposed
and fixed an avoidable pool wait in legacy same-database limiter composition. The final
suite is green. No result from the failed runs is presented as qualification.

Affected public UI/server/web/extension and private server/web/operator-contract
typechecks pass. Changed-code ESLint, format checks, both-program catalogs and
public/private application builds pass. Normal Vite bundle-size warnings remain;
thresholds were not changed. Private Prisma and Paraglide output were regenerated from
sources. Release refuses with **exit 78**, listing no load report, uncalibrated
configuration, no measured configuration and no measurement location. Quality/load/
calibration, source #138/#140/#136, EU/provider/legal, Selected dependencies and private
minimatch gates remain required. No cloud provisioning, real RPO/RTO drill, provider
approval or human acceptance was performed.

Handoff constraints: no public transport source changed and all five private transport
pins remain `d50b0ac24273515e5f291de58aa29d7856f99475`. No workspace/lock override or
unpublished pin was introduced, and no transport publication/repin is required. Private
`/account` deployment must be coordinated before enabling public management links, and the
new private migrations applied. The independent limiter authority is a code capability
requiring human hosting/architecture acceptance against ADR-0012's original one-instance
topology, fresh durable evidence across primary region/account loss, EU/legal/cost review
and the actual recovery drill. It is not a claim that a second production instance is
approved or provisioned. Missing evidence remains a refusal. The invoice bucket must
likewise be separately provisioned and qualified with versioning and eight-year COMPLIANCE
holds, distinct from 13-day backups. These are preserved gates, not waivers. The only
external test resource was one owned Docker container on loopback; per-test databases and
roles were owned and disposable; shared/unknown port 5433 resources were not touched. No
pushes, nested agents, PR/issue writes, scheduled-job changes or actual cloud/mail/provider
actions occurred.

### Correction-review residuals

The separate correction reviews confirmed the initial fixes and found four distinct private
residuals (language was reported by both axes). The parent corrected these directly on the
same integration checkouts:

- Due Check-pack Activation excludes reversed invoices before the 100-Order batch limit,
  ordered by due time and ID. Immutable Order/reversal evidence remains unchanged; the
  transaction still rechecks the reversal fence. The API/Quota regression seeds a
  deterministic full reversed backlog and proves the next valid paid Order receives its 300
  Quota. It failed with remaining 100 instead of 400 before the fix. The complete commerce
  suite passes **17/17** on a separate owned port. An initial runner port collision was
  documented.
- The private Account page loads authoritative Preferences, refreshes on focus, and
  persists explicit language switches through the existing Preferences API. Failed writes
  are visible and do not claim a saved language. The existing citation style is preserved
  by the language-only PATCH.
- The deletion summary is tagged with its Account ID, cleared on identity changes and failed
  reads, and hidden unless it belongs to the current Account. Proof/form state also resets
  when identity changes. Four DE/EN real-program Chromium cases cover persistent language,
  refocus, failed writes, successful management/deletion, and a second Account whose summary
  fails: no previous Quota is shown and deletion stays disabled. Two original browser
  failures were captured RED; the cases pass **4/4**.
- New signed Abuse assertions are inserted in the same independent authority database that
  sweeps their expiry. Active assertions left in the primary database remain rejected during
  cutover; expired legacy primary rows are swept too. The API regression simulates omitted
  ephemeral primary rows and proves an already consumed assertion cannot be replayed. It
  received 200 instead of 401 before the correction; the full Abuse suite passes **7/7**.
  This is local recovery evidence, not a cloud durability/RTO qualification.

Affected private server/web typechecks and changed-file public/private ESLint pass. Source
formatting and diff checks pass. No transport, dependency, migration, pin, legal/provider/
quality/load/Selected gate or scheduled job was changed by these residual corrections.
Local checks do not replace hosted CI, human limiter architecture acceptance, Object Lock
provisioning or actual recovery drills.

### Publication acceptance

The publication review accepts the completed correction sources at public
`771bb0d6edf2c55aaeb75714790e8bf8f0b17deb` and private
`0fa9a88d2ff3f7ac31f2df7ffac1ee594818449c` for the existing draft PRs. Both inputs were
clean, with all three local commits preserved above published public
`9970b4c1211c48dedd790fd29e5af1c8de52d26b` and private
`2823c0840f599c5a2041e74ea6c32ab57bb3523d`. The small residual diff has no identified
publication hazard.

Retained validation covers commerce **17/17**, Abuse **7/7**, and both-program DE/EN
Chromium **4/4**, plus the affected types, lint, formatting and builds above. These suites
were not redundantly rerun for publication.

Publication verification confirms unchanged public transport sources since
`d50b0ac24273515e5f291de58aa29d7856f99475`, all **78** tracked generated transport
artifacts matching committed bytes, all five canonical private pins, unchanged private
lock/workspace metadata, and all **106** installed transport files matching the existing
#116 integrated receipt. No repin or installation was needed. At the clean correction head,
direct `node scripts/release-check.ts` in public `apps/server` still refuses with **exit
78**: no load report, uncalibrated configuration, no measured configuration, and no
measurement location. The `pnpm --filter` wrapper reports aggregate exit 1 while retaining
the child's exit-78 refusal.

Publish only to public draft [PR #139](https://github.com/jeffnawroth/source-taster/pull/139)
and private draft [PR #9](https://github.com/jeffnawroth/source-taster-service/pull/9).
Hosted CI and remaining human acceptance belong to the parent handoff; this local
acceptance does not claim either has passed.

Private `/account` deployment and the new private migrations must precede enabling public
management links. Sensitive gates remain off by default. Independent limiter authority
remains an **unapproved human architecture/hosting capability**, with no provisioned
topology or qualified cloud RPO/RTO claim. Invoice storage requires an actual separately
qualified eight-year COMPLIANCE bucket. Quality/load/calibration, source #138/#140/#136
rights, EU/provider/legal, Selected dependency and private minimatch gates remain
mandatory.

No waiver, activation, cloud/provider action, real mail delivery, issue/job change, ready
transition or merge is part of publication. The five-hour retry job and original source
histories are preserved. The parent resumes hosted CI, human acceptance and owned-worktree
cleanup.

