# #74 DOI Reference tracer handoff

Implementation branch: `t3/doi-reference-check`. Based on the clean required
`3a81c496ea2dab83790866d5ee486626131a35e8` main/integration commit. This handoff
covers #74 only. Parent integrates and performs final Standards/Spec review;
no PR, integration merge, issue closure, private implementation or predecessor
access is part of this implementation.

## Development behavior

`SOURCE_TASTER_MODE=standalone` remains mandatory. Opt in explicitly with
`SOURCE_TASTER_DOI_PREVIEW=uncalibrated` in web and worker. The API binds loopback.
Hosted mode is closed; production entrypoints refuse uncalibrated activation.
`pnpm --filter @source-taster/server build:release` deliberately refuses this
profile. Ordinary `build` produces development artifacts, never a qualification
receipt. #94 owns real calibration/corpus/measurement and release eligibility.

The Check route now uses the existing parser. It rejects unrecognized input
rather than silently dropping it; use the separate Structuring preview to review
rejected text. Explicit CSL input is also accepted as
`{references:[{originalText,fields,authorsTruncated?}]}` with user provenance.
User fields never claim parser spans. Original text, structured fields, parser
spans when present and per-run Candidate/evidence remain Check content.

The agency-neutral doi.org Handle port runs before Crossref. Only a matching
Handle response with code 100 confirms nonexistence; Crossref 404 is metadata
absence. Matching Handle code 1 plus usable matching-DOI Crossref metadata may
establish supplied-identifier identity without strong counterevidence. Scores
alone never establish it. A supplied URL differing from the received metadata stays Not verifiable with
`url-verification-incomplete`; no HTTP status or confirmed URL deviation is
invented. URL retrieval remains later work.

Both missing and differing fields retain both raw
values; participating weights are renormalized. Unknown retraction stays unknown.

Strong contradiction permits one bounded Crossref combined-query Candidate to
establish the intended different Source independently by title and authors,
with a sufficient Score lead. Otherwise identity remains unresolved. The tracer
does not claim completed multi-source bibliographic search, Mixed citation or
Not found. Its one DOI plus at most one combined Candidate fit the common five
slots and preserve origin/slot provenance. Fuller allocation/search is later work.

All known unsupported CSL types take coverage precedence, including a supplied
DOI, and make no upstream request. Other checking routes retain Not checked.
Candidates, evidence, exclusive Verdict-or-Status, source/rules/runtime versions
and raw comparisons travel through the dual-licensed schema/client/dist/OpenAPI.
The core, adapters and comparison rules remain AGPL-only. DE/EN UI presents
Verdict icon + color + text, identity separately, field exclusions/deviations,
version metadata and evidence; no Correction suggestion is invented.

## Comparison scope and qualification

ADR-0025 OSA on Unicode code points, typography/entity/mojibake/diacritic/umlaut
normalization, BigInt rational field arithmetic, integer weighted means and
half-up storage/display are used. Originals remain intact. Six-decimal integer
Scores retain full agreement separately, including the 99.999999/99.99 caps.
`entities@4.5.0` (BSD-2-Clause) decodes provider entities in AGPL core only; it was
already locked transitively and is now an exact direct dependency.

The DOI tracer handles titles, full journal names/acronyms, received attested
Crossref abbreviations, partial dates, volume, numeric/Roman/prefixed pages and
article numbers. Matching ordered author lists (including explicit trailing
truncation) and single-name comparisons are supported. Nontrivial multi-author
assignment is deliberately left to the #75 comparison seam: the author field is
not determinable and the tracer gives Not verifiable/incomplete evidence rather
than silently substituting a greedy/positional algorithm for Hungarian assignment.
No pinned NLM snapshot, full bibliographic search, other Data source, formatter,
held-out corpus or artificial threshold approval is added.

All free parameters are explicit **synthetic development placeholders**, marked
uncalibrated in each result. They are not production defaults, calibrated values
or proof of the quality targets. Actual corpus, runtime Unicode qualification,
full #75 comparison and #94 exact-configuration gate remain required for release.

## Source execution and later integration

PostgreSQL serializes source pacing and in-flight permits across workers, with
separate singleton/search clocks and shared provider cooldown. Every attempt
consumes a permit. DOI is capped at 20/s. Crossref uses the observed unauthenticated
public pool: 5 singleton requests/s, 1 concurrent request, searches at most 1/s.
These are **below** ADR-0007's polite-pool maxima (8/s, 3 concurrent), because no
contact address or paid/polite access is fabricated. A public singleton HEAD on
2026-10-27 returned `x-api-pool: public-single`, `x-rate-limit-limit: 5`,
`x-rate-limit-interval: 1s`, `x-concurrency-limit: 1`. A public array GET of that same public DOI returned
`x-api-pool: public-array`, `x-rate-limit-limit: 1`, `x-rate-limit-interval: 1s`,
`x-concurrency-limit: 1`; the tracer therefore uses a 1,000 ms search interval
rather than the polite-pool 2.5/s maximum. Provider capacity/terms and
live acceptance still require qualification. Limits/pool are saved in each
result's Search configuration/version. This is not fifty-Check load evidence.

Comparison work has a recorded 2,000,000-cell OSA resource ceiling. Refusals
exclude the affected field and yield Not verifiable/incomplete evidence, never
an approximate similarity or identity inferred from the remaining Score. This
ceiling is part of the recorded runtime configuration and needs qualification.
The Reference clock begins at first worker execution, including the optional
development delay; it is not reset by source waits or retries.

