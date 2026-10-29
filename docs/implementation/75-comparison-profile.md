# #75 comparison profile implementation

Follow-up review corrections and the current Scoring rules version are recorded
in [75-review-corrections.md](75-review-corrections.md). The evidence below
describes the original implementation commit.

This work is confined to #75 under the explicitly invoked implement-spec
workflow and TDD skill. The bound worktree is
`/Users/jeffnawroth/.t3/worktrees/source-taster/t3-ddfeabc7`, branch
`implement/75-comparison-profile`. It started clean at the required integration
commit `29bfec143429970a342f0a5ed4bb7455ef1bf5ae` on
`spec/70-shared-workspace-extension`. Parent owns integration, PRs, independent
Standards/Spec review and issue closure. No other worktree or subagent was made.

## Criteria and public evidence

The existing AGPL core comparison module is deepened; there is no second scoring
engine. `packages/core/src/comparison.ts` owns normalization, Unicode-codepoint
OSA, exact rational name/component arithmetic, assignment, field rules and the
integer weighted mean. `verification.ts` retains independent identity and
ADR-0008 precedence. `apps/server/src/checks/verification-runtime.ts` binds the
configuration/version to the real execution path.

All new behavioral tests use actual create/GET/SSE with real PostgreSQL and real
web/worker processes (`apps/server/test/comparison.test.ts`), or the browser's
actual Check flow (`apps/web/e2e/comparison.spec.ts`). Only the external source
HTTP edge and time/process-lifecycle edges are controlled. There are no
application-table, queue-state, internal-call, log or implementation-mirroring
unit assertions. The existing user-approved seams require no new approval.

| Criterion | Implementation and independently worked public evidence |
| --- | --- |
| Fixed OSA and normalization | Unicode code points, insertion/deletion/substitution/adjacent transposition; provider markup/entities → valid Windows-1252 mojibake repair → NFKC/typography → case folding/ß → same-side simple/extended umlaut folds and other diacritics → punctuation/whitespace. `Jouranl`/`Journal` = 85,714,286; Müller/Muller and Müller/Mueller agree; Mueller/Muller deviates. Supplementary-plane letters distinguish codepoint from UTF-16 length. Raw values remain unchanged. |
| Exact field arithmetic | BigInt rationals remain exact through surname, positional given-name components, pair sums, N and Kendall penalty. The independently worked pair mean `(3/4 + 19/28)/2 = 5/7` stores 71,428,571; premature pair rounding would store 71,428,572. A pair `99,999,999 / 199,999,999` is excluded below minimum 1/2 even though premature percentage rounding would reach it. |
| Weighted means and display | Fixed §8.2 weights 30/25/15/15/10/3/2; only stored Field score integers feed the final exact weighted mean. Crossed three-author example stores author 66,666,667 and overall 76,190,476. Eleven existing scalar HTTP witnesses and ten new actual browser witnesses cover stored six-decimal integers, half-up two-decimal display, repeated reads and DE/EN switching. |
| Independent full agreement | Known deviations cap at stored 99,999,999 and displayed 99.99%. The 199,999,999/200,000,000 page case exercises storage and browser display; a one-discordance 100-name case at p=1/100,000,000 independently exercises the author and overall storage caps. |
| Optimal authors | Rectangular Hungarian assignment maximizes the exact pair-score sum, including optional zero-valued omissions. A tight-edge exhaustive secondary search compares exact Kendall fractions, then lexicographic Reference positions, then Candidate positions. Crossed, reversed, ambiguous optimal and duplicate-name witnesses distinguish maximum-sum assignment from positional/greedy matching. No order/distance proxy replaces the approved ties. |
| Approved tie clarifications | ADR-0025 records both client approvals of 2026-10-28 and their counterexamples. `[Alpha] et al.` against `[Alpha, Alpha]` chooses Candidate 1, N=1/full 100%. `[ab, bb] et al.` against `[aa, ab]` chooses Reference-position prefix `[1]` before `[1,2]`: author 33,333,333, overall 52,380,952. The consolidated HTTP test also checks the new rules-version prefix. No extra cardinality priority is introduced. |
| Author names and counts | Particle/no-particle maximum, complete recognized multi-token prefixes, positional hyphen/initial components, full given names by OSA, surname-only comparison when given names are missing, corporate whole-name OSA, and corporate/person zero. Müller A. B./Muller Anna is full 100%. One Candidate cannot satisfy duplicate Reference names; below-minimum pairs are unassigned and ignored for order. |
| Truncation | Explicit truncation frees only trailing Candidate omissions. Missing/extra authors otherwise reduce via N. An intervening omitted Candidate contributes to N even with a marker. Full agreement requires all Reference names, compatible counts and zero discordance. |
| 100/101 boundary | Exactly 100 Reference names against 1,000 Candidate names with one crossing gives 9,997,980: `100/1000 × (1−1/4950)`. Incorrect positional fallback would give 9,800,000. At 101 Reference names, reversed distinct one-codepoint names give positional 1/101 = 990,099. A 101-name Reference against 10,000 Candidate names with explicit trailing truncation still fully agrees using positional assignment. Candidate count never selects the positional algorithm. |
| Dates | Shared components only, year equality/one-year-half rule, normalized numeric components, full English/German month forms with preceding/following days, seasons/ranges year-only, and explained exclusion of in-press/n.d. forms. Partial 2021/2021-06-15 fully agrees; month mismatch gives 88,888,889 with the development component weights; day mismatch gives 90,000,000. |
| Pages/article numbers | Inclusive cited-page coverage; abbreviated endings (including rollover), numeric/Roman/equal-prefix coverage, differing prefixes zero, normalized article equality/binary difference. Roman/Arabic, one-sided prefix, article/range and unknown unequal formats are explained exclusions. NFKC and provider cleanup precede format interpretation. |
| Volume/DOI/issue | Combined numeric volume notation, including compatibility characters, reads the volume number; other volumes compare by normalized equality. DOI remains binary after identifier normalization. Issue is preserved/explained and unweighted. Existing DOI identity/conflict/outage regressions remain applicable. |
| Journals | One valid trailing raw uppercase Latin/digit acronym token is removed, requiring matching round/square brackets; mixed-case qualifiers remain. Received Crossref abbreviations must differ from the full title. A qualifier omitted from an abbreviation matches only with the Candidate's canonical qualifier evidence; conflicting/unproved qualifications and unattested abbreviations stay unscored. No unproved different-journal deviation is invented. |
| Raw/excluded fields | Both selected raw field values, all supplied CSL fields, raw Candidate records, original Reference and excluded/missing/resource reasons persist in the result. Public tests inspect them, including the complete 10,001-name Candidate on graph refusal. Missing fields are excluded, not zero-scored. |
| Version and replay | New `comparison-75-2-lexicographic-ties-20261028` prefix, entities version, SHA-256 over the exact parameter/limit record, and runtime Unicode/ICU versions. The parameter change/restart test replays the identical earlier snapshot/SSE outcome with its original version; later runs have a different version and deterministic scores. |
| Calibration boundary | Only declared free parameters are accepted, with integer/range/relative-weight constraints; fixed-rule keys and invalid values refuse process startup. Every result remains **UNCALIBRATED**. Release/production/hosted activation guards stay closed; no synthetic fixture is calibration or measured approval. |

