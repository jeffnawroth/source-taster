# #210 — Public DE/EN voice

Implemented from issue #210 (no comments), accepted ADR-0027, the voice guide,
styleguide and reconciliations. Before editing, the clean isolated worktree's
HEAD exactly matched `implement/design-remaining` at
`f60d8a9a264429196849bbfb3cb4ced4f1187764`; ancestry was verified.

German uses Sie, Befund, Prüfung, Kontingent and Prüfpaket, with neutral author
controls. English prose and actions use sentence case. Errors lead with an
available next step. Completed-search explanations retain the enabled-data-source
scope and the nonexistence caveat. The PDF overview now includes the existing
human-decision explanation. Manual and system findings remain distinguishable.

Re-check copy distinguishes already debited slots from previously unbilled slots:
no second debit for the former, first debit on a verdict for the latter, none for
technical statuses. Restarting from history is separate new work. No server
billing, entitlement, API identifier or verification policy changed.

The FAQ and DOI guide now agree about explicit opt-in, doi.org/Crossref,
uncalibrated rules and the absence of release qualification. The claims ledger
points to public runtime/configuration and #74/#94 evidence; publication approval
remains unset. Local Pagefind still indexes only public documentation.

## Red → green evidence

Tests use the agreed seams: public catalogs, real web/native-panel journeys over
existing APIs, the built site with actual local Pagefind, generated PDFs and
packaged-extension output. Expected labels/rules come from the accepted guide;
there are no source-string snapshots or internal collaborator mocks.

| Seam | Observed red | Green result |
| --- | --- | --- |
| DE/EN catalogs | Informal German/old terminology and capitalized English nouns; missing completed-search caveat | 5 catalog tests pass; exact six verdicts and four statuses preserved |
| Workspace | Both languages still showed the blanket same-slot-free promise | Billed-slot explanation passes in revision journeys; unchecked-slot journeys explain the first debit and technical statuses |
| Site | FAQ lacked the DOI facts; failed search put the next step last | 93 Chromium site tests pass, including actual DE/EN Pagefind queries, same-language links, search failures, privacy, reflow/accessibility and hash-bound source downloads |
| PDF | Generated overview omitted the human-decision explanation | 11 generated-output/structure checks and 8 real HTTP/download tests pass; manual/system findings and technical statuses remain distinct |
| Packaged extension | Manifest description used title-case “Check” in prose | 21 extension package/preference tests pass for Chromium/Firefox packages |

Targeted browser regressions: the initial 31-case web run passed 29; one remaining
assertion still expected capitalized “Re-check” and a concurrent run exhausted
PostgreSQL connections. After correcting that literal and stopping only this
worktree's orphaned test processes, a serial 10-case rerun passed, covering both
failures and the new billing assertions. No timeout or behavioral assertion was
weakened. Four DE/EN native-panel revision/manual-finding journeys pass. Two web
and two native-panel report-download journeys also pass with independent PDF
inspection and storage/accessibility assertions.

`pnpm i18n:check` passes: 541 messages per catalog, 10 paired information pages,
4 paired legal documents and the source-access/UI copy. A separate comparison
against the starting commit confirms every original key and placeholder
multiplicity survives. Versioned legal files and fixed statutory action wording
are unchanged. Locale/Intl code, legal versions, amounts and deadlines were not
rewritten. Targeted terminology searches found no remaining old terminology in
current reader-facing catalogs/site content; domain identifiers, test names and
immutable historical evidence remain outside that editorial search.

`pnpm typecheck` and the final `pnpm -r typecheck` pass. ESLint on changed public
code/tests, Prettier on changed files and `git diff --check` pass. The controlled
Pagefind fetch/build/verify and final website build pass against this worktree's
current recipe; cached public build inputs were copied and then rebuilt, with no
qualification guard bypass.

## Limits and integration

External providers use recorded boundary fixtures; these tests do not qualify
live provider access, translation quality, human screen-reader behavior,
Safari/Firefox journeys, PDF/UA conformance or publication. The separate
extractor-dependent upload suites and private-service regressions were not run.
No private repository or predecessor was read. No PR, push or issue closure is
part of this handoff.

The current integration tip is merged into the implementation branch before
handoff; the parent owns integration and PR management.

## Integration follow-up — 11 November 2026

The first #220 CI run exposed six remaining old text expectations in AI upgrade,
empty Structuring, Best match and rate-limit assertions. They now follow the
accepted sentence-case/action-first copy without removing the original outcome,
candidate identity or continuation-time assertions. The bibliography journey
also waits for the actual document-structuring response and checks success before
checking highlighted regions, keeping cold extractor startup outside the DOM
assertion's wait while retaining the original test deadline.

After rebuilding local generated catalogs, all nine targeted AI/Structuring
browser cases, all three real DOCX bibliography-selection cases, four Web/native
panel rate-limit cases, one native AI fallback case and the full English
synthetic-witness panel/Web parity journey pass. The five catalog tests, changed
file ESLint/format checks and `git diff --check` pass. The DOCX tests require the
existing isolated extractor image; a run without that prerequisite correctly
returned HTTP 503 and is not counted as passing evidence.

The subsequent full Linux bibliographic suite reached four further assertions
still expecting capitalized English nouns (different Sources, unambiguous
Source, Best match by Score, No Best match). Those literals now match the
accepted prose. All four targeted real-API Chromium journeys pass, retaining
their original Candidate-order, Score, missing/ambiguous evidence and field
preservation assertions. No product behavior or timeout was changed.