Requests time out after 3 seconds, with at most one eligible retry inside the
30-second Reference deadline. Retry-After applies across workers, even when it
exceeds the permitted two-second retry window. Redirects are refused; endpoints
are fixed trusted origins, with loopback-only fixture overrides. Declared wire
size and actual decoded bytes are bounded to 5 MiB; full pre-decompression wire
and arbitrary URL/DNS/redirect qualification are not asserted. No metadata cache
or permission to retain source metadata beyond Check content is invented.

`checks/verification-runtime.ts` composes core, clock, native abort signal, source
adapters and PostgreSQL limiter. `CheckStore.finishReference` retains the existing
per-Check lock and one transaction for immutable result + slot + ordered event;
retry duplicates cannot overwrite an already finished slot. Results are append-
only rows so later field revisions/runs can be added without replacing evidence.
There is no new cancellation/lease/authority policy in #74.

For #81, add durable attempt/revision fencing, whole-Check cancellation/leases,
retention, current snapshot/replay consistency and fair bounded concurrency at
these seams; abort is an I/O optimization, never the correctness fence. The
limiter currently uses PostgreSQL wall time for provider pacing. For #96, add
current authority at request/output/dispatch/commit while keeping hosted closed
until implemented. Source-only integration can compose real uncalibrated
execution without promoting it to release eligibility. Queue payloads stay IDs
only, and operational logs contain only allow-listed codes/IDs.

## Validation

macOS arm64, Node 24.14.0, pnpm 12.15.0, PostgreSQL 18 on port 5433,
Chromium. Each service run owned a random database/role. Test API/web/site ports
were 54171–54177; unrelated ports/containers 8000/4567 were untouched.

| Check | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passed before implementation; exact stable `entities@4.5.0` subsequently added with the already locked graph |
| `pnpm typecheck` plus final server/web typechecks and core/contract/server builds | Passed |
| ESLint over scripts and all changed code packages; repository Prettier check; `git diff --check` | Passed |
| `pnpm i18n:check` and final i18n catalog check | Passed; 117 app messages, 10 paired information pages, four legal documents, website/source-access catalogs |
| Server HTTP/SSE suite | 64 passed, six files, real PG; subsequently all 30 DOI cases passed after the resource-bound slice, with final foreign-DOI/resource checks passing again (67 unique passing cases across the suite after the additional precision-cap and unverified-URL edge cases) |
| Application Playwright/axe | 16 passed, including DE/EN DOI evidence, Preferences, reconnect and Structuring; final run after clock/resource changes also passed all 16 |
| Website Playwright/axe | 92 passed: DE/EN content/search, viewports, source/notices, publication refusal |
| `pnpm pagefind:fetch/build/verify` | Passed using the unchanged controlled recipe and this task's checksum-validated cache; rebuilt for the changed lock input |
| `pnpm build` and final website/server builds | Passed; includes real controlled native execution and delivered hash-bound source/notices |
| Additional precision-cap and URL HTTP edge cases | Passed: an absent cited page cannot round into full agreement or Correct; an unverified URL cannot become a confirmed URL deviation |
| Rebuild committed contract JS/declarations/OpenAPI and check for unstaged artifact drift | Passed |
| `pnpm audit:licenses` | Passed: 526 installed licenses, 68 runtime packages; entities elected BSD-2-Clause |
| Refreshed public npm/crates advisory DBs + pinned OSV-Scanner 2.7.0 offline audit | Passed: 2,746 scan occurrences, 687 lockfile packages, 1,169 native/bundled expected occurrences, zero blocking findings/license issues; 79 raw upstream findings preserved with existing exact-source dispositions |
| `pnpm --filter @source-taster/server build:release` | Expected refusal, exit 78 in the guard; no fake measurement or approval |
| Production web/worker activation tests | Both refuse the uncalibrated profile before connecting to the database |

Initial overlapping Turbo commands collided in website staging; they were
sequenced/read-only against a completed artifact afterwards. An initial browser
text locator included the icon's DOM text; separate label/icon spans fixed it,
and both languages plus the complete app suite passed. These failures are not
claimed as passes. The first-wave website pipeline, qualification policy,
approved exact prereleases and human publication gate remain unchanged.

The latest local integration tip was checked as
`3a81c496ea2dab83790866d5ee486626131a35e8`; the implementation contains that
ancestor. The final handoff response supplies the implementation commit SHA and
records the required post-commit integration merge result.

Source fixtures have endpoint/date/rights and synthetic-derivative provenance in
`apps/server/test/fixtures/doi/README.md`. They are development edge fixtures,
never calibration or held-out gate evidence. Source launch clearance, legal
publication approval, security/quality/load acceptance, complete #75 comparison,
#81 lifecycle and #96 hosted authority remain open. No extension/native-browser,
fifty-Check capacity, live target or launch qualification is inferred.

The locally verified OSV darwin-arm64 binary SHA-256 was
`d4926ef8da134332543be276dff157e4c170f99ad91fc48e89448a8816bdf70b`, checked
against the exact 2.7.0 release checksums. Advisory dates in the successful scan
were npm `Tue, 27 Oct 2026 08:48:32 GMT` and crates.io
`Tue, 27 Oct 2026 10:33:05 GMT`.
