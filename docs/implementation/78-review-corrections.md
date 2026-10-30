# #78 review corrections

The review of the #78 implementation (`9f91718`) found ten defects and smells
in source failure handling, operating settings, ADR-0007 batching and adapter
structure. The response is implemented as a sub-agent on
`fix/78-review-corrections`, based on `9f91718`, in the T3-bound worktree
`/Users/jeffnawroth/.t3/worktrees/source-taster/t3-a1c2ff1a`. No issue, PR or
integration branch was changed, and the predecessor repository was not used.

## HTTP errors are per call

ADR-0007 retries an HTTP error or an unreachable source at most once per call.
It does not abandon the Data source. Only a timeout (`timeout`) or a permit wait
beyond its bound (`rate-budget`) now makes a source unavailable for the rest of
the Reference, with later operations recorded as `after-source-failure`. Those
two reasons are what consume the Reference deadline once per search kind. The
versioned `failureHandling` value states exactly this rule:
`continue-and-name-transport-failed;http-error-per-call;timeout-or-rate-budget-skips-remaining-source-calls;data-findings-not-failed;all-applicable-transport-failed-not-verifiable`.

The #77 case "continues to Crossref after an OpenAlex failure…" returns to its
#77 expectation: every OpenAlex operation is attempted, and each records two
attempts.

## Failed sources are transport failures only

`failedSources` and the all-sources-failed rule now count only transport
failures: `timeout`, `rate-budget`, `http-error`, `request-unavailable`,
`deadline` and `after-source-failure` (core `TransportFailure`). A data finding
such as `identifier-mismatch`, `invalid-metadata` or `response-size` means the
source answered. It still blocks Not found (`insufficient-search`) but never
names the source as failed, and it can never produce `sources-unavailable`. The
#77 malformed-metadata case now expects `insufficient-search` with no failed
source. The web cause text is a lookup map from transport reason to message.

## Operating settings

- **Per-source request timeouts.** `requestTimeoutMs` moved from the global
  settings into each source's settings. It is patchable per source between
  100 ms and the Reference deadline, versioned like every other setting.
- **Retry bounds.** The patch now caps `maxRetries` at 1 and `retryAfterMaxMs`
  at 2000, the ADR-0007 bounds. Wider values refuse startup.
- **Deadline-bound waits.** `maxWaitMs` and `requestTimeoutMs` are bounded by
  core `referenceDeadlineMs`, as is the Version 1 permit wait. No hard-coded
  30000 remains in the server.
- **One source of truth.** `doiTracerLimits` is derived from
  `defaultSearchSettings` (doi.org and Crossref values and `maxRetries`), so the
  Version 1 record cannot drift from what Version 1 runs.
  `config.searchSettings` is always set.
- **Fairness.** The Operator-settable fairness settings are
  `activeReferencesPerCheck` (now also passed to the reference executor instead
  of a literal 10) and `workerConcurrency`. Both are in the hash. The
  one-valued `fairness` key was removed from the settings, and no second mode
  was invented. `scheduling: "owner-then-check-round-robin-3"` and
  `sourceReservation` stay recorded constants outside the hash. Each names the
  only implemented mode, which the Operator cannot change, so hashing them
  would only duplicate the version suffix. A changed mode needs a new suffix.
- **Rates.** The OpenAlex and Crossref rates stay at the slower #74/#77
  development values. The defaults' comment no longer claims they are the
  ADR-0007 initial values: they are below ADR-0007's caps, which assume
  Crossref's polite pool and OpenAlex prepaid usage. Europe PMC, Semantic Scholar,
  arXiv and doi.org use the ADR-0007 initial caps.

## Identifier batching

ADR-0007 batching is implemented in `apps/server/src/sources/batch.ts`:

- **Semantic Scholar.** It collects arXiv lookups for at most 200 ms
  (`batchWindowMs`). It then sends one `POST /graph/v1/paper/batch` with at most
  500 identifiers (`batchSize`). The API's 500-identifier bound and its
  input-ordered response with `null` for unknown identifiers come from the
  official Graph API description.
- **arXiv.** It collects lookups across Checks until its next three-second permit
  and sends one `id_list` request, with `max_results` set to the batch size. The
  default bound is 100 identifiers, against the API's 2000 results per request.
- **Batch settings.** `batchSize` and `batchWindowMs` are versioned Operator
  settings. They are accepted only for these two sources: Semantic Scholar
  1–500 and 0–200 ms, arXiv 1–2000 and 0–3000 ms.
- **Demultiplexing.** Each run reads only its own record (by response position or
  Atom entry id). A batch carries only identifiers for the responsible source.
  Its raw evidence is the run's own record, never the batch response, so a
  result discloses no other Owner's or Check's identifiers.
- **Malformed identifiers.** arXiv answers a whole request with an error for one
  malformed identifier, so only syntactically valid version-free identifiers
  are batched. The new scheme starts at 0704. Others use the single request,
  and an arXiv error feed for a batched identifier is unreadable rather than
  no-record.
