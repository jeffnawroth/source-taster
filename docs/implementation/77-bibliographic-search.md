# #77 bibliographic article search

This implementation is scoped to #77 under the explicitly invoked implement-spec
workflow and TDD skill. The existing T3-bound worktree is
`/Users/jeffnawroth/.t3/worktrees/source-taster/t3-903cb16c`, on
`implement/77-bibliographic-search`. Its clean starting HEAD was exactly
`7a89b9cd4de684222063d8ecf8d3fd833fc02e7e`, tree
`b35fffcf03a68733f775738036d5a152eeff51e0`, containing reviewed #75.
No replacement checkout, children, predecessor access, private-service edits,
issue/PR changes, integration-root edits, deployment or publication are included.
Parent owns integration and independent review.

## Behavior and evidence

The article coordinator uses the existing exact #75 comparison engine, common
bounded request/body/retry transport, PostgreSQL source budgets, Check store,
fair dispatcher, authority guards, immutable results and SSE lifecycle. It does
not introduce a second scoring engine or a separate cancellation/authority policy.

Coverage precedes DOI work. A supplied DOI first uses the agency-neutral doi.org
Handle check, which consumes no Candidate slot. Supported identifier metadata
then precedes bibliographic searches. Articles without settled identifier identity
search OpenAlex then Crossref, scoring before any subsequent query/provider.
Unambiguous identity plus completed mandatory verification ends retrieval;
a high Score alone does not. Source identity uses provider-qualified record IDs
and known identifiers; conflicting known identifiers and different-Source Score
ties cannot be resolved by display order. Supported PMID identity has its own
transport explanation, distinct from DOI and independent bibliographic proof.
Remaining supplied identifiers are compared against received metadata without
extra lookups after Early termination.

One allocator per Data source evaluates at most five unique Candidates, including
identifier records. It follows identifier (at most three), combined, title,
authors/year, title, authors/year, truncated at five. Repeated title/author slots
reuse already received provider-ordered lists. Duplicates consume no slot;
unused capacity passes only forward. No extra page/request refills capacity, and
unselected records are never scored merely to retain the best five. Candidates
carry origin, per-source slot and leading identifiers; query evidence retains
raw completed payloads, skipped duplicates and unused capacity. All evaluated
Candidates are published in descending exact integer Score order, at most ten
across the two enabled indexes. Raw fields, excluded comparisons, the Best match
and Source identity remain distinct.

The runtime currently verifies OpenAlex DOI/PMID and Crossref DOI routes.
Public HTTP/SSE witnesses exercise 0, 1 and 2 distinct identifier records and
same-record deduplication. The generic allocator retains the ADR-0024 three-record
ceiling, but **no currently verified third identifier operation is claimed**.
A known PMCID returned 404 in a public compatibility check while its DOI/PMID
resolved successfully. PMCID is therefore explicitly unsupported; no native
PMCID request, arXiv route, ISBN catalog or fabricated third-slot endpoint is
used. The generic three-slot branch has no claimed public three-identifier
witness with these adapters. Broader provider capabilities remain future work.

Strong independent opposing title/author components can yield Mixed citation.
Confirmed DOI nonexistence or independently proven foreign DOI precedes Mixed.
Incomplete mandatory resolution remains Not verifiable, with received mixed
components preserved. Resource-limited comparison cannot manufacture identity
from its remaining Score or settle an ambiguous competitor. A high Score from
missing identity fields remains unresolved. Completed sufficient searches in
**both explicitly enabled development indexes**, with usable title/authors/year,
can yield Not found. Outages, malformed/incomplete bodies, disabled sources,
unsupported identifier capability, missing query fields, deadline/budget waits
and known DOI existence with unavailable identity are not successful negative
evidence. Failures are named separately from disabled/unsupported steps.

The real-PG public HTTP/SSE tests and browser E2E are the previously approved
seams. Only external HTTP/provider/service-transport fixtures and time/process
controls are used. No application-table, queue-state, internal-call/log or
implementation-mirroring unit assertions were added. Synthetic fixtures are
independent protocol witnesses, not calibration or the held-out test sets.

## Contract compatibility

Version 1 keeps its existing schemas, Crossref literal, five-result cap,
reason/progress enums, creates, snapshots, numeric SSE cursors and frozen clients.
Version 1 creates retain the prior DOI-tracer execution even with article search
enabled. Checks persist their creation major; existing rows default to 1.
Version 1 routes return 404 for Version 2 Checks, including streams/mutations.
Version 2 reads stored legacy results/events without rewriting their evidence
or versions. Numeric and Check-bound cursors retain their existing semantics.

