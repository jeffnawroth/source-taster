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

Book Data sources follow the #78 source-failure rules (ADR-0007/ADR-0008), as
reconciled in the
[Merge with main (#79)](78-article-sources.md#merge-with-main-79) section of
`78-article-sources.md`. Only a timeout or a lost rate budget makes a source
unavailable for the rest of the Reference. An HTTP error or an unavailable
request affects only that call. Malformed metadata is never negative evidence
and never a failed source. All enabled responsible sources failing yields Not
verifiable (`sources-unavailable`), naming each. One failed or disabled
mandatory source prevents a complete negative search. Disabled catalogs are
separately recorded and are not reported as failed.

## Configuration and compatibility

Enable the development profile and sources in both server processes:

```text
SOURCE_TASTER_DOI_PREVIEW=uncalibrated
SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW=uncalibrated
SOURCE_TASTER_OPENALEX_ENABLED=true
SOURCE_TASTER_OPENLIBRARY_ENABLED=true
SOURCE_TASTER_GOOGLEBOOKS_ENABLED=true
```

Catalog rates, timeouts and permit waits are per-source ADR-0007 search
settings (`openlibrary`, `googlebooks` in `SOURCE_TASTER_SEARCH_SETTINGS`). Open
Library starts at 334 ms (3/s). Google Books starts at 1000 ms, a conservative
local-development cap pending a provider allowance. They control
PostgreSQL-backed budgets shared across workers. The former
`SOURCE_TASTER_{OPENLIBRARY,GOOGLEBOOKS}_REQUESTS_PER_SECOND` variables refuse
startup. Enablement and settings are recorded in the Search strategy
version/configuration. Existing request/body limits, retries, deadlines,
lease/cancellation and authority checks apply. Provider limits remain binding.

Version 1 stays frozen. Version 2 adds the catalog sources, ISBN origin/progress,
ambiguity evidence, unavailable-source reason and optional field agreement;
its Candidate ceiling grows from 10 to 20 (four sources × five); the merge with
#78 raises it to 25. Generated
contract JavaScript/declarations and OpenAPI are committed. Algorithms and
adapters remain in AGPL code. No dependency or migration is added.

## Validation and qualification

The user confirmed real PostgreSQL and the public `/v2` HTTP/SSE boundary as the
test seam, and the branch's starting commit as the independent review base.
`books.test.ts` uses real web/worker processes and local external-HTTP fixtures.
All public catalog fixtures are now independently authored synthetic protocol
witnesses, with invented bibliographic values and no real quota/project IDs. The
fixture README explicitly distinguishes these from the earlier recordings and
from the still-missing real-source qualification. The rights/publication review
below records why source recordings cannot be treated as complete acceptance
evidence. A real Google Books response additionally remains unavailable under
the observed public quota.

Quality-gate calibration/activation, provider-rights approvals and live capacity
measurement remain the execution qualifications excluded by #70. Production
activation remains closed by the existing uncalibrated-profile gates.

Independent review findings and corrections are recorded in
[Independent review and corrections](#independent-review-and-corrections) below.

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

Rights-cleared private recorded fixtures for both book catalogs remain a separate
unfulfilled acceptance criterion; the public synthetic/offline results above do
not satisfy it.

### Fixture-rights clarification after review

The [source-based rights investigation](../research/google-books-fixture-rights.md)
found no express recorded-test-fixture exception in the checked Google terms.
API allowance, durable private storage, public redistribution and permission to
charge for the application are separate questions. A successful request or API
key does not settle the latter questions. The general API terms' section 5(e)
restricts permanent copies and distribution unless content-owner permission or
applicable law permits them; the Books-specific Fees clause separately addresses
paid applications. No legal clearance is claimed.

**Merge blockers:** record a rights basis for durable source fixtures and use
storage/publication consistent with ADR-0006. That ADR says Open Library and
Google Books responses are stored privately and never published. The public
recorded files have been removed from the current tree and replaced with newly
authored synthetic witnesses. This does not erase earlier PR commits or public
host caches. A squash merge would keep those prior commits out of Main ancestry;
it is not a claim that historical copies have been purged. No history rewrite,
ADR change or provider permission is asserted. The error body had no book
content, but no express error-response exception was found.

The user confirmed that no Google agreement or reviewed legal basis is currently
available. The original #79 criterion explicitly requires adapters with recorded
fixtures; meeting it requires rights-cleared private recordings. Any alternative
implementation/qualification split must be an explicit client decision recorded
in #79, which remains the current acceptance source. Merely moving the requirement
to an unapproved follow-up does not satisfy it.

The recommended route under the existing ADR is independently authored synthetic
fixtures in the public repository and rights-cleared recordings in the prescribed
private fixture storage. Do not relabel copied recordings as synthetic, and do
not treat a normal file deletion as removal from existing Git history. If public
recordings are desired instead, an explicit ADR decision and an adequate rights
basis are required. The earlier statement that all provider approvals could wait
until launch was too broad: recording/publication rights must precede those acts.

### Public-fixture cleanup verification

After replacing the public recordings with independently authored synthetic
witnesses, `books.test.ts` passes **22/22** again through the same real-PG `/v2`
seam. Server typechecking, ESLint, Prettier and `git diff --check` pass. No
application implementation or transport contract is changed by this cleanup.
The earlier complete 300-test receipt remains the pre-cleanup full-suite record;
required CI must validate the final merge head.

## Independent review and corrections

Two read-only agents reviewed `06b32d2...cf2f9f3` independently. The first reviewed
repository standards and the smell baseline; the second reviewed issue #79 and its
governing specification/ADRs. The author addressed the findings below. No fresh
delegate review is claimed for the corrections.

### Standards

1. **P2 — ISBN bypasses carried-identifier reuse.** ADR-0024 says, “Do not look up
   an identifier already carried by an evaluated Candidate.” The initial code
   excluded ISBN from that reuse path, causing unnecessary catalog requests.
   **Corrected:** the common path compares canonical ISBN-13 values. An API test
   supplies an ISBN already carried by contradictory DOI metadata and verifies that
   no catalog ISBN request follows.
2. **P2 — Shared Crossref projection changes existing Verdicts without new
   versions.** New ISBN metadata could affect `/v1` and article Verdicts while their
   versions stayed unchanged, contrary to ADR-0008's versioning rule.
   **Corrected:** composition enables extended metadata only for `/v2` book routes.
   API witnesses keep `/v1` books and `/v2` articles on their old projection and
   Verdict behavior. Book rules and Search strategy have their own new versions.
3. **Possible Duplicated Code:** catalog display-name projection repeated the
   existing OpenAlex logic. **Corrected:** all three adapters use the explicitly
   named `projectDisplayName` helper; its existing last-token-family behavior is
   unchanged.
4. **Possible Repeated Switches / Duplicated Code:** the book-type list was repeated
   in route classification. **Corrected:** one `isBookReference` classification
   drives composition and the coordinator.

Standards total: two documented breaches and two heuristic findings, all addressed.
The most consequential breach was the unversioned change to existing routes; the new
API compatibility witnesses cover it.

### Spec

1. **Partial — Google Books successful responses are synthetic.** #79 asks for
   adapters with recorded fixtures. The live response recorded from Google Books was
   HTTP 429 because its public daily quota was exhausted. Open Library had
   successful live ISBN and search recordings; Google success cases are marked
   synthetic. **Outstanding:** obtain a successful Google Books recording under an
   authorized allowance. The recording is not represented as one.
2. **P2 — Open Library work records erase edition ambiguity.** ADR-0008 says,
   “Unresolved identifier/edition identity yields Not verifiable.” The first
   recorded work spans 23 publication years and previously became Correct after its
   dates were dropped. **Corrected:** aggregate work Candidates retain
   `identityAmbiguous` when several publication years or a requested edition remain
   unresolved; search continues and the Verdict stays Not verifiable absent other
   identity evidence. The recorded-search API witness now checks that behavior
   rather than premature success.
3. **P2 — Confirmed edition deviations disappear.** FA-ABG-11 requires explanations
   naming deviating or missing fields with both values. Received edition metadata
   was absent from the comparison and Verdict. **Corrected:** book Candidates
   include unweighted edition, publisher and publisher-place comparisons, with
   optional agreement and both raw values. A known edition difference yields Exists,
   with deviations, without changing the weighted Score; shared clients highlight
   it. An API witness covers this.
4. **P2 — Legitimate Crossref book types are rejected.** #79 requires the book route
   through Crossref, but `reference-book` stayed incompatible with CSL `book`.
   **Corrected:** supported Crossref book and section variants map to canonical
   book/chapter CSL types. API witnesses cover `reference-book` and `book-section`;
   received article types still cannot identify a book.

Spec total: four findings; three implementation defects addressed, one
successful-live-recording gap remains. No unrequested scope was found. The
outstanding item is the Google Books fixture qualification: the post-review rights
finding in [Fixture-rights clarification after review](#fixture-rights-clarification-after-review)
turns it into a merge blocker, so the earlier recommendation to obtain an authorized
Google recording requires both authorized access and an appropriate storage basis —
quota alone is insufficient. Public publication would additionally require an
explicit ADR decision and redistribution rights. The public-fixture removal and its
limits (not a purge of historical PR commits/caches; the original recorded-fixture
criterion stays unresolved; the original 22 API behaviors remain under test) are in
[Public-fixture cleanup verification](#public-fixture-cleanup-verification). The
replacements use invented titles, authors, publishers and source-record IDs with
checksum-valid ISBN protocol values, rather than relabelling the original records.