- **Carrier.** One live member, the one with the latest deadline, carries the
  request with its own permit, retry and Owner guard. Every member leaves on its
  own cancellation or deadline, and a member that has left is not sent. If the
  carrier is cancelled, the others join a new batch. If the carrier's permit
  wait or deadline ends before the send, only the carrier records that outcome.
- **Scope.** Batching is per worker process. The PostgreSQL budget remains
  global, and cross-process batching is recorded as unimplemented
  (`cross-process-identifier-batching`). The configuration records
  `identifierBatching:
  process-local;semanticscholar-window-then-permit;arxiv-until-permit;entry-demultiplexed-1`.

Known limits:

- **Shared outcome.** Once the request is in flight, its outcome is shared. If
  the carrier's deadline passes during the send, the members that were sent
  also record `deadline`.
- **Owner guard.** Only the carrier's Owner guard authorizes the send. Other
  members are excluded only through their own abort signals, which follow
  authority with the existing probe lag of up to 100 ms. `test:authority` was
  not run (private peer service).
- **Response size.** `maxResponseBytes` stays 5 MiB per request, below Semantic
  Scholar's 10 MB. A batch response above it is `response-size` for every
  member that was sent.
- **Version 1 permit wait.** A permit wait that ends at the Reference deadline
  still reports `rate-budget`, as Version 1 is frozen.

## Adapter structure

- Response handling shared by all article adapters lives in `sources/shared.ts`.
  It covers the completed/unreadable distinction, identifier mismatch, empty
  results, search pages and identifier lookups, and owns the `SourceRequest`
  type.
- One query sanitizer (`queryTerms`), one last-token name split (`displayName`)
  and one issued-year helper (core `issuedYear`) replace the per-adapter copies.
- `RecordSource` is renamed `CandidateDataSource` (GLOSSARY: Data source). The
  coordinator's per-source `state.limited` is renamed `exhausted`, after what
  it now means. The DOI tracer's
  `timeoutReason` is typed as a `TransportFailure`.

## Versions

The Search strategy prefix is `article-search-78-2-…` and the Article Verdict
rules suffix is `article-verdict-78-2`. Old immutable results keep their
versions. Version 2 `dist` changed only for the `CandidateDataSource` rename,
which has the same schema. Version 1 artifacts are unchanged.

## Tests

All server tests use real PostgreSQL and the public `/v2` HTTP/SSE API with
loopback provider fixtures, plus unit tests of the batcher in `batch.test.ts`.

- **Failure rules.** HTTP error per call, transport-only failed sources, and the
  per-source timeout, retry-bound and deadline-bound refusal cases in
  `article-sources.test.ts`.
- **Batching, server.** The Semantic Scholar tests now expect the `POST` batch
  body. A new public test holds the arXiv permit with a primer request and runs
  two Checks. It shows one `id_list` request with both identifiers, and that
  each outcome contains only its own Candidate and no foreign identifier. It
  was RED with `batchSize: 1`.
- **Batching, unit.** `batch.test.ts` covers the window, the size bound,
  collection until the permit, deadline and cancellation independence, and the
  unsent-carrier case. It also covers which arXiv identifiers are batched.
- **Fixture.** The test fixture now ignores `GET /`. An editor port detector sends
  it to newly opened loopback ports, which made exact request counts flaky. No
  adapter requests the root.

Process note: the review asked for the `tdd` skill. It was used for the last
batcher correction (unsent carrier, arXiv 0701–0703): both tests were RED first.
The earlier corrections were each checked RED then GREEN by hand against the
public seams already established for #77/#78. Seams were not separately
re-confirmed, because the sub-agent had no channel to the user.

## Deviations and open questions

- **Semantic Scholar fixtures stay synthetic.** Criterion 1 asks for recorded
  fixtures. The licence for storing a Semantic Scholar payload is unresolved, so
  this remains an open deviation for the parent.
- **Batching is per process** (see above).

## Validation

Node 24, macOS arm64, with an owned PostgreSQL container
`st78-review-pg-20261029` on loopback 55678. `origin/spec/70-78-article-sources`
had no commits beyond the base `9f91718`, so no merge was needed.

- **Server `vitest run`.** 269 passed, 2 skipped, in 14 of 15 files.
  `website.test.ts` fails because `apps/website/dist-preview` is missing; it
  needs the controlled Pagefind website build, which is unavailable here.
- **Browser, bibliographic config.** 20/20 passed, including the failed-source
  case in English and German with axe.
- **Browser, main config.** 47 passed, 1 failed: `information.spec.ts`.
  Both browser runs used a minimal, git-ignored `apps/website/dist-preview`
  stub (an index page and an empty preview manifest), removed afterwards; the
  information page needs the real website artifact.
- **Static checks.** `eslint scripts`, and `lint` and `typecheck` in every
  package except the website, pass. `prettier --check .` passes.
  `pnpm i18n:check` validated 190 messages in DE and EN. The root `pnpm lint`
  and turbo `typecheck` stop at the website build (Pagefind).
- **Build.** Rebuilding core and contract-verification reproduces the committed
  `dist` and `openapi` artifacts.
- **Not run.** `test:authority` needs the private peer service.

## Merge with main

