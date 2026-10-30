# Book Data source fixtures

Recorded on 2026-10-30 without credentials or user content:

- `openlibrary-9780131103627.json`: HTTP 200 from
  `https://openlibrary.org/api/books?bibkeys=ISBN:9780131103627&format=json&jscmd=data`.
  Bibliographic fields are preserved; subjects, excerpts, covers and other unused
  fields are omitted. The edition carries the equivalent ISBN-10 `0131103628`.
- `openlibrary-search.json`: HTTP 200 from
  `https://openlibrary.org/search.json?title=The%20C%20Programming%20Language&author=Kernighan&limit=5&fields=key,title,author_name,publish_year`.
- `googlebooks-rate-limit.json`: HTTP 429 from
  `https://www.googleapis.com/books/v1/volumes?q=isbn%3A9780131103627&maxResults=5`.
  The public API reported an exhausted daily quota. No key, address rotation or
  retry around that limit was used. A successful live Google Books recording
  remains outstanding.

Google Books success payloads, chapter records, ambiguity, Candidate allocation,
and other failure cases in `books.test.ts` are explicitly synthetic protocol
witnesses. None is a quality measurement or provider-rights clearance.

Adapters use Open Library's documented Books/Search APIs and Google Books'
Volumes list API. Source terms and paid-service, fixture-storage and cache rights
still belong to the source qualification in ADR-0007/Q04. Tests never call a live
Data source. No cache is added.

## Rights and repository-policy status

These provenance notes do not establish permission to retain or publish a
response. See the [Google Books fixture-rights investigation](../../../../../docs/research/google-books-fixture-rights.md).
ADR-0006 requires Open Library and Google Books responses to be stored privately
and never published. The current public Open Library recordings and Google 429
body need a documented resolution before merge; their presence is not a precedent
for further publication. Google success recordings additionally need a durable
storage basis before acquisition for retention, and an API key/quota increase
alone does not supply it. No fixture exception or rights clearance is claimed.
