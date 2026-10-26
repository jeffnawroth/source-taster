# #72: author-date Structuring

Implements the first-wave parser ticket under ADR-0011; this is not a claim that the full eleven-style parser or the release quality targets have been qualified.

## Delivered behavior

- Stateless `POST /v1/structurings`, authorized by the existing entitlement port with `structuring:create`; no Quota operation, Check, search or Verdict is created.
- Owned hand-written TypeScript rules in `packages/core` (AGPL-3.0-or-later), behind the `Structuring` port. Core has no transport, database, network or third-party dependencies. Only schemas/types/OpenAPI are dual-licensed.
- APA, Harvard, Chicago author-date and MLA layouts; articles and unambiguous book layouts, ordered authors with particles, corporate literals, explicit author truncation, date suffixes and partial/no-date markers. Uncertain fields remain absent.
- DOI/URL and labeled ISBN, ISSN, PMID, PMCID extraction. ISBN and ISSN check digits are validated; ISBN-10 normalization produces ISBN-13, while the CSL value remains as supplied. DOI normalization remains separate from the exact value. Abbreviated journal names stay abbreviated.
- Continuation lines join before rejection. Each Reference and rejected fragment retains its exact substring and absolute, half-open UTF-16 source span. Each emitted field and author component has source evidence. Parser provenance is `parser`, `author-date/1`.
- Count after Structuring: initially 1,000 recognized References, configured by `SOURCE_TASTER_REFERENCE_LIMIT`; 1,001 produces a localized error with the applicable limit and no partial result.
- DE/EN original text and field display, rejected entries in a native disclosure, and actionable no-References guidance. No Preferences behavior was added.

## Public-seam evidence

HTTP contract tests use the real web and worker entrypoints, PostgreSQL and pg-boss with the #71 helpers' unique per-run roles/databases. Assertions use only HTTP responses and public Zod schemas. The recorded APA, Harvard, Chicago and MLA development fixtures live in `apps/server/test/fixtures/structuring`; they are independent expected examples, not held-out quality-gate material. Coverage includes exact values/spans, wrapped input, CRLF/Unicode, absent/ambiguous fields, identifiers, rejected text, no-References guidance, empty input and the 1,000/1,001 boundary.

Browser tests exercise both locales with axe on recognized/rejected results and no-References guidance. The existing paste-and-watch and SSE contract tests are retained unchanged.

## Integration and qualification limits

The preview is intentionally separate from #71's line-based placeholder Check creation. Its references are not durable Reference slots; no search or Verdict is implied. Later lifecycle/search work must persist these canonical values and provenance, establish slots and connect execution. Both actions remain visible so existing skeleton behavior stays reviewable.

Full-document bibliography detection/selection, uploads, additional citation-style families, import/export, field editing/adoption, AI extraction, search and measured-configuration activation are later tickets. No held-out document gate, private Reference test set, statistical parser-quality target or performance percentile has been executed here. Unknown structures retain their original text and only independently recognizable fields; this parser does not claim universal free-text understanding.

Likely integration overlap with #85 is confined to `apps/web/src/main.tsx` and additive message keys in the two catalogs. Keep #85's Preferences ownership; `structuring-results.tsx` and core rules are independent of locale selection.
