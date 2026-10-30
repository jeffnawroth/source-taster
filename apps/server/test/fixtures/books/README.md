# Synthetic book Data source fixtures

Every JSON file in this directory is an independently authored synthetic protocol
witness. Titles, names, publishers and source-record IDs are invented; ISBN values
exercise checksum/ISBN-10-to-13 behavior and do not claim a real publication.
They are not sanitized, relabelled or recorded provider responses.

- `synthetic-openlibrary-isbn.json`: an edition carrying equivalent ISBN-10 and
  ISBN-13 identity, with invented bibliographic metadata.
- `synthetic-openlibrary-search.json`: one invented work spanning multiple
  publication years, so aggregate work identity cannot silently settle edition
  identity.
- `synthetic-googlebooks-rate-limit.json`: a minimal invented HTTP 429 body.
  The actual retry/cooldown behavior is supplied through the fixture HTTP status
  and `Retry-After` header, not real quota or consumer/project identifiers.

The other Google Books success, chapter, ambiguity, Candidate allocation and
failure witnesses in `books.test.ts` are synthetic too. This project-authored data
follows the repository's AGPL-3.0-or-later license. No provider content license or
successful live qualification is implied. Tests never call live Data sources.

## Recorded fixture qualification

ADR-0006 requires Open Library and Google Books response recordings to remain
private and unpublished. ADR-0007 separately requires source-specific storage
rights. Successful rights-cleared recordings for both adapters remain an
unfulfilled acceptance criterion of #79; synthetic tests do not replace it.

See the [rights investigation](../../../../../docs/research/google-books-fixture-rights.md).
A Google API key or quota increase is not evidence of permanent-storage rights.
A suitable rights basis must exist before acquiring a response for durable
retention. No caching is implemented here.

Earlier unmerged PR commits contained real Open Library responses and a Google
quota-error body. Those files have been removed from the current tree; that does
not erase existing Git objects, published commit URLs or downstream copies.
A squash merge would keep those earlier commits out of Main ancestry, but is not
represented as a purge of the hosting service's retained history. Their earlier
publication remains part of the documented rights review.