Version 2 supplies the expanded source/provenance/result contract through
`contract-verification/v2`, `client-v2`, `routes-v2` and `openapi-v2.json`.
The web app now uses that same intended contract for the later extension.
Stateless Structuring remains `/v1/structurings`. HTTP handlers, credential/error
handling, reconnect/cursor validation, lifecycle, source transport and policy
fences are shared. Both OpenAPI majors are tested against their committed
documents. Committed JavaScript/declarations and OpenAPI are regenerated; CI
checks the additional artifact and runs the new browser suite sequentially.
Only transport code remains dual-licensed; AGPL algorithms/adapters/UI do not
enter the narrow MIT boundary.

The read-only actual authority peer remains
`/Users/jeffnawroth/Developer/Repositories/source-taster-service` at
`cc316900eedde83c5e21f23383d3fa4c940937c9`, with its existing reviewed transport
pin `bfd3edeb79866e26f7e6057712322031bc692fbc`. Its Version 1/internal/service
interfaces are compatible, so no private pin bump or private implementation
change is required. A future private consumer of Version 2 would need a newly
reviewed public full-SHA pin; this implementation does not alter that dependency.

## Exact development configuration

Explicit opt-in in both web and worker:

```text
SOURCE_TASTER_MODE=standalone
SOURCE_TASTER_DOI_PREVIEW=uncalibrated
SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW=uncalibrated
SOURCE_TASTER_OPENALEX_ENABLED=true
```

OpenAlex is otherwise disabled. Fixture origin overrides are loopback-only in
development, without credentials in their URLs. No key, polite-pool contact,
account signup, paid access or alternate provider identity is fabricated.

The Search strategy version prefix is
`article-search-77-2-supported-identifiers-openalex-crossref-uncalibrated`, with
existing `/lifecycle-2` and, for source-only hosted authority tests,
`/guest-authority-1` suffixes. Disabled OpenAlex has a distinct source-list version.
Results record source enablement, route/capability scope, allocation, source
limits, first-execution deadline, retry/body bounds, lifecycle/authority settings
and the OpenAlex display-name projection version. The unchanged Scoring rules
version is `comparison-75-3-date-ranges-20261028`, followed by its existing
entities version, exact parameter/limit SHA-256, Unicode and ICU versions.
Approved author ties and date-range algorithms are unchanged. The full actual
profile/limits are retained in each immutable result.

OpenAlex uses one shared request/s, one concurrent request across identifiers,
all search kinds, retries and workers. Crossref remains the conservative public
pool: five singletons/s, one search/s across all query kinds, one concurrent
request. doi.org remains 20/s. PostgreSQL shared cooldown and actual-send pacing
include the existing 100 ms dispatch margin. Permits cover current-authority
waits and the complete request/body. Source failures remain distinct from
cancellation/authority abort. Requests have a three-second timeout, one eligible
retry, a 5 MiB body ceiling and the original thirty-second hard deadline from
first execution, including rate waits and recovery. Completed attempt-local
payloads alone provide evidence. Claim, generation, cancellation, lease, fairness
and current-authority dispatch/commit/output fences remain in force.

Earlier research reported unauthenticated OpenAlex 10/s versus keyed 30/s;
older GitHub documentation gives different limits, while current help pages
returned 403 to the recorder. The one-request/s development cap does not infer
an account allowance from either documentation or the 25/s planning cap. Daily
provider limits and Retry-After still apply. No rate increase or budget bypass
is introduced. Live compatibility spot checks are public bibliographic facts,
not supplier capacity, recall, terms clearance or performance qualification.

OpenAlex author display names are projected as last-token family plus preceding
given tokens; raw provider values remain available. This adapter projection is
explicitly versioned, uncalibrated and needs multilingual/corporate-name
qualification. It does not change #75's comparison rules. No NLM snapshot,
retraction enrichment request, cache or full book/web/arXiv/provider rollout is
claimed. Unsupported routes remain incomplete. #82/#92/#94/#99/#100 and human
supplier/legal/security/accessibility/load/native-browser qualifications remain
outside this delivery. Production/hosted activation, measured release and
website publication gates stay closed.

Recorded fixture provenance, sanitization, hashes, CC0 storage evidence and the
PMCID observation are in
[the fixture README](../../apps/server/test/fixtures/bibliographic/README.md).

## Validation and recovery record