`origin/main` at `3855cc6` (#73 parser, #76 journal abbreviations) was merged
on `merge/78-main`. Both sides' behavior is kept; the conflicts were additive
(imports, exports, messages, `.prettierignore`). The v2 Candidate combines #78's
`csl`, `source` and `origin` with #76's `fields` (`FieldComparisonV2`); `dist`
and `openapi-v2.json` were regenerated.

No version identifier was changed on both sides, so none was given a new value:
the Search strategy (`article-search-78-2-…`) and `article-verdict-78-2` come
from #78, the comparison rules (`…-journal-76-1-…`) from #76, and parser
provenance `citation-styles/2` from #73. `journal-76-1` already binds the
Europe PMC and Semantic Scholar attestation selection.

Europe PMC records now reach #76's journal attestation through their raw record.
Semantic Scholar `publicationVenue.alternate_names` stays unreachable: the
adapter does not request `publicationVenue`. Adding it changes #78's request
URLs and batch body, so it is left as an open follow-up.

## Batching review corrections

A narrow review of the identifier batching (`ff6b6e3`, `d07e976`) found three
defects and a nit. The fixes are on `fix/78-batching`, based on `d4961b3`. They
uphold the #78 invariant: a Data source failure or an unreliable response is
`unavailable`, never `no-record`.

- **Carrier at send.** In arXiv's until-permit mode, the first member carried
  the batch. A later member with a longer deadline inherited the first member's
  short request timeout and lost its retry, so it recorded `timeout`. Now, if a
  member joins an unsent batch with a later deadline, it takes the send over.
  - The old carrier's permit wait ends through a handover signal
    (`SourceBudget.acquire` gained an optional `handover`). The handover is
    honoured only before dispatch, so no rate slot is consumed for nothing.
  - Every live member, the old carrier included, joins a new batch. The member
    with the latest deadline carries it with its own deadline, signal, permit,
    retry and Owner guard.
  - A handover that races into a dispatch already under way is ignored: that
    send goes ahead as the shared outcome.
  - The carrier is now the last member to leave, which supersedes the "Shared
    outcome" limit above: members that were sent can record `deadline` only at
    the carrier's deadline, the latest among them.
  - Tests in `batch.test.ts`: "gives the request the latest deadline among the
    members at send" (RED: `timeout`) and "sends a burst of later members once"
    (guards against repeated sends).
- **Record form only.** `batchableArxiv` accepted old-scheme identifiers with
  any archive letters, in any case, and with any YYMM. Old-scheme identifiers
  are now batched only with a known archive in lower case and a YYMM from 9108
  to 0703. A subject-class form (`math.GT/0309136`) is not batched.
  - Recorded on 2026-10-30, `export.arxiv.org` answers `foo/9913001` with HTTP
    400 and an error entry. It omits `math.GT/0309136` and `HEP-TH/9901001`
    without an error, although `math/0309136` and `hep-th/9901001` exist.
    Out-of-range dates (`math/9913001`, `hep-th/0801001`) are also omitted,
    with HTTP 200. All 34 archives on the list were accepted.
  - The response lists entries in a different order from the request. Entries
    are matched to identifiers by normalized entry id, never by position.
  - The predicate is shared with Semantic Scholar, so subject-class,
    upper-case and out-of-range forms now use its single lookup. How Semantic
    Scholar answers those forms is unverified: nothing was recorded, because of
    its licence.
  - Test: the `batches arXiv identifier` table in `batch.test.ts`.
- **Complete feed.** arXiv omits an identifier without a record. Absence is
  `no-record` only when two things hold. The identifier must be in record form
  (above). The feed must be a complete answer to the identifiers sent: closed
  by `</feed>`, with `startIndex` 0, a `totalResults` equal to its entries, no
  error entry, and only requested records.
  - Otherwise a missing member is `unavailable` with `invalid-metadata`. This
    applies to truncated, partial, uncounted, empty or inconsistent feeds, and
    to the omitted subject-class and upper-case forms. A complete entry in an
    incomplete feed is still accepted.
  - Tests in the new `arxiv.test.ts`, at the adapter's `lookup` with the
    recorded feeds: "reads old-scheme records from a complete batch and their
    absence", "does not read … empty answer as no record", and "does not read
    a member missing from an incomplete feed as no record".
  - The fixtures `arxiv-oldscheme-batch.xml`, `arxiv-math.GT-0309136.xml` and
    `arxiv-HEP-TH-9901001.xml` are in the fixture README.
- **Timer.** The batch window timer is `unref()`ed. There is no public seam to
  observe this, so it has no test.

Known limit: subject-class and upper-case forms are never verified through
arXiv. Rewriting them to the record form would change identity comparison and
core normalization, so it is left open.

Versions:

- The Search strategy prefix is now `article-search-78-3-…`.
- `identifierBatching` is now
  `process-local;semanticscholar-window-then-permit;arxiv-until-permit-latest-deadline-carrier;arxiv-record-form-only;entry-demultiplexed-2`.
- `article-verdict-78-2` is unchanged, because no verdict rule changed.
- No contract artifact changed.
