# #73: numeric and note-style Structuring

Implements [#73](https://github.com/jeffnawroth/source-taster/issues/73), under parent [#70](https://github.com/jeffnawroth/source-taster/issues/70) and ADR-0011. The worktree began clean at integration branch `spec/70-73-parser`, commit `75dca7caf22c7396f81c1b61dec1579c74274b37`; ancestry was checked before editing.

## Delivered behavior

- Owned deterministic rules now handle IEEE, Vancouver, ACS, AMA, Springer Basic, Oxford bibliography/note input and DIN ISO 690 alongside the existing APA, Harvard, Chicago author-date and MLA layouts.
- Bracketed, parenthesized and punctuated numeric labels, superscript numbers and symbol note markers are excluded from parsed fields. Superscript/symbol markers may be attached directly to the author. Immutable original input still includes the marker; field evidence uses absolute half-open UTF-16 offsets in that input.
- Ordered initial-first, compact-initial and semicolon-separated names retain their exact components and particles. Unmarked full names remain literal. Explicit `et al.` remains truncation evidence, never a fabricated author.
- Articles retain supplied full/abbreviated containers, volume, optional issue, pages or article number, identifiers and dates. Explicit book layouts keep publisher, place and date separate. Publication dates for the added late-date layouts come from recognized bibliographic positions, not years in titles. Uncertain fields stay absent.
- Wrapped entries join before parsing, including journal continuations that resemble author-date starts. Numbered and unnumbered styles can coexist in one list without sharing fields or evidence.
- Parser provenance is `citation-styles/2`: these outcome-affecting rules need a new measured configuration. Public CSL and HTTP types, dependencies, UI and other tickets are unchanged.

## Test seam and red/green evidence

All added tests use the already agreed `POST /v1/structurings` HTTP contract, parse responses with the public `StructuringResponse` schema, and run the real web/worker processes with real PostgreSQL 18 and pg-boss. No parser internals or database side channels are asserted. The test service creates and removes unique per-run databases/roles in a dedicated container on port 55473; the concurrent #78 container was left untouched.

Seven recorded synthetic development bibliographies live in `apps/server/test/fixtures/structuring`. Expected values are transcribed literals, not parser-generated snapshots or private quality-gate material. Assertions cover exact CSL values, original substrings, absolute spans, every field's evidence and individual author components. A mixed list combines all eleven style fixtures.

Vertical slices were run before their implementations; raw command output remains locally in `.tmp/73-evidence/`:

| Slice | Meaningful red result | Subsequent green result |
| --- | --- | --- |
| IEEE | Two numbered entries collapsed to one, with only DOI/year | IEEE HTTP test passed |
| Vancouver | Compact names misread and wrapped journal split off | 17 Structuring tests passed |
| ACS | Missing authors/title/journal fields | 18 passed |
| AMA | Truncated author sentence not recognized | 19 passed |
| Springer | Late parenthesized year caused title/journal text to become authors | 20 passed |
| Oxford | Bibliography entries collapsed and note fields absent | 21 passed |
| DIN ISO 690 and mixed list | Entries joined; full given names split incorrectly | 23 passed |
| Publication dates | Years in titles selected instead of publication years; a Springer entry joined to its predecessor | 24 passed |
| Unnumbered IEEE authors | Comma-separated authors collapsed into one literal | 33 passed, including conservative/marker cases |
| Wrapped layouts | Four of five wrapped-style cases failed | 38 passed |
| Numeric-style books | Date absorbed into publisher; ACS fields missing | 39 passed |
| Provenance | HTTP still reported `author-date/1` | 39 passed with `citation-styles/2` |
| Attached note markers | Authors/fields absent for attached superscript/symbol markers | 40 passed |
| Wrapped late-date books | Publisher/date continuations split into separate References | 41 passed |
| Unsupported late-date layout | Entire title/publisher text incorrectly emitted as a literal author | 42 passed |
| Paired title quotes | Apostrophes truncated titles; an ambiguous single-quote boundary was guessed | 43 passed |

The first test setup attempt failed because the default PostgreSQL port was unavailable. A dedicated container was then provisioned; the red results above are assertion failures after successful service/database startup, not infrastructure failures. One manually counted IEEE title span was corrected from 34–45 to the literal text's actual 31–42 before recording green. No acceptance expectation was weakened.

## Qualification limits

These development fixtures establish the ticket's API behavior, not universal free-text understanding or the private Reference test set's statistical targets. Unrecognized layouts preserve original input and only independently recognizable fields. The held-out document gate, private measured-configuration quality gate and performance percentiles remain separate launch qualifications under ADR-0006/0011; no target or denominator was changed.

## Validation record (2026-10-29)

On Node 24.14.0 and real PostgreSQL 18:

- `pnpm install --frozen-lockfile`: passed; no dependency/lockfile change.
- `pnpm pagefind:fetch`, `pnpm pagefind:build`, `pnpm pagefind:verify`: passed, including the controlled native tools and DE/EN WASM. Initial root type/lint and browser startup attempts correctly refused the missing build receipt/output; they were rerun after the controlled build completed.
- Final `pnpm build`, `pnpm typecheck`, `pnpm lint` (including full Prettier check), `pnpm i18n:check`: passed. Localization validated 181 DE/EN messages.
- Structuring HTTP suite: **43 passed**, including the original #72 regressions and all #73 cases.
- Dedicated `e2e/structuring.spec.ts`: **3 passed**, including DE/EN WCAG 2.2 AA checks and localized server-failure handling.
- `pnpm audit:licenses`: passed, 526 installed package licenses and 68 runtime packages reviewed.
- Committed transport artifacts and `git diff --check`: unchanged/clean.

### Full HTTP regression findings retained for integration

`pnpm test` ran the real HTTP/SSE suite: **170 passed, 6 failed, 76 skipped** (252 tests). The skipped tests belong to the comparison suite, whose server could not bind the already occupied port 54572. A clean comparison-only rerun using the existing `SOURCE_TASTER_TEST_COMPARISON_PORT=54573` setting passed **all 76 tests**; no helper, timeout or expectation was changed.

The six assertion failures are in `apps/server/test/bibliographic.test.ts`, which supplies structured CSL fields directly to `/v2/checks` rather than invoking Structuring:

- Two tied-highest-Score, same-Source evidence cases (candidate count and query-log expectations).
- Missing identity comparisons producing an apparent lead over a different Source.
- Carrying unused combined-query capacity into title results.
- Completed searches required for Not found (3 expected log entries, 8 observed).
- Equal top Scores for different Sources (two expected Candidates, one observed).

The last tie case passed in an isolated rerun (**1 passed, 60 skipped**). This does not establish the cause of the six full-run failures or make the full suite green. They remain integration findings outside #73; no search/scoring code or test expectation was edited. Full output is in `.tmp/73-evidence/test.log`, with isolated retry logs alongside it.

An earlier full-suite attempt failed during service startup before executing tests, after a several-hour clock gap; its log is retained as `test-startup-failed.log`. The dedicated PostgreSQL remained healthy and fresh Structuring runs passed. No time limit or quality requirement was relaxed.

### Browser regression completion

- Final `pnpm test:e2e`: **158 passed** (92 website, 48 main web, 18 bibliographic web).
- `pnpm --filter @source-taster/extension test:native`: **4 passed**, including real Chromium side-panel opening, DE/EN web/panel parity, retained Preferences and axe checks.
- No public CSL type was edited, and no change was made to #78's branch/worktree. There is no shared CSL type migration to integrate from #73.

The integration target remained `spec/70-73-parser` at `75dca7caf22c7396f81c1b61dec1579c74274b37` throughout validation. The implementation branch must retain that ancestry at handoff. No PR, push, issue closure or merge into integration/main is part of this ticket's handoff.

## Integration and independent review

The parent integrated the implementation into `spec/70-73-parser` and merged
current `main` (`ebb86810c587a2c97e4a4257b426f4a66a33529e`) without conflicts.
Draft PR #130 contains this ticket only; parent spec #70 stays open.

### Standards

The independent Standards review found **zero documented-standard violations**
and one optional Repeated Switches finding: author syntax independently selected
the splitting rule, person pattern and capture ordering. These choices now live
together in one typed descriptor per syntax. Existing HTTP tests cover the
behavior without asserting on the descriptor.

### Spec

The independent Spec review found **two defects**, both corrected:

- An Oxford multi-author book moved `and Alex Roe` into its title. The author
  opening now consumes the explicit conjunction before the title. The HTTP
  regression preserves ordered authors, keeps the unmarked full name literal,
  and verifies the original input and every evidence span.
- IEEE `et al.` author lists selected the wrong layout, losing or corrupting
  journal metadata. The IEEE opening now consumes explicit truncation with or
  without its preceding comma. Two HTTP regressions verify complete fields,
  truncation evidence and exact spans.

The Oxford test failed before its fix and passed afterward. Both IEEE variants
failed before their fix and passed afterward. Logs are retained locally as
`/tmp/source-taster-73-oxford-{red,green}.log` and
`/tmp/source-taster-73-ieee-{red,green}.log`. After both fixes and the author-rule
cleanup, **all 46 Structuring HTTP tests pass** against real PostgreSQL 18.
No search/scoring rule, public CSL type, timeout or budget was changed.
