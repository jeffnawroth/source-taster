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

The latest local integration tip `b61f50590f1d532f688212c696879afab887a25f` was merged into this implementation branch. Conflicts were limited to `apps/web/src/main.tsx`, additive catalog keys and the shared generated-file formatting ignore. #85's Preferences behavior and tests were retained; `structuring-results.tsx` and core rules remain independent of locale selection. The Structuring browser tests now select the language control by its accessible name alongside the citation-style control.

## Validation record (2026-10-26)

Executed locally on Node 24.14.0 with real PostgreSQL 18 and Chromium:

- `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm i18n:check`: passed after the integration merge (66 DE/EN messages).
- `pnpm test`: 28 HTTP/SSE tests passed, including 14 Structuring tests and all existing skeleton contracts.
- `pnpm test:e2e`: 12 browser tests passed after the merge, including #85 Preferences and DE/EN Structuring axe checks.
- `pnpm audit:licenses`: 388 installed package licenses reviewed, 67 runtime packages.
- `pnpm audit --audit-level critical`: no known vulnerabilities. No new external dependency was added. The offline OSV release audit was not repeated in this ticket.
- `git diff --exit-code -- packages/contract-common/dist packages/contract-verification/dist packages/contract-verification/openapi.json`: passed after rebuilding; new transport JS and declarations are tracked.

One initial post-merge HTTP run received `ECONNREFUSED` from the test process on port 3101; a clean full-suite rerun passed. Its cause was not established. Test helpers remain unchanged and own random database/role names. Existing containers and ports 8000/4567 were not modified. No implementation was merged into the integration branch and no PR was created.
