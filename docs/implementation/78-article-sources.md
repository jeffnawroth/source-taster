# #78 remaining article Data sources and source failures

This file records the implementation of #78 under spec #70. The work used the
TDD skill and ran as an implementation sub-agent in the T3-bound worktree
`/Users/jeffnawroth/.t3/worktrees/source-taster/t3-cd316e76`, on
`implement/78-article-sources`. It is based on `origin/spec/70-78-article-sources`
at `75dca7caf22c7396f81c1b61dec1579c74274b37`. Outside this branch, nothing was
created or changed: no replacement checkout, child, access to the predecessor
repository, edit to the private service, issue or PR change, push to the
integration branch, deployment or publication. Integration and independent
review are the parent's responsibility.

## Behavior

Three new adapters share the existing bounded request, body, retry and
PostgreSQL budget transport:

- **Europe PMC** (`apps/server/src/sources/europepmc.ts`). PMID and PMCID lookup
  plus bibliographic search, all through the REST `search` endpoint with
  `resultType=core` and `format=json`. A lookup that returns a different
  identifier is unavailable (`identifier-mismatch`), not a match. `hitCount` 0
  is a completed empty result.
- **Semantic Scholar** (`apps/server/src/sources/semanticscholar.ts`). The
  `ARXIV:` index lookup and bibliographic search (`/graph/v1/paper/search`,
  limit 5). Since the review corrections, valid arXiv identifiers are looked up
  in batches through `POST /graph/v1/paper/batch`; an unknown identifier
  (`null`) is a completed empty result. Other identifiers use the single
  `ARXIV:` lookup, where a 404 is a completed empty result.
