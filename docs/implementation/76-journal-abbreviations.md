# #76: attested journal abbreviations

## Scope and parallel work

Implements [#76](https://github.com/jeffnawroth/source-taster/issues/76), the first
unassigned, unblocked child of #70 in map order. Base: `0dfc5dd` on `main`.
The user confirmed that base for the final Standards/Spec review.

#78 / PR #131 owns the remaining article adapters and search failure handling.
This slice changes journal comparison without requiring those adapters. The
shared integration changes are one optional raw-record argument at each
comparison call, the scoring version, an additive v2 field-comparison schema,
and one explanation component. No search route, source budget, source adapter,
Candidate allocation, cancellation or authority rule is changed.

## Behavior

- `packages/core/src/journal-abbreviations.ts` compares only proven abbreviations.
  A match scores 100%; a proven different-journal abbreviation scores 0%; every
  other case is excluded with weight renormalization and an explicit explanation.
- A journal match remains field agreement, never independent Source identity or
  a Mixed citation/tie rule. Full titles retain ADR-0025 OSA comparison.
- The complete NLM J_Medline snapshot of 2026-10-29 contains 38,097 journal records,
  preserving titles, NLM IDs, both received abbreviations and both ISSNs. It is
  indexed locally; there are no abbreviation-only network requests. Ambiguous
  catalog titles remain unresolved until a stable identifier proves the journal.
- Candidate records can additionally supply Crossref `short-container-title`
  arrays, Europe PMC `journalInfo.journal.medlineAbbreviation`, and Semantic
  Scholar `publicationVenue.alternate_names`. Repeated Crossref full titles are
  excluded. These are already-received fields, never new source requests. The
  latter two raw-record integrations become reachable with #78's adapters.
- Dots, whitespace, case and both declared umlaut folds are normalized. Qualifiers
  remain meaningful; omission needs exact Candidate-journal evidence. Shared
  received abbreviations do not require global uniqueness. Acronyms need the
  same attestation as every other abbreviation.
- API v2 optionally records the three-way outcome, reason and per-journal source,
  abbreviation, NLM ID and snapshot date. v1's schema/OpenAPI remain frozen.
  DE/EN shared UI explanations include the required exact NLM attribution and a
  dated warning that the snapshot may not be current. The same evidence is
  available to the later report/correction-suggestion implementations.
- Scoring version `journal-76-1` binds the snapshot source digest/date and the
  source/normalization selection. Development stays uncalibrated; release and
  activation guards are unchanged.

The existing normalization implementation moved unchanged to
`comparison-normalization.ts`, shared by full-title OSA and abbreviation checks.
The snapshot generator is an explicit offline release step, with the data source
and terms recorded in [the source register](../data-source-register.md) and
[the distribution notice](../../packages/core/src/data/NOTICE.md).

## Validation

The pre-agreed #70 seams are HTTP/create/GET/SSE with real PostgreSQL and workers,
and browser behavior through the shared workspace. No new seam or domain mocks
were introduced. Synthetic HTTP fixtures are independent protocol witnesses,
not calibration or Reference test set evidence.

- Red → green: absent NLM attestation; ISSN-only Candidate; ambiguous same-title
  catalog journals; distinct same-title journals identified by ISSN.
- Nine journal HTTP/SSE cases pass. They also cover unscored renormalization,
  proven deviation, all received Crossref aliases, repeated full titles, shared
  abbreviations, acronyms, diacritics, qualifiers and unchanged full-title OSA.
- The existing 76-case comparison file passes.
- Four focused Chromium cases pass in DE/EN, including axe and the exact NLM
  attribution, date and non-current-data notice.
- First comprehensive typecheck and focused ESLint/format checks pass.

One attempt to run top-level test/typecheck/lint commands concurrently caused
colliding website/Pagefind build outputs (`EEXIST`); those commands share build
side effects. Final comprehensive commands are run sequentially.
