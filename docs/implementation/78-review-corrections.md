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
