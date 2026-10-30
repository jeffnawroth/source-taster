# #79 independent review and corrections

Two read-only agents reviewed `06b32d2...cf2f9f3` independently. The first reviewed
repository standards and the smell baseline; the second reviewed issue #79 and
its governing specification/ADRs. The author addressed the findings below.
No fresh delegate review is claimed for the corrections.

## Standards

1. **P2 — ISBN bypasses carried-identifier reuse.** ADR-0024 says, “Do not look up
   an identifier already carried by an evaluated Candidate.” The initial code
   excluded ISBN from that reuse path, causing unnecessary catalog requests.
   **Corrected:** the common path compares canonical ISBN-13 values. An API test
   supplies an ISBN already carried by contradictory DOI metadata and verifies
   that no catalog ISBN request follows.
2. **P2 — Shared Crossref projection changes existing Verdicts without new
   versions.** New ISBN metadata could affect `/v1` and article Verdicts while
   their versions stayed unchanged, contrary to ADR-0008's versioning rule.
   **Corrected:** composition enables extended metadata only for `/v2` book
   routes. API witnesses keep `/v1` books and `/v2` articles on their old
   projection and Verdict behavior. Book rules and Search strategy have their
   own new versions.
3. **Possible Duplicated Code:** catalog display-name projection repeated the
   existing OpenAlex logic. **Corrected:** all three adapters use the explicitly
   named `projectDisplayName` helper; its existing last-token-family behavior is
   unchanged.
4. **Possible Repeated Switches / Duplicated Code:** the book-type list was
   repeated in route classification. **Corrected:** one `isBookReference`
   classification drives composition and the coordinator.

Standards total: two documented breaches and two heuristic findings, all
addressed. The most consequential breach was the unversioned change to existing
routes; the new API compatibility witnesses cover it.

## Spec

1. **Partial — Google Books successful responses are synthetic.** #79 asks for
   adapters with recorded fixtures. The live response recorded from Google Books
   is HTTP 429 because its public daily quota was exhausted. Open Library has
   successful live ISBN and search recordings; Google success cases are marked
   synthetic. **Outstanding:** obtain a successful Google Books recording under
   an authorized allowance. The current recording is not represented as one.
2. **P2 — Open Library work records erase edition ambiguity.** ADR-0008 says,
   “Unresolved identifier/edition identity yields Not verifiable.” The first
   recorded work spans 23 publication years and previously became Correct after
   its dates were dropped. **Corrected:** aggregate work Candidates retain
   `identityAmbiguous` when several publication years or a requested edition
   remain unresolved; search continues and the Verdict stays Not verifiable
   absent other identity evidence. The recorded-search API witness now checks
   that behavior rather than premature success.
3. **P2 — Confirmed edition deviations disappear.** FA-ABG-11 requires
   explanations naming deviating or missing fields with both values. Received
   edition metadata was absent from the comparison and Verdict.
   **Corrected:** book Candidates include unweighted edition, publisher and
   publisher-place comparisons, with optional agreement and both raw values.
   A known edition difference yields Exists, with deviations without changing
   the weighted Score; shared clients highlight it. An API witness covers this.
4. **P2 — Legitimate Crossref book types are rejected.** #79 requires the book
   route through Crossref, but `reference-book` stayed incompatible with CSL
   `book`. **Corrected:** supported Crossref book and section variants map to
   canonical book/chapter CSL types. API witnesses cover `reference-book` and
   `book-section`; received article types still cannot identify a book.

Spec total: four findings; three implementation defects addressed, one
successful-live-recording gap remains. No unrequested scope was found. The
outstanding item is the Google Books fixture qualification above.

## Post-review rights finding

The subsequent [Google Books rights investigation](../research/google-books-fixture-rights.md)
adds a separate merge blocker to the recorded-success gap: no suitable fixture
storage/redistribution basis has been established, and ADR-0006 requires Open
Library and Google Books responses to remain private and unpublished. This also
requires resolving the existing public Open Library recordings and Google 429
body. The earlier recommendation to obtain an authorized Google recording must
be read as requiring both authorized access and an appropriate storage basis;
quota alone is insufficient. Public publication would additionally require an
explicit ADR decision and redistribution rights. No code, fixtures or ADRs are
changed by this clarification.