## Exact assignment and resource behavior

Name pairs are not rounded for assignment. Their denominators are combined into
one exact BigInt scale for Hungarian costs. Zero/below-minimum pairs cannot become
assigned names. Tight edges include every primary optimum; the secondary search
accepts only assignments with the exact optimum sum. Kendall comparison uses
cross-multiplied integer fractions. Lexicographic Reference positions use the
approved shorter-prefix-first convention; Candidate positions are the last tie.
A shortcut for zero discordance is valid only when the primary sum proves the
assignment count too; the prefix counterexample prevents an implicit preference
for more pairs.

Above 100 Reference names only, positional pairs use the same threshold,
count/truncation, order and full-agreement formula without allocating an n×m graph.
Up to 100 Reference names, long Candidate lists always enter optimal assignment
or produce an explicit resource refusal. They never select another algorithm.

Recorded development resource ceilings are 2,000,000 OSA cells per comparison,
1,000,000 author graph pairs before allocation, 30,000,000 counted assignment
steps, and 30,000,000 aggregate author text-work units. The latter account for raw
name UTF-16 storage units, normalized Unicode code points, given-name components
and OSA cells across the entire author field; they never alter the OSA metric.
The assignment budget counts primary scans, secondary visits/edge scans and
inversion loops. These are fixed versioned resource limits, not calibration parameters or
Candidate-count fallback switches. The graph guard bounds allocation before a
large exact matrix can exhaust memory. Exhaustive non-additive tie resolution
can exceed the budget on highly ambiguous inputs; it then refuses honestly.
No approximation, guessed tie, partial assignment or identity from the remaining
Score is published. These limits and performance still need qualification.

## Development configuration and unchanged boundaries