- **arXiv** (`apps/server/src/sources/arxiv.ts`). Identifier lookup only:
  `id_list` against the Atom API, read by a bounded parser and batched across
  Checks (see [the review corrections](#review-corrections)). arXiv is
  never searched.

Routes follow ADR-0007:

- A supplied DOI goes to doi.org first, then OpenAlex and Crossref.
- PMID goes to OpenAlex, then Europe PMC. PMCID goes to OpenAlex, which is
  recorded as `unsupported` without a request, then Europe PMC.
- arXiv goes to the Semantic Scholar `ARXIV:` index, then the arXiv API.
- Bibliographic search runs OpenAlex, Crossref, Europe PMC, Semantic Scholar.

Core normalizes arXiv identifiers (`arXiv:` prefix, abs/pdf URLs and version
suffix) and carries them as `Csl.arXiv`. The existing #77 rules still apply:
one allocator per Data source, five Candidate slots and early termination.
Identifier identity settled by a DOI therefore ends retrieval before any PMCID
or arXiv request.

### Source failures

A timeout (new evidence reason `timeout`) or a rate-limit wait beyond its bound
(`rate-budget`) makes a Data source unavailable for the rest of that Reference.
Later operations for that source are recorded as `unavailable` /
`after-source-failure` and send no request. The other sources continue. This
keeps one slow provider from consuming the 30-second Reference deadline once
per search kind. An HTTP error (`http-error`) or an unreachable source
(`request-unavailable`) is retried at most once per call, and the source's
later operations still run (ADR-0007; corrected in review).

`failedSources` names every source with a transport failure. A data finding
such as `invalid-metadata`, `identifier-mismatch` or `response-size` blocks Not
found but does not name the source as failed (corrected in review):

- Not found requires every enabled search source to complete. One failure blocks
  it (ADR-0008, `insufficient-search`).
- When every responsible source failed, the Verdict is Not verifiable with the
  new reason `sources-unavailable`. It is never Not found.
- Disabled sources are recorded as `disabled` / `operator-disabled` and are never
  failed.

The web result shows the failed sources as a list under the reasons, outside
the evidence details. Each entry gives its cause: did not respond in time,
request limit or waiting time, Reference time limit, or error/unreachable.
Source names are now display names: doi.org, Crossref, OpenAlex, Europe PMC,
Semantic Scholar, arXiv. They are used in the progress line, evidence list,
Candidate heading and retraction provenance. Source links now cover Europe PMC,
arXiv and Semantic Scholar records without a DOI. English and German messages
were added; the identifier-mismatch text now says "identifier" rather than
"DOI".

### Operating settings

`packages/core/src/search-settings.ts` holds the default operating settings.
They are the single source of truth; the Version 1 DOI tracer limits are
derived from them:

- 3 s request timeout per source, one retry, a Retry-After bound of 2 s.
- At most 10 running References per Check, 20 References per worker.
- Owner-then-Check round robin.
- Per-source interval, concurrency and maximum permit wait. The values are
  doi.org 50 ms; Crossref 200 ms (1 s for searches) with concurrency 1;
  OpenAlex 1 s / 1; Europe PMC 100 ms / 1; Semantic Scholar 1 s / 1;
  arXiv 3 s / 1. Europe PMC, Semantic Scholar, arXiv and doi.org use the
  ADR-0007 initial caps. Crossref and OpenAlex keep the slower #74/#77
  development values, below ADR-0007's caps.
- Identifier batching for Semantic Scholar (200 ms, 500 identifiers) and arXiv
  (until the permit, 100 identifiers).

The Operator changes them with `SOURCE_TASTER_SEARCH_SETTINGS`, a strict JSON
patch over the defaults. The config validates bounds and rejects unknown keys and
sources. An invalid patch, or settings without the bibliographic preview, refuses
startup (exit 78). Each Version 2 article result records the flattened settings
in its Search configuration. A 16-hex SHA-256 over their canonical form enters the
Search strategy version:
`article-search-78-3-<sources>-settings-<hash>-uncalibrated` (78-2 before the
batching review corrections). The verdict rules suffix is `article-verdict-78-2`
(78-1 before the review corrections).

The budget reads per-source settings. The Check store applies
`activeReferencesPerCheck` and orders dispatch by the Owner's latest running
Check dispatch order first. Owners therefore alternate before one Owner's Checks
do. This needs no migration. The 30-second hard deadline is not an operator
setting (see deviations).

### Retraction hook

A Europe PMC record whose `pubTypeList` contains `Retracted Publication` adds
affirmative retraction evidence (`source: "europepmc"`) to the record already
received. It uses the existing #77 rule that ties evidence to the Best match
independently of the Verdict. No request is made for retraction. Without
affirmative evidence the result stays `unknown`. Semantic Scholar and arXiv
supply no retraction evidence.

### Contract

Version 2 adds the source names and the `arxiv` operation. It also adds the
`timeout` and `after-source-failure` evidence reasons, the `sources-unavailable`
reason, the progress values and the Europe PMC retraction source. The v2
`StructuredCsl` accepts `arXiv`, and Candidate CSL uses the v2 shape. The
committed `dist` and `openapi-v2.json` are regenerated. Version 1 and its
`openapi.json` are unchanged. A Version 1 create keeps the DOI tracer and default
budgets (maximum permit wait bounded by the Reference deadline) regardless of
the new settings.

## Acceptance criteria and public evidence

All server tests use real PostgreSQL and the public `/v2` HTTP/SSE API. Provider
HTTP is replaced by loopback fixtures; no internal call is mocked.

| Criterion | Tests |
| --- | --- |
| Europe PMC, Semantic Scholar, arXiv (identifier only) adapters with recorded fixtures; DOI first. **Partially met:** Semantic Scholar has no recorded fixture (see below) | `article-sources.test.ts`: "identifies a PMCID through Europe PMC…", "handles a supplied DOI before the PMCID and arXiv routes", "identifies an arXiv identifier through the Semantic Scholar index…", "falls back to the arXiv API, identifier only…" |
| A timeout, rate-limit wait or error lets the search continue and is named | "continues past a failing, a timed-out and a rate-limited source and names each"; browser `e2e-bibliographic/search.spec.ts` "names a failed Data source instead of reporting Not found" (EN/DE, axe) |
| All responsible sources fail: Not verifiable naming them, never Not found | "is Not verifiable naming every source when all responsible sources fail"; "blocks Not found while one responsible source has failed"; "reaches Not found only when every enabled search source completed" |
| Per-source budgets, timeouts and Owner fairness are versioned operating settings | "versions the Operator's search operating settings with the Search strategy"; five startup-refusal cases; `article-fairness.test.ts` "alternates between Owners…" and "caps running References per Check…" |
| Retraction hook only | "records a Europe PMC retraction report already received, without an extra request"; the PMCID test asserts `unknown` without evidence |

The recorded fixtures, their URLs, hashes, sanitization and rights are listed in
[the fixture README](../../apps/server/test/fixtures/article-sources/README.md).
No Semantic Scholar payload is stored: the live request returned 429 and the data
licence is unresolved. Its tests use synthetic records.

### Test-first record

- The adapters, failure continuation and failure naming were each written RED
  first.
- While the failure test was RED, it timed out because a failed source was asked
  again for every search kind. That led to the `after-source-failure` rule.
- Both fairness tests failed against a store with the cap and Owner ordering
  reverted, and pass with them.
- The first cap test passed without the cap because of pg-boss polling. It now
  observes a bounded 1.5 s window and was re-verified RED and GREEN.
- The retraction, settings-versioning, startup-refusal and DOI-precedence tests
  passed on their first run, because the implementation already existed. They
  are characterization witnesses, not RED→GREEN evidence.
- The browser witness was added after the UI change.

Existing #77 tests changed in three ways:

- Exact version literals became prefix/suffix checks, because the version now
  carries the settings hash.
- One completed-search case now also asserts that Europe PMC and Semantic Scholar
  are disabled and not failed.
- The test fixture's `reset()` now releases holds.

## Deviations and open questions

- **arXiv not implemented in full.** ADR-0007 identifier batching is
  implemented per worker process since the review corrections; cross-process
  batching is not. The parser does not extract arXiv identifiers from free
  text; only structured `arXiv` input is routed. arXiv is not a compared field.
- **Semantic Scholar as the arXiv index.** It is the index ahead of the arXiv
  API, chosen from ADR-0007's route list. Its data licence for a paid product
  is unresolved (research note), and no Semantic Scholar payload is stored.
- **Deadline not a setting.** The 30-second Reference deadline remains the
  ADR-0007 constant.
- **Timeout per source.** Resolved in review: `requestTimeoutMs` is a
  per-source setting.
- **Fairness mode is fixed.** Owner-then-Check round robin is the only mode and
  is recorded as `scheduling`, outside the settings hash. The operator-tunable
  fairness settings are `activeReferencesPerCheck` and `workerConcurrency`.
- **No Semantic Scholar fixture (open decision).** Criterion 1 asks for
  recorded fixtures; Semantic Scholar has only synthetic ones. Recording a
  sanitized payload, or accepting synthetic-only, depends on the unresolved
  licence and is left to the parent.
- **Changed #77 evidence.** A timed-out or rate-limited source's later
  operations now read `after-source-failure`. Previously each was attempted
  again and recorded as `rate-budget` or `deadline`. HTTP errors keep the #77
  per-call behavior (restored in review).
- **Negative-window cap test.** The per-Check cap is shown by a bounded
  negative observation window, not by an internal signal.
- **Browser E2E with a stub website artifact.** The local browser run used a
  minimal, git-ignored `apps/website/dist-preview` stub, because the website
  preview build requires the controlled Pagefind source build, which was not
  available. The information-page browser case therefore cannot pass locally;
  all others are unaffected.

## Validation

Node 24.14.0, macOS arm64, with an owned PostgreSQL 18 container
`st78-sources-pg-20261029` on loopback 55578. Pre-merge results on the
implementation tree:

- **Server `vitest run`.** 239 passed, 2 skipped, in 13 of 14 files.
  `website.test.ts` fails because `apps/website/dist-preview` is missing; that
  file needs the controlled Pagefind website build, which is unavailable here.
- **Earlier full server runs.** These also showed about 60 failures in
  `bibliographic.test.ts`: `ECONNREFUSED`, or Verdicts belonging to other
  fixtures. Their cause is a collision on the fixed test port 54777. Another
  session in the main checkout was running the same file at the same time
  (process listing). The failures are not from this change. The file passes
  61/61 in isolation and in the clean full run above.
- **Same run, one real failure.** The #77 case "continues to Crossref after an
  OpenAlex failure…" failed and was updated to the intended
  `after-source-failure` evidence (two OpenAlex requests in total). The review
  corrections restored the #77 expectation.
- **Browser, bibliographic config.** 20/20 passed, including the new
  failed-source case in English and German with axe.
- **Browser, main config.** 47 passed, 1 failed:
  `information.spec.ts`, against the stub website artifact (see deviations).
- **Static checks.** `tsc` passed for core, contract-verification, ui, i18n,
  web, extension, server and root `scripts`. `eslint` passed for each of
  those packages and root `scripts`. `prettier --check .` passed.
  `pnpm i18n:check` validated 190 messages in DE and EN.
- **Build.** The contract-verification build reproduces the committed `dist`
  and `openapi-v2.json`.
- **After merging** `origin/spec/70-78-article-sources` at `ebb8681`:
  - The full server run passed every file except `website.test.ts` (Pagefind,
    as above) and `bibliographic.test.ts`. The latter hit the port collision
    again: the other session was still running.
  - Re-run separately, `article-sources`, `article-fairness`,
    `bibliographic-lifecycle` and `lifecycle-recovery` pass. The merged
    admission-observation change in `lifecycle-recovery` is included.
  - `bibliographic.test.ts` passes 61/61 as an uncommitted temporary copy that
    differs only in using port 54879. The copy was deleted after the run.
- **Final tree.** Server `tsc` and `eslint` and root `prettier --check .`
  pass again after the merge and the test changes.
- **Extension.** `pnpm test:native` in `apps/extension` passed 4/4 (native side
  panel, web parity in EN and DE, Preferences with axe). It ran against the same
  stub website artifact, which was removed afterwards.
- **Not run.** `test:authority` needs the private peer service, and the website
  build needs Pagefind.

## Review corrections

The review of the #78 implementation (`9f91718`) found ten defects and smells in
source failure handling, operating settings, ADR-0007 batching and adapter
structure. The response was implemented by a sub-agent on a separate correction
branch based on `9f91718`; no issue, PR or integration branch was changed. The
sections above describe the original implementation and name later changes where
they apply.

### HTTP errors are per call

ADR-0007 retries an HTTP error or an unreachable source at most once per call. It
does not abandon the Data source. Only a timeout (`timeout`) or a permit wait beyond
its bound (`rate-budget`) makes a source unavailable for the rest of the Reference,
with later operations recorded as `after-source-failure`. Those two reasons are what
consume the Reference deadline once per search kind. The versioned `failureHandling`
value states exactly this rule:
`continue-and-name-transport-failed;http-error-per-call;timeout-or-rate-budget-skips-remaining-source-calls;data-findings-not-failed;all-applicable-transport-failed-not-verifiable`.

The #77 case "continues to Crossref after an OpenAlex failure…" returns to its #77
expectation: every OpenAlex operation is attempted, and each records two attempts.

### Failed sources are transport failures only

`failedSources` and the all-sources-failed rule count only transport failures:
`timeout`, `rate-budget`, `http-error`, `request-unavailable`, `deadline` and
`after-source-failure` (core `TransportFailure`). A data finding such as
`identifier-mismatch`, `invalid-metadata` or `response-size` means the source
answered. It still blocks Not found (`insufficient-search`) but never names the
source as failed, and it can never produce `sources-unavailable`. The #77
malformed-metadata case expects `insufficient-search` with no failed source. The web
cause text is a lookup map from transport reason to message.

### Operating settings after review

- **Per-source request timeouts.** `requestTimeoutMs` moved from the global settings
  into each source's settings. It is patchable per source between 100 ms and the
  Reference deadline, versioned like every other setting.
- **Retry bounds.** The patch caps `maxRetries` at 1 and `retryAfterMaxMs` at 2000,
  the ADR-0007 bounds. Wider values refuse startup.
- **Deadline-bound waits.** `maxWaitMs` and `requestTimeoutMs` are bounded by core
  `referenceDeadlineMs`, as is the Version 1 permit wait. No hard-coded 30000 remains
  in the server.
- **One source of truth.** `doiTracerLimits` is derived from `defaultSearchSettings`
  (doi.org and Crossref values and `maxRetries`), so the Version 1 record cannot
  drift from what Version 1 runs. `config.searchSettings` is always set.
- **Fairness.** The Operator-settable fairness settings are
  `activeReferencesPerCheck` (now also passed to the reference executor instead of a
  literal 10) and `workerConcurrency`. Both are in the hash. The one-valued
  `fairness` key was removed from the settings, and no second mode was invented.
  `scheduling: "owner-then-check-round-robin-3"` and `sourceReservation` stay
  recorded constants outside the hash. Each names the only implemented mode, which
  the Operator cannot change, so hashing them would only duplicate the version
  suffix. A changed mode needs a new suffix.
- **Rates.** The OpenAlex and Crossref rates stay at the slower #74/#77 development
  values. The defaults' comment no longer claims they are the ADR-0007 initial
  values: they are below ADR-0007's caps, which assume Crossref's polite pool and
  OpenAlex prepaid usage. Europe PMC, Semantic Scholar, arXiv and doi.org use the
  ADR-0007 initial caps.

### Identifier batching

ADR-0007 batching is implemented in `apps/server/src/sources/batch.ts`:

- **Semantic Scholar.** It collects arXiv lookups for at most 200 ms
  (`batchWindowMs`). It then sends one `POST /graph/v1/paper/batch` with at most 500
  identifiers (`batchSize`). The API's 500-identifier bound and its input-ordered
  response with `null` for unknown identifiers come from the official Graph API
  description.
- **arXiv.** It collects lookups across Checks until its next three-second permit and
  sends one `id_list` request, with `max_results` set to the batch size. The default
  bound is 100 identifiers, against the API's 2000 results per request.
- **Batch settings.** `batchSize` and `batchWindowMs` are versioned Operator
  settings. They are accepted only for these two sources: Semantic Scholar 1–500 and
  0–200 ms, arXiv 1–2000 and 0–3000 ms.
- **Demultiplexing.** Each run reads only its own record (by response position or
  Atom entry id). A batch carries only identifiers for the responsible source. Its
  raw evidence is the run's own record, never the batch response, so a result
  discloses no other Owner's or Check's identifiers.
- **Malformed identifiers.** arXiv answers a whole request with an error for one
  malformed identifier, so only syntactically valid version-free identifiers are
  batched. The new scheme starts at 0704. Others use the single request, and an arXiv
  error feed for a batched identifier is unreadable rather than no-record.
- **Carrier.** One live member carries the request with its own permit, retry and
  Owner guard. Every member leaves on its own cancellation or deadline, and a member
  that has left is not sent. If the carrier is cancelled, the others join a new
  batch. If the carrier's permit wait or deadline ends before the send, only the
  carrier records that outcome. The carrier selection was corrected by the batching
  review below.
- **Scope.** Batching is per worker process. The PostgreSQL budget remains global,
  and cross-process batching is recorded as unimplemented
  (`cross-process-identifier-batching`).

Known limits:

- **Shared outcome.** Once the request is in flight, its outcome is shared. The
  batching review below narrows when members that were sent record `deadline`.
- **Owner guard.** Only the carrier's Owner guard authorizes the send. Other members
  are excluded only through their own abort signals, which follow authority with the
  existing probe lag of up to 100 ms. `test:authority` was not run (private peer
  service).
- **Response size.** `maxResponseBytes` stays 5 MiB per request, below Semantic
  Scholar's 10 MB. A batch response above it is `response-size` for every member that
  was sent.
- **Version 1 permit wait.** A permit wait that ends at the Reference deadline still
  reports `rate-budget`, as Version 1 is frozen.

### Adapter structure

- Response handling shared by all article adapters lives in `sources/shared.ts`. It
  covers the completed/unreadable distinction, identifier mismatch, empty results,
  search pages and identifier lookups, and owns the `SourceRequest` type.
- One query sanitizer (`queryTerms`), one last-token name split (`displayName`) and
  one issued-year helper (core `issuedYear`) replace the per-adapter copies.
- `RecordSource` is renamed `CandidateDataSource` (GLOSSARY: Data source). The
  coordinator's per-source `state.limited` is renamed `exhausted`, after what it now
  means. The DOI tracer's `timeoutReason` is typed as a `TransportFailure`.

### Tests and process

All server tests use real PostgreSQL and the public `/v2` HTTP/SSE API with loopback
provider fixtures, plus unit tests of the batcher in `batch.test.ts`.

- **Failure rules.** HTTP error per call, transport-only failed sources, and the
  per-source timeout, retry-bound and deadline-bound refusal cases in
  `article-sources.test.ts`.
- **Batching, server.** The Semantic Scholar tests expect the `POST` batch body. A
  public test holds the arXiv permit with a primer request and runs two Checks. It
  shows one `id_list` request with both identifiers, and that each outcome contains
  only its own Candidate and no foreign identifier. It was RED with `batchSize: 1`.
- **Batching, unit.** `batch.test.ts` covers the window, the size bound, collection
  until the permit, deadline and cancellation independence, and the unsent-carrier
  case. It also covers which arXiv identifiers are batched.
- **Fixture.** The test fixture ignores `GET /`. An editor port detector sends it to
  newly opened loopback ports, which made exact request counts flaky. No adapter
  requests the root.
- **Process.** The review asked for the `tdd` skill. It was used for the last batcher
  correction (unsent carrier, arXiv 0701–0703): both tests were RED first. The
  earlier corrections were each checked RED then GREEN by hand against the public
  seams already established for #77/#78. Seams were not separately re-confirmed,
  because the sub-agent had no channel to the user.

### Deviations and open questions after review

- **Semantic Scholar fixtures stay synthetic.** Criterion 1 asks for recorded
  fixtures. The licence for storing a Semantic Scholar payload is unresolved, so this
  remains an open deviation for the parent.
- **Batching is per process** (see above).

### Versions after review

The Search strategy prefix is `article-search-78-2-…` and the Article Verdict rules
suffix is `article-verdict-78-2`. Old immutable results keep their versions. Version 2
`dist` changed only for the `CandidateDataSource` rename, which has the same schema.
Version 1 artifacts are unchanged. The configuration records `identifierBatching:
process-local;semanticscholar-window-then-permit;arxiv-until-permit;entry-demultiplexed-1`
at this stage; later stages are listed below.

### Validation of the review corrections

Node 24, macOS arm64, with an owned PostgreSQL container on loopback (removed
afterwards). `origin/spec/70-78-article-sources` had no commits beyond the base
`9f91718`, so no merge was needed.

- **Server `vitest run`.** 269 passed, 2 skipped, in 14 of 15 files. `website.test.ts`
  fails because `apps/website/dist-preview` is missing; it needs the controlled
  Pagefind website build, which was unavailable here.
- **Browser, bibliographic config.** 20/20 passed, including the failed-source case
  in English and German with axe.
- **Browser, main config.** 47 passed, 1 failed: `information.spec.ts`. Both browser
  runs used a minimal, git-ignored `apps/website/dist-preview` stub (an index page and
  an empty preview manifest), removed afterwards; the information page needs the real
  website artifact.
- **Static checks.** `eslint scripts`, and `lint` and `typecheck` in every package
  except the website, pass. `prettier --check .` passes. `pnpm i18n:check` validated
  190 messages in DE and EN. The root `pnpm lint` and turbo `typecheck` stop at the
  website build (Pagefind).
- **Build.** Rebuilding core and contract-verification reproduces the committed
  `dist` and `openapi` artifacts.
- **Not run.** `test:authority` needs the private peer service.

### Merge with main (#73, #76)

`origin/main` at `3855cc6` (#73 parser, #76 journal abbreviations) was merged on
`merge/78-main`. Both sides' behavior is kept; the conflicts were additive (imports,
exports, messages, `.prettierignore`). The v2 Candidate combines #78's `csl`,
`source` and `origin` with #76's `fields` (`FieldComparisonV2`); `dist` and
`openapi-v2.json` were regenerated.

No version identifier was changed on both sides, so none was given a new value: the
Search strategy (`article-search-78-2-…`) and `article-verdict-78-2` come from #78,
the comparison rules (`…-journal-76-1-…`) from #76, and parser provenance
`citation-styles/2` from #73. `journal-76-1` already binds the Europe PMC and
Semantic Scholar attestation selection.

Europe PMC records reach #76's journal attestation through their raw record. Semantic
Scholar `publicationVenue.alternate_names` stays unreachable: the adapter does not
request `publicationVenue`. Adding it changes #78's request URLs and batch body, so it
is left as an open follow-up.

### Batching review corrections

A narrow review of the identifier batching (`ff6b6e3`, `d07e976`) found three defects
and a nit. The fixes were made on a separate branch based on `d4961b3`. They uphold
the #78 invariant: a Data source failure or an unreliable response is `unavailable`,
never `no-record`.

- **Carrier at send.** In arXiv's until-permit mode, the first member carried the
  batch. A later member with a longer deadline inherited the first member's short
  request timeout and lost its retry, so it recorded `timeout`. Now, if a member joins
  an unsent batch with a later deadline, it takes the send over.
  - The old carrier's permit wait ends through a handover signal
    (`SourceBudget.acquire` gained an optional `handover`). The handover is honoured
    only before dispatch, so no rate slot is consumed for nothing.
  - Every live member, the old carrier included, joins a new batch. The member with
    the latest deadline carries it with its own deadline, signal, permit, retry and
    Owner guard.
  - A handover that races into a dispatch already under way is ignored: that send goes
    ahead as the shared outcome.
  - The carrier is now the last member to leave, which supersedes the "Shared outcome"
    limit above: members that were sent can record `deadline` only at the carrier's
    deadline, the latest among them.
  - Tests in `batch.test.ts`: "gives the request the latest deadline among the members
    at send" (RED: `timeout`) and "sends a burst of later members once" (guards against
    repeated sends). The public test "sends arXiv lookups collected across Checks in
    one id_list request" now starts the second Check 400 ms later. Its later deadline
    takes the send over through the real permit wait, and neither outcome names a
    failed source. This guards the mechanics: replacing the relaunch with a failure
    makes the test fail.
- **Record form only.** `batchableArxiv` accepted old-scheme identifiers with any
  archive letters, in any case, and with any YYMM. Old-scheme identifiers are now
  batched only with a known archive in lower case and a YYMM from 9108 to 0703. A
  subject-class form (`math.GT/0309136`) is not batched.
  - Recorded on 2026-10-30, `export.arxiv.org` answers `foo/9913001` with HTTP 400 and
    an error entry. It omits `math.GT/0309136` and `HEP-TH/9901001` without an error,
    although `math/0309136` and `hep-th/9901001` exist. Out-of-range dates
    (`math/9913001`, `hep-th/0801001`) are also omitted, with HTTP 200. All 34
    archives on the list were accepted.
  - The response lists entries in a different order from the request. Entries are
    matched to identifiers by normalized entry id, never by position.
  - The predicate is shared with Semantic Scholar, so subject-class, upper-case and
    out-of-range forms now use its single lookup. How Semantic Scholar answers those
    forms is unverified: nothing was recorded, because of its licence.
  - Test: the `batches arXiv identifier` table in `batch.test.ts`.
- **Complete feed.** arXiv omits an identifier without a record. Absence is
  `no-record` only when two things hold. The identifier must be in record form
  (above). The feed must be a complete answer to the identifiers sent: closed by
  `</feed>`, with `startIndex` 0, a `totalResults` equal to its entries, no error
  entry, and only requested records.
  - Otherwise a missing member is `unavailable` with `invalid-metadata`. This applies
    to truncated, partial, uncounted, empty or inconsistent feeds, and to the omitted
    subject-class and upper-case forms. A complete entry in an incomplete feed is
    still accepted.
  - Tests in `arxiv.test.ts`, at the adapter's `lookup` with the recorded feeds:
    "reads old-scheme records from a complete batch and their absence", "does not read
    … empty answer as no record", and "does not read a member missing from an
    incomplete feed as no record".
  - The fixtures `arxiv-oldscheme-batch.xml`, `arxiv-math.GT-0309136.xml` and
    `arxiv-HEP-TH-9901001.xml` are in the fixture README.
- **Timer.** The batch window timer is `unref()`ed. There is no public seam to observe
  this, so it has no test.

Known limit: subject-class and upper-case forms are never verified through arXiv.
Rewriting them to the record form would change identity comparison and core
normalization, so it is left open.

Versions: the Search strategy prefix became `article-search-78-3-…`.
`identifierBatching` became
`process-local;semanticscholar-window-then-permit;arxiv-until-permit-latest-deadline-carrier;arxiv-record-form-only;entry-demultiplexed-2`.
`article-verdict-78-2` is unchanged, because no verdict rule changed. No contract
artifact changed.

Validation (Node 24, macOS arm64, owned PostgreSQL container, removed afterwards):

- **Server `vitest run`.** 337 passed, 2 skipped, in 17 of 18 files. `website.test.ts`
  fails because `apps/website/dist-preview` is missing, as in the validation above.
- **Static checks.** `typecheck` and `lint` pass in every package and in the server.
  `prettier --check .` and `pnpm i18n:check` pass.
- **Build.** Rebuilding the packages changes no tracked artifact.
- **Not run.** `test:authority` was not run.
- **Test-first.** These were RED first: the latest-deadline test, the six tightened
  identifier rows, the two empty-answer cases, the incomplete-feed case and the
  version expectations. The burst test and the complete old-scheme batch test are
  regression guards that passed before the fix.

### Merge with main (#79)

`origin/main` at `f0bf1b4` (#79 books and chapters through ISBN catalogs) was merged
on `merge/78-main-79`. #79 had been built without #78, so it carried its own failure
handling. The merge keeps one path, #78's, and the book Data sources (Open Library,
Google Books, the ISBN route) follow it.

Conflict resolutions:

- **Core coordinator (`bibliographic.ts`).** #78's coordinator is kept, with #79's
  book route added to it:
  - book reference types and `isbn` identifiers routed to Open Library and Google
    Books;
  - `bookSearchOrder` and `bookSearchConfiguration`;
  - edition, publisher and ISBN field agreement;
  - `identityAmbiguous`, and the book-type compatibility check.

  Each route asks only its own sources: books use OpenAlex, Crossref, Open Library
  and Google Books; articles never use the catalogs. #79's parallel failure path is
  removed: `state.failed`, the `skipped`/`after-source-failure` note for any failure,
  the "every book source failed" verdict block, and
  `sourceFailurePolicy: stop-failed-source-1`.
- **Verification types (`verification.ts`).** `CandidateDataSource` gains
  `openlibrary` and `googlebooks`, and the Evidence operation gains `isbn`. #79's
  `identityAmbiguous` and `identifierAmbiguity` are kept.
- **Settings (`search-settings.ts`, `config.ts`, `.env.example`, `README.md`).**
  #79's `SOURCE_TASTER_{OPENLIBRARY,GOOGLEBOOKS}_REQUESTS_PER_SECOND` and its
  `catalogRates` are folded into the ADR-0007 search settings, giving two new
  `sources` entries:
  - `openlibrary`: `requestTimeoutMs` 3000, `intervalMs` 334 (ADR-0007 cap of 3/s),
    `maxWaitMs` 10000;
  - `googlebooks`: `requestTimeoutMs` 3000, `intervalMs` 1000 (#79's conservative
    1/s; ADR-0007 has no cap), `maxWaitMs` 10000.

  Setting either old rate variable refuses startup, so they cannot become a silently
  ignored second mechanism. The enablement variables from both sides are kept.
- **Runtime and adapters.**
  - `verification-runtime.ts` keeps #78's settings, settings hash and shared request.
    It builds #79's `bookMetadata` flag per Reference, for the OpenAlex and Crossref
    book metadata.
  - `budget.ts` is #78's version, with `handover` and arXiv/Semantic Scholar batching.
    The catalogs use `<source>:all` budget keys at their settings interval.
  - `doi.ts` and `openalex.ts` keep #78's signatures plus #79's ISBN, publisher,
    edition and `bookMetadata` projection.
  - `openlibrary.ts` and `googlebooks.ts` use #78's `shared.ts` helpers. #79's
    `names.ts` is removed.
- **Contract (`v2.ts`).** Both sides' additions are kept: the catalog sources in
  `CandidateDataSource` and `ReferenceProgress`, the `isbn` origin and operation,
  `identityAmbiguous`, `identifierAmbiguity`, field `agreement`, and #78's
  failed-source fields. The Candidate ceiling is 25: #78 had 10 and #79 had 20. The
  article route's four search sources fill 20 slots, and arXiv can add an identifier
  Candidate on top. `dist` and `openapi-v2.json` were rebuilt, not hand-merged; the
  package README is updated.
- **UI and i18n.** The links and names for Open Library and Google Books are added to
  #78's source display. #79's separate `failed_data_sources` paragraph,
  `data-source.ts`, and its duplicate `reason_sources_unavailable` and
  `limitation_after_source_failure` messages are removed: #78's failed-source list
  with causes is the single display, and #78's wording is kept. #79's `origin_isbn` is
  kept. Each language has 211 messages.

Book sources under #78's failure rules:

- **Retries.** Every catalog call goes through the shared request: at most one retry,
  and a Retry-After of at most 2 s is honoured. A longer Retry-After (#79's synthetic
  Google Books 429 with `retry-after: 3`) is `rate-budget`.
- **What makes a source unavailable.** Only `timeout` and `rate-budget` make a catalog
  unavailable for the rest of the Reference. Later operations are
  `unavailable`/`after-source-failure`. An `http-error` or `request-unavailable`
  affects only that call, so the catalog's later lookups and searches still run. Under
  #79, any unavailable call stopped the source.
- **Data findings.** `identifier-mismatch`, `invalid-metadata` and `response-size`
  block Not found but are never failed sources. Under #79, an all-invalid book run
  could be `sources-unavailable`; it is now `insufficient-search` with no failed
  sources.
- **Outages.** A total outage of every contacted book source is Not verifiable
  (`sources-unavailable`), through #78's contacted/applicable check.
- **Negative coverage.** #79's stricter rule stays route-specific: Not found for a
  book needs all four book sources enabled and complete. Articles still need OpenAlex
  and Crossref.
- **Permit wait.** The catalog permit wait is bounded by `maxWaitMs` (10 s). #79
  waited up to the Reference deadline.

Tests after the #79 merge:

- **Total outage (`books.test.ts`).** Every book endpoint, including Open Library
  search, returns 503. The test expects all 14 operations (two ISBN lookups and twelve
  searches) to be `unavailable`/`http-error` with two attempts each. #79 expected four
  attempts and `skipped` notes. The run takes about 20 s, so this test's timeout is
  45 s and the shared SSE wait is 40 s.
- **Single catalog outage.** The Open Library ISBN 503 is a per-call `http-error` with
  two attempts, and the Open Library combined search still runs. #79 expected a
  `skipped`/`after-source-failure` note. The verdict is still Not verifiable, with
  `openlibrary` as the failed source.
- **Catalog rate.** The rate-change test changes `sources.openlibrary.intervalMs`
  through `SOURCE_TASTER_SEARCH_SETTINGS`. It checks `settings.openlibrary.intervalMs`
  and a new Search strategy version. Two startup cases show that each old rate
  variable exits with 78.
- **Version expectation.** `bibliographic.test.ts` expects `article-search-78-4-`.

All other #79 tests pass unchanged. This includes the Google Books 429 test, which
already matched #78's Retry-After rule.

Versions after the merge:

- **Article search, `article-search-78-3-…` → `article-search-78-4-…`.** The merged
  coordinator filters sources by route. A malformed identifier that normalizes to
  nothing is now unsupported instead of looked up (from #79). The settings hash also
  covers the catalog settings.
- **`article-verdict-78-2`, unchanged.** No article verdict rule changed. The
  book-only rules (field agreement, `identityAmbiguous`, book-type compatibility)
  never apply to articles.
- **Book search, `book-search-79-3-<sources>-<rates>-…` →
  `book-search-79-4-<sources>-settings-<hash>-…`.** The book route now uses #78's
  request, retry and budget behaviour, and its settings hash replaces the two rates.
- **Book verdict, `book-verdict-79-2-isbn-edition` →
  `book-verdict-79-3-isbn-edition`.** Book outcomes under failure changed: per-call
  HTTP errors, no `sources-unavailable` for data findings, and a bounded permit wait.

Open points:

- **Google Books cap.** Google Books has no ADR-0007 cap; 1000 ms stays a development
  value until a provider allowance is known.
- **Fixtures.** The Google Books and Open Library fixtures stay synthetic
  (`docs/research/google-books-fixture-rights.md`), like Semantic Scholar's.
- **Earlier Candidate ceiling.** #78's ceiling of 10 was already below its own article
  route's 20 search slots. The merged ceiling of 25 fixes this.

### Completed merged-head verification (2026-10-30)

The continuation verified merge head `d95371c` without further implementation changes.
The controlled Pagefind/website preview build is present, so the full server suite
includes `website.test.ts` rather than excluding it.

- `pnpm typecheck`: all 20 Turbo tasks passed.
- `pnpm lint`: all 20 Turbo tasks and the repository-wide Prettier check passed.
- `pnpm i18n:check`: 211 messages validated in DE and EN.
- `pnpm --filter @source-taster/contract-verification build`, followed by
  `git diff --exit-code -- packages/contract-verification/dist
  packages/contract-verification/openapi-v2.json`: passed, no artifact drift.
- `pnpm --filter @source-taster/server test`: **19 files, 363 tests passed** against a
  fresh, dedicated PostgreSQL 18 container (614.71 s). This includes article adapters,
  batching, Owner fairness, book catalogs, bibliographic comparison, Check lifecycle
  and website mounting.
- `pnpm --filter @source-taster/web exec playwright test --config
  bibliographic.playwright.config.ts`: **20 tests passed** (2.5 min), including
  failed-source explanations in EN/DE, retraction notices, source links, Candidate
  ordering and axe checks.

The test commands used both `DATABASE_ADMIN_URL` and `DATABASE_TEST_URL` for the
isolated container; the global test API and browser API/web ports were overridden to
avoid other worktrees. Both the earlier merge container and the continuation's test
container were removed after verification.

Private-peer `test:authority` was not run locally. GitHub CI is a separate check of
the published PR head. The remaining Semantic Scholar licensing and journal-name
projection work is tracked in #136 and #137.