Node 24.14.0, pnpm 12.15.0, macOS arm64, owned PostgreSQL 18 container
`st77-search-pg-20261028` on loopback 55477. Test harnesses provision and remove
unique databases/roles; runtime processes receive their own restricted role,
never provisioner admin credentials or peer private keys/schema access. Task
ports use 54770–54778 plus existing isolated lifecycle and OS-assigned authority
fixtures. Ports 8000/4567 and unrelated resources are untouched.

Local owner-only transcripts and receipts are under `.tmp/st77/`; native source
build/verification receipts are in `.tmp/pagefind/`. Controlled website inputs,
dependencies, lockfile, license policy and publication approvals are unchanged.
No overlapping Turbo staging or browser output directories are used. Dated prior
qualification evidence retains its original dates and scope.

Behavioral RED→GREEN logs include: absent `/v2` creation; missing shared allocator;
known DOI existence falsely becoming Not found; year-only 100% Score falsely
becoming Not found; conflicting known identifiers being collapsed; PMID identity
being mislabeled; a resource-limited competitor incorrectly allowing identity;
and the old browser path leaving a no-DOI Reference unchecked. Each is followed
by its focused passing public-boundary run. The first broader browser attempt
passed six cases but had two incorrect German expected labels; those test labels
were corrected. An initial authority test used an incorrect fixture control key;
it is a fixture failure, not a product RED or passing evidence.

A usage-limit interruption left a regex edit with an over-deleted allocation
test. Recovery preserved all WIP in the same bound checkout, reconstructed its
one/two-identifier slot, origin, count and provenance assertions, and checked the
other edited files. All 21 pre-existing bibliographic cases passed after repair;
no assertion was dropped to restore parsing. The parent retained a separate
owner-only recovery archive; it was not used as replacement code or qualification.

Final validation results, integration reconciliation and remaining qualifications
are recorded below after their actual runs.

## Final configuration receipt

The default development comparison profile is unchanged: surname/given weights
3/1; minimum name 50,000,000; order penalty 100,000,000; fixed year weight
100,000,000; month/day 12,500,000 each; overall threshold 85,000,000; strong-field
and Mixed-component thresholds 95,000,000; counterevidence/contradiction
50,000,000; lead 5,000,000. These are synthetic, uncalibrated placeholders.
Comparison resource limits remain 2,000,000 OSA cells, 100 optimal Reference
names, 30,000,000 assignment steps, 1,000,000 graph pairs and 30,000,000 aggregate
author-work units. No threshold was calibrated or altered for these witnesses.

On Node 24.14.0, Unicode 17.0, ICU 78.2, the exact default version is:

```text
comparison-75-3-date-ranges-20261028-entities-4.5.0-uncalibrated-9dec51d85bb06f48a78fb745a71f2a819f3a60a4b07d6847468fb036d5586518-unicode-17.0-icu-78.2
```

The owner-only `.tmp/st77/configuration-receipt.json` records the complete default
profile/limits and source configuration without environment variables or keys.
Individual clock/parameter/lifecycle tests retain their actual per-result
configuration; they are not relabeled as one measured configuration. PMID URL
normalization preserves raw values and the exact #75 numeric comparison, while
canonicalizing lookup and confirmed identifier-deviation decisions. Repeated
identifier responses for one source record retain all leading identifiers and
explicit duplicate evidence without a second evaluation.

## Executed final checks

Commands ran from this worktree with the owned loopback PostgreSQL/ports and,
where required, the read-only actual authority peer selected by the owner-only
local provisioning file. It is not included in the evidence archive.