`SOURCE_TASTER_COMPARISON_PARAMETERS` accepts a JSON object over exactly:
`surnameWeight`, `givenWeight`, `minimumName`, `orderPenalty`, `monthWeight`,
`dayWeight`, `overallScore`, `strongField`, `counterevidence`, `lead`,
`mixedComponent`, `contradiction`. Unknown keys, negative/non-integer/unsafe
values, surname ≤ given, minimum ≤ 0, p ≤ 0 or > 1, and month/day ≥ year refuse
startup. Thresholds and minimum/p use integers on the 100,000,000 similarity
scale. Date weights use that same fixed year basis; month/day values express
relative weights. Surname/given weights are exact integer ratios. All values and
the fixed year basis are recorded. General-search threshold hooks do not add the
#77 search engine or change DOI identity precedence.

Synthetic placeholders are surname/given 3/1, minimum 50,000,000, p 100,000,000,
year/month/day 100,000,000/12,500,000/12,500,000, total 85,000,000, strong and Mixed
component 95,000,000, lead 5,000,000, contradiction/counterevidence 50,000,000.
They are explicitly uncalibrated development choices, never launch defaults.
#94 owns grid selection, real Development/reference datasets and measured gates.
No release/activation/publication escape hatch or fabricated measurement exists.

The existing transport schema/client/committed JS/declarations/OpenAPI remain
unchanged and compatible with current `/v1` clients. All comparison implementation
is AGPL-only; the narrow transport dual-license exception is unchanged. No private
consumer/pin or dependency/lockfile/controlled-recipe change is necessary.
The private root at `cc316900eedde83c5e21f23383d3fa4c940937c9` is used read-only as
the actual authority peer, with ephemeral keys and separately restricted runtime
roles. No program runtime receives admin credentials, peer schema grants or peer private keys.

There is no new Data source or NLM snapshot here: the current tracer can use
received Crossref attestations, and unavailable abbreviation proof stays
not determinable. Retraction remains unknown in this adapter; arbitrary title
prefixes are not stripped without provenance. #77 full search/OpenAlex,
#82 workspace/corrections, #92 native extension, #94 calibration/measurement,
#99 Quota, #100 abuse and private business behavior are not implemented.

## Validation environment and receipts

Node 24.14.0, pnpm 12.15.0, macOS arm64. Owned disposable PostgreSQL 18 container
`st75-comparison-pg-20261028` binds loopback 55475; every harness owns and cleans its
unique databases/roles. Test API/browser ports use 54570–54577, existing isolated
lifecycle fixture ports and OS-assigned authority/source ports. Unrelated
resources and ports 8000/4567 are untouched.

Commands below run from this worktree. `source .tmp/st75-env` selects only this
run's loopback database/ports and the approved read-only authority peer. It is
local setup, not a release or a new product configuration. Command transcripts
and failed-run traces are retained in `.tmp/st75-*.log` and
`.tmp/st75-browser-initial-failures/`; controlled source/build receipts remain
under `.tmp/pagefind/` and the website's ignored build directories.

| Exact command (after the setup above) | Final result / retained transcript |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passed; `.tmp/st75-install.log` |
| `pnpm --filter @source-taster/server generate`, `pnpm --filter @source-taster/core build`, `pnpm --filter @source-taster/i18n build` | Passed before behavioral RED; generated/native artifacts were prepared first |
| `pnpm --filter @source-taster/server exec vitest run test/comparison.test.ts` | **68 passed**, real PG/create/GET/SSE; `.tmp/st75-comparison-final.log` |
| `pnpm --filter @source-taster/server test` | **152 passed / 10 files**, repeated after runtime-environment isolation; `.tmp/st75-server-isolation-final.log` |
| `pnpm --filter @source-taster/server test:authority` | **28 passed**, actual read-only private peer; `.tmp/st75-authority-final.log` |
| `pnpm --filter @source-taster/web test:e2e` | **38 passed**, including ten exact arithmetic replay/display cases and DE/EN author evidence/axe; repeated after environment isolation, `.tmp/st75-web-isolation-final.log` |
| `pnpm --filter @source-taster/web test:guest` | **5 passed**, actual hosted Guest/browser processes; `.tmp/st75-web-guest-final.log` |
| `pnpm --filter @source-taster/website test:e2e` | **92 passed**, source/notices, search, DE/EN and publication refusal; final static-only command `env -u DATABASE_ADMIN_URL -u DATABASE_TEST_URL -u SOURCE_TASTER_SERVICE_WORKTREE SOURCE_TASTER_WEBSITE_E2E_PORT=54576 pnpm --filter @source-taster/website test:e2e` also passes all 92, `.tmp/st75-website-isolation-final.log` |
| `pnpm pagefind:fetch`, then `pnpm pagefind:build`, then `pnpm pagefind:verify` | Passed unchanged controlled recipe, actual owned source/native build; `.tmp/st75-pagefind-{fetch,build,verify}.log` and `.tmp/pagefind/receipt.json` |
| `pnpm build` | Passed, all 11 tasks; `.tmp/st75-build-final.log`. Existing Vite chunk-size advisory remains an advisory, not a performance qualification |
| `pnpm typecheck` | Passed, all 19 tasks; repeated after fixture isolation, `.tmp/st75-types-isolation-final.log` |
| `pnpm lint` | Passed, all 19 tasks and repository Prettier; repeated after fixture isolation, `.tmp/st75-lint-isolation-final.log` |
| `pnpm i18n:check` | Passed, DE/EN app and website catalogs; `.tmp/st75-catalog-final.log` |
| `pnpm audit:licenses` | Passed: 526 installed licenses, 68 runtime packages; `.tmp/st75-licenses.log` |
| `node .tmp/st75-check-contracts.mjs` after rebuilding tracked `packages/contract-{common,verification,service,internal}` files | **All 70 files identical**, including committed JS/declarations/OpenAPI; `.tmp/st75-contract-check.log`. No transport commit/pin change is needed |
| `node apps/server/scripts/release-check.ts` | Expected refusal **exit 78**; `.tmp/st75-release-final.log`. Production/compiled hosted refusals also remain covered by DOI/authority suites |
| `git diff --check` | Passed |

