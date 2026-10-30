# #79 — Book and chapter verification

Issue: <https://github.com/jeffnawroth/source-taster/issues/79>, part of #70.
Ticket-selection base: `3855cc6`. The branch was rebased onto `06b32d2` after
PR #133 merged; that fixed Main commit is the review base. #78/PR #131 remains
separate work and is not incorporated.

## Behavior

The existing `/v2` coordinator routes book and chapter CSL types through the
book route of ADR-0007. Mandatory doi.org resolution and OpenAlex/Crossref DOI
metadata precede ISBN lookup (Open Library → Google Books). Bibliographic queries
then follow OpenAlex → Crossref → Open Library → Google Books. Sources are
scored before advancing, and an unambiguous identity stops retrieval.

Both catalog adapters validate provider records, retain raw bibliographic
values and expose provider-qualified record IDs. ISBN-10 and ISBN-13 are
checksum-validated and compared as canonical ISBN-13. Several exact ISBN hits
contribute only their first unique record; the others are logged as identifier
ambiguity and cannot supply automatic identity. A containing book is not proof
of a chapter. Known incompatible publication types cannot establish book
identity. Different edition ISBNs are not merged through title/author similarity.

All four sources reuse the existing five-Candidate allocator, DOI precedence,
comparison profile, immutable snapshots, guarded dispatch and replayable SSE.
ISBN Candidates consume the same slots as bibliographic Candidates. Confirmed
ISBN and edition differences affect the Verdict without changing weighted Scores; `/v2`
adds optional unweighted-field `agreement` for the shared clients' field-level
explanation and highlighting. Original and Candidate values stay intact.

A failed book Data source stops further requests to that source for this run;
remaining sources continue. Timeouts, malformed metadata and rate-budget loss
are unavailable evidence, never negative evidence. All enabled responsible
sources failing yields Not verifiable (`sources-unavailable`), naming each.
One failed or disabled mandatory source prevents a complete negative search.
Disabled catalogs are separately recorded and are not reported as failed.

## Configuration and compatibility

Enable the development profile and sources in both server processes:

```text
SOURCE_TASTER_DOI_PREVIEW=uncalibrated
SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW=uncalibrated
SOURCE_TASTER_OPENALEX_ENABLED=true
SOURCE_TASTER_OPENLIBRARY_ENABLED=true
SOURCE_TASTER_GOOGLEBOOKS_ENABLED=true
```

Optional positive `SOURCE_TASTER_OPENLIBRARY_REQUESTS_PER_SECOND` (initially 3)
and `SOURCE_TASTER_GOOGLEBOOKS_REQUESTS_PER_SECOND` (initially 1, conservative
local-development cap pending provider allowance) control PostgreSQL-backed
budgets shared across workers. Enablement and rates are recorded in the Search
strategy version/configuration. Existing request/body limits, retries, deadlines,
lease/cancellation and authority checks apply. Provider limits remain binding.

Version 1 stays frozen. Version 2 adds the catalog sources, ISBN origin/progress,
ambiguity evidence, unavailable-source reason and optional field agreement;
its Candidate ceiling grows from 10 to 20 (four sources × five). Generated
contract JavaScript/declarations and OpenAPI are committed. Algorithms and
adapters remain in AGPL code. No dependency or migration is added.

## Validation and qualification

The user confirmed real PostgreSQL and the public `/v2` HTTP/SSE boundary as the
test seam, and the branch's starting commit as the independent review base.
`books.test.ts` uses real web/worker processes and local external-HTTP fixtures.
The fixture README distinguishes actual Open Library recordings, the recorded
Google Books 429, and synthetic successful Google Books responses. Successful
live Google Books recording remains outstanding because its public quota was
exhausted; this is not claimed as passed source qualification.

Quality-gate calibration/activation, provider-rights approvals and live capacity
measurement remain the execution qualifications excluded by #70. Production
activation remains closed by the existing uncalibrated-profile gates.

Independent review findings and corrections are recorded in
[79-review-corrections.md](79-review-corrections.md).

### Verification receipt

- Full `pnpm test`: **300/300 passed**, 15 test files, including all **22** book
  API witnesses. The earlier full run was interrupted to apply review fixes;
  this complete run is on the corrected implementation.
- Full `pnpm typecheck`, `pnpm lint` (including Prettier) and `pnpm i18n:check`
  pass. The DE/EN catalog contains 205 paired messages.
- Server, web, Chromium extension and Firefox extension builds pass. The exact
  controlled Pagefind inputs/artifacts verify; the normal website build passes.
- Bibliographic browser suite: **18/18 passed**. In the first primary browser
  run, 54/55 passed; comparison case 7 remained Running during concurrent
  database-backed tests. It passed alone once those tests stopped, and the clean
  serial primary rerun passed **55/55**.
- Native Chromium extension suite: **5/5 passed**, including DE/EN parity, axe
  checks, Preferences persistence and Correction suggestion/export behavior.

The successful Google Books fixture gap above is retained separately from these
synthetic/offline regression results.
