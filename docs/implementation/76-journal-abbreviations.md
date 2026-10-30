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
- Twelve journal HTTP/SSE cases pass. They also cover unscored renormalization,
  proven deviation, all received Crossref aliases, repeated full titles, shared
  abbreviations, acronyms, diacritics, qualifiers and unchanged full-title OSA.
- The existing 76-case comparison file passes, including an isolated rerun after
  the final review corrections.
- Four focused Chromium cases pass in DE/EN, including axe and the exact NLM
  attribution, date and non-current-data notice.
- Complete typechecking, workspace ESLint, formatting and DE/EN catalog checks pass.
- Full browser suites pass: 92 website, 52 web workspace and 18 bibliographic
  workspace cases (162 total).
- The full server suite passes: 13 files, 267 tests, including the final 12-case
  journal file. No failed or skipped test in the completed full run.
- Local logs: `.tmp/76/test-full-final.log`, `.tmp/76/e2e-full.log`,
  `.tmp/76/comparison-verified-final.log`, `.tmp/76/typecheck-complete.log`,
  `.tmp/76/lint-complete.log`, `.tmp/76/format-complete.log`,
  `.tmp/76/i18n-complete.log`.

One attempt to run top-level test/typecheck/lint commands concurrently caused
colliding website/Pagefind build outputs (`EEXIST`); those commands share build
side effects. Build-producing commands were then run sequentially. The full
server test-only command reuses those built dependencies (`pnpm test --only`).
One overlapping focused comparison run also refused its already occupied test
port; its isolated final rerun uses an explicit independent port.

## Standards

Independent review of `git diff 0dfc5dd...14ebe65`: no actionable Standards
findings. The reviewer inspected documented standards, source, generated v2
artifacts, tests and the 38,097-row snapshot structure. v1 is unchanged; tests
use the approved public HTTP/SSE and browser seams. No substantive baseline
smell finding.

## Spec

Independent review found two incorrectly implemented requirements in the initial
commit, with no substantive scope creep:

1. **Ambiguous journals could produce a false deviation.** ADR-0018: “Not
   determinable: every other case.” `Biol Med` against `Biologie medicale` can
   denote either of two catalog journals and must not become a zero score merely
   because another journal also attests `Biol Med`. **Fixed:** unresolved multiple
   Candidate-journal identities cannot establish a differing abbreviation. The
   concrete HTTP/SSE counterexample failed before the fix and passes afterward.
2. **A shared ISSN could override an identifying full title.** ADR-0018 permits
   journal identification “by ISSN, NLM ID or full title.” Two historical journals
   share `0065-258X`; the title `Advances in enzymology and related areas of
   molecular biology` identifies NLM `0337243`. **Fixed:** intersect an ambiguous
   identifier set with available exact title evidence. A uniquely identified
   journal remains authoritative. The counterexample failed before the fix and
   passes afterward with full journal agreement.

A further regression covers provider entity/markup cleanup exactly once in the
omitted-qualifier path; already prepared qualifier/base text no longer passes
through the cleanup stage again.

Review summary: Standards 0 findings; Spec 2 findings, both corrected and verified
through the public API. No outstanding review finding.