| Command | Final result and local transcript |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passed; `install.log` |
| `pnpm --filter @source-taster/server generate` | Passed, including the additive creation-major migration; `generate.log` |
| `pnpm --filter @source-taster/server test` | **189 passed / 12 files**, including all 26 bibliographic and three new lifecycle cases; `server-handoff.log` |
| `pnpm --filter @source-taster/server test:authority` | **31 passed**, actual private peer; `authority-handoff.log` |
| `pnpm --filter @source-taster/web test:e2e` | **38 existing + 8 bibliographic passed**, separate sequential browser outputs, DE/EN and axe; `web-final.log` |
| `pnpm --filter @source-taster/web test:guest` | **5 passed**, actual Guest/browser/authority; `guest-browser-final.log` |
| `pnpm --filter @source-taster/website test:e2e` | **92 passed**, with provisioner variables removed; `website-browser-final.log` |
| `pnpm pagefind:fetch`, `pnpm pagefind:build`, `pnpm pagefind:verify` | Passed in this owned checkout with the unchanged controlled recipe; `pagefind-{fetch,build,verify}.log`, final `pagefind-handoff-verify.log` and `.tmp/pagefind/receipt.json` |
| `pnpm build` | **11 tasks passed**; `build-final.log` |
| `pnpm typecheck` | **19 tasks passed**, including new browser files; `types-final.log` |
| `pnpm lint` | **19 tasks and repository formatting passed**; `lint-handoff.log` |
| `pnpm i18n:check` | Passed, **159 paired app messages** and website catalogs; `catalog-handoff.log` |
| `node .tmp/st77/check-contracts.mjs` | All **38** JS/declaration/OpenAPI artifacts identical after rebuilding all four transport packages; `artifacts-final.log` |
| `pnpm audit:licenses` | **526 installed / 68 runtime** licenses reviewed; `licenses-handoff.log` |
| `bash scripts/refresh-advisories.sh`, then `OSV_SCANNER_BIN=.tmp/st77/tools/osv-scanner pnpm audit:dependencies` | Actual refreshed offline OSV-Scanner 2.7.0 scan: **2,746 occurrences / 687 lock packages / 1,169 expected native and bundled occurrences**, 82 retained findings with existing exact-source dispositions, **zero blocking findings / license issues**; `security-final.log` and `.tmp/audit/` |
| `node scripts/qualification-controls.ts` | Passed descendant, source/binary tamper, exact native-license, scanner failure/stale/empty/omitted-inventory, publication-recipe and delivered-WASM reproduction controls; `qualification-controls-final.log` |
| `node apps/server/scripts/release-check.ts` | Expected refusal, **exit 78**; `release-refusal.log` |
| `git diff --check` | Passed |

The OSV darwin-arm64 binary SHA-256 is
`d4926ef8da134332543be276dff157e4c170f99ad91fc48e89448a8816bdf70b`, the
qualified 2.7.0 checksum. Advisory database Last-Modified values were npm
**Wed, 28 Oct 2026 11:33:00 GMT**, crates.io **Wed, 28 Oct 2026 09:02:50 GMT**.
This is current matching evidence for the unchanged graph, not a dependency,
license, source-rights or legal waiver. Existing evidence and approvals were not
redated or widened. The controlled pipeline continues to report legal review
pending and publication blocked.

The first complete authority attempt passed 30/31 because the compiled server
entrypoint was not yet built; its guard test exited 1 instead of the expected
configuration refusal. After building, the full 31-case run passed, including
source and compiled hosted refusal. Initial lint reported two unsafe matcher
assignments and unnecessary assertions; typed unknown matchers and normal
narrowing fixed them. New browser tests are included in the TypeScript project.
Generated Version 2 OpenAPI and recorded bibliographic JSON use the same existing
format-preservation policy as their Version 1/DOI counterparts; regeneration,
exact HTTP document equality and artifact-drift checks remain mandatory. These
setup/lint failures are retained and are not passing evidence.

The development Vite build retains its existing chunk-size advisory. No quality
gate, calibration, held-out corpus, EU live latency/load acceptance, fifty-Check
capacity, native extension/browser parity, human WCAG/ASVS/legal/privacy/source
qualification, production activation or website publication approval follows
from these passing local checks. PMCID and the generic three-identifier public
witness remain explicitly unqualified as described above.

## Integration and handoff

The latest local `spec/70-shared-workspace-extension` is still
`7a89b9cd4de684222063d8ecf8d3fd833fc02e7e`.
`git merge --no-edit spec/70-shared-workspace-extension` in this implementation
checkout returned **Already up to date**, and the ancestor check passes.
The integration checkout was not changed. The final response supplies this
branch's pushed HEAD; parent retains integration and independent-review authority.

T3 confirms attachment to the same requested worktree path. Its cached branch
label is stale after the existing checkout's branch rename; Git's actual branch
is `implement/77-bibliographic-search`, as required. No checkout replacement or
worktree handoff was performed.

The owner-only local evidence archive is `.tmp/st77-evidence.tar.gz`, with logs,
configuration/live-probe receipts, transport hashes and controlled build/security
receipts. Provisioning environment files, credentials, keys, raw unselected
provider probes and tool binaries are excluded. Only the owned disposable
PostgreSQL fixture and test-owned processes are cleaned up; unrelated resources,
ports 8000/4567 and the original #75 evidence checkout remain untouched.