All Turbo stages and the browser output directories were used sequentially. The
dependency graph, lockfile and controlled recipe did not change. The license
inventory is an actual local run; no fresh advisory-database scan or new legal,
dependency, source-rights or launch qualification is claimed. Existing dated
advisory/qualification evidence retains its original scope.

The TDD logs preserve behavioral RED for crossed authors (null versus 66,666,667),
in-press exclusion (100% versus excluded), named day comparison (90% versus
100%), mojibake repair (77.777778% versus 100%), given-component normalization
(83.333333% versus 100%), canonical journal qualification (null versus 100%),
complete surname particles (50% versus 100%), numeric compatibility notation
(0% versus 100%), normalization order (null/78.571429% versus 100%), and aggregate
author work (a computed zero versus an honest resource refusal). Each was then
implemented and rechecked at the same HTTP/SSE seam. Startup invalid-parameter
RED exited 1 after reaching the dummy connection; GREEN refuses configuration
with 78 before connecting. These synthetic development witnesses are independent
of the implementation arithmetic and are not a calibration grid or measured set.

The first full server run passed 135/141 cases; six lifecycle fixture requests
raced the IPC ready message before the HTTP listener. The source-only
`clocked-process.ts` fixture now awaits `listening`, matching the existing Guest
fixture. The affected lifecycle suite passes after that correction. Product
lease/claim/authority/source behavior is unchanged. The standalone test process,
clocked lifecycle and Vite launchers now pass only explicit runtime configuration
and PATH, keeping the provisioner's admin URL out of the application processes;
the existing both-program/hosted browser harnesses already use that boundary. The initial lint run found two
unsafe test matcher assignments; typed unknown matcher helpers resolve them.
The initial ten-case browser run had four locator failures against the existing
“Pages or article number” label; the corrected locator passes all ten. Those
failed runs are retained, not reported as passing evidence. Parent-owned prefix
RED used the prior core dist and observed 50,000,000; its later overlapping-port
run is invalid evidence. The consolidated isolated current test passes.

Parent remains responsible for fresh independent review and integration. No new
launch, quality, WCAG, native-browser, load, source-rights, legal, security or
publication qualification follows from these development regressions.

## Integration reconciliation and handoff

The latest local `spec/70-shared-workspace-extension` was still
`29bfec143429970a342f0a5ed4bb7455ef1bf5ae` before the final commit/push;
`git merge-base --is-ancestor spec/70-shared-workspace-extension HEAD` passes.
It is already contained in this implementation branch. Per the recovery
coordination, no integration merge was performed and the integration root was
not changed. Parent owns that action and the independent reviews/PRs.

The final response supplies the pushed commit SHA. Local evidence is archived
without the provisioning environment or keys in `.tmp/st75-evidence/` and
`.tmp/st75-evidence.tar.gz`, with the default development configuration receipt,
log hashes, transport hashes and controlled-build receipts. Only owned running
fixtures are stopped; receipts/source-build evidence remain available for the
parent's archive. The final private worktree cleanliness check is read-only.

No unresolved #75 implementation requirement was identified at these approved
seams. Resource limits, calibration/measurement and all adjacent-slice/human gates
above remain explicit limits, not approval or completion of those later tasks.
