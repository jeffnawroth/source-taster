---
status: accepted
---

# Route References sequentially with shared source budgets and bounded search time

The client accepted this decision on 24 October 2026 in [Search strategy and latency budget](https://github.com/jeffnawroth/source-taster/issues/16), including the final corrections F18–F21 to the first two rounds. It builds on [ADR-0003](0003-system-architecture.md), [ADR-0005](0005-check-reference-lifecycle.md) and [ADR-0006](0006-reference-test-set-quality-gate.md). Search is sequential across Data sources within a Reference and concurrent across References, so it stops before querying another source when scoring establishes an unambiguous match.

This is an accepted design, not an implementation, source-terms clearance, capacity measurement or requirements amendment. Numeric limits below are initial operating settings, subject to provider terms and measurement; they are not evidence that the performance requirements have been met.

## Routing and source order

The routing key is the Reference's canonical CSL `type` (ADR-0005). Exact CSL type lists are aligned with [Non-AI structuring approach](https://github.com/jeffnawroth/source-taster/issues/20).

- **Articles, conference papers, preprints, reports and theses:** OpenAlex, Crossref, Europe PMC and Semantic Scholar; direct arXiv access is identifier-only. Unknown/other types take this route.
- **Books and chapters:** Open Library and Google Books ISBN catalogs, OpenAlex and Crossref.
- **Web pages and blog posts:** URL reachability and Internet Archive, plus the DOI path when a DOI is supplied.
- **Outside coverage:** laws, judgments, archival records and personal communications receive Not verifiable without a coverage search. The explicit coverage-first exception is recorded in [ADR-0008](0008-scoring-verdict-rules.md) and the client-approved requirements specification v3.2, which supersedes v3.1 as the working baseline.

**Identifier-first precedence:** for a covered Reference with a supplied DOI, resolve its existence through the registration-agency-neutral doi.org Handle API before the route's other work, including the book/web routes. Retrieve bibliographic metadata through OpenAlex/Crossref. Crossref's absence alone does not establish DOI non-existence. A definitive DOI conflict does not stop candidate retrieval by title/authors; an unavailable resolver is a failure, not evidence of an invalid DOI. Verdict derivation remains with [Scoring and verdict rules](https://github.com/jeffnawroth/source-taster/issues/17).

Initial order after that precedence:

1. **Article route:** DOI metadata via OpenAlex; PMID/PMCID via OpenAlex where the exact identifier operation is supported, otherwise Europe PMC; arXiv identifier via a supported indexed lookup, otherwise a batched direct arXiv lookup. Then bibliographic searches: OpenAlex → Crossref `query.bibliographic` → Europe PMC → Semantic Scholar.
2. **Book route:** ISBN lookup Open Library → Google Books; bibliographic searches OpenAlex → Crossref → Open Library → Google Books.
3. **Web route:** URL request → Internet Archive lookup, after mandatory DOI handling where applicable.

An arXiv DOI lookup must not be presented as proof that OpenAlex accepts a native arXiv ID. The official [OpenAlex singleton documentation](https://github.com/ourresearch/openalex-docs/blob/main/api-entities/works/get-a-single-work.md#external-ids) lists DOI, MAG, PMID and PMCID, but not native arXiv IDs; its current endpoint behavior still needs validation. For a native identifier without a supported indexed lookup, take the approved direct arXiv fallback rather than inventing an OpenAlex endpoint or counting a capability limitation as an outage. Direct arXiv title search is excluded from the accepted plan because its shared request budget is too small for the intended load.

## Candidate retrieval and early termination

Score a source's Candidates before advancing to another source. The initial FA-SUC-03 cap is five Candidates per Data source. If a combined bibliographic query does not establish an unambiguous match, additionally query by title alone and by authors plus year. These two queries may run concurrently within the **same** source, still consuming its global budget.

Share one five-Candidate evaluation budget per source. Evaluate at most one top-ranked combined-query Candidate first; if it is not unambiguous, evaluate up to two unique title-only and two unique authors/year Candidates, following the provider's order and deduplicating known source-record IDs. The per-source ceiling includes identifier evidence and repeated queries; it must not be multiplied by the number of calls. Raw replay responses may be retained where licensed, but only evaluated Candidates enter the scored/displayed result set. Measure the effect of the initial 1 + 2 + 2 allocation on retrieval and mixed-citation recall; changing this allocation triggers the gate.

[ADR-0008](0008-scoring-verdict-rules.md) records identity and early-termination criteria, DOI/coverage/mixed precedence, score ties, URL/archive outcomes and proven `RETRACTED: ` title-prefix handling. Numeric launch thresholds remain to be calibrated and gated. Scoring must respect the shared Candidate budget and preserve evidence provenance rather than silently scoring fifteen Candidates under a nominal cap of five. Search-strategy order/version and source enablement changes are gate triggers under ADR-0006.

## Shared budgets, scheduling and deadlines

Use PostgreSQL-backed budgets shared across **all** worker processes, without Redis. Every request, retry and batch consumes the applicable budget. The accepted initial caps are:

| Data source | Initial global limit |
| --- | --- |
| OpenAlex | 25 requests/s |
| Crossref | 8 single-record requests/s; 2.5 searches/s; 3 concurrent requests |
| Semantic Scholar | 1 request/s; request a higher authorized allowance if needed |
| arXiv | 1 request per 3 seconds |
| Open Library | 3 requests/s |
| Europe PMC | 10 requests/s, self-imposed pending evidence |
| Internet Archive | 5 requests/s, self-imposed pending evidence |
| doi.org | 20 requests/s, self-imposed pending evidence |

These are configured caps, not a uniform 80% safety margin or vendor guarantees. Provider limits and Retry-After remain binding; do not evade them with extra keys or addresses. OpenAlex prepaid usage is the selected planning assumption; Crossref starts in the polite pool, with Metadata Plus conditional on measured need. Procurement, key provisioning and allowance applications are later execution work.

Schedule at most ten active References per Check, round-robin between eligible Checks. A Reference waiting for a source budget remains within its allotted execution/deadline; it cannot bypass the global limiter. Fairness and 500 possible active References do not prove throughput, memory safety or a ten-second first Verdict.

- Request timeout: three seconds, or five seconds for a URL request.
- At most one retry per failed call: only timeout, 5xx, or 429 with Retry-After at most two seconds. A retry must still respect the remaining deadline and provider budget; never shorten a provider-required cooldown to fit it.
- Hard deadline: thirty seconds per running Reference from its first worker execution, including rate waiting, calls, retry delay and remaining route work. A retry does not reset that clock. Record pre-execution queue time separately; it remains part of end-to-end Check duration and cannot be excluded from FA-UEB-42/43 evidence.
- At deadline, responsible sources still unqueried/uncompleted are unavailable for that run and are named, with reason `rate-budget` or `deadline` as appropriate. Do not silently skip them or convert a timeout into a confirmed no-match.
- If every applicable enabled source failed, the result is Not verifiable; billing and later Re-checks follow ADR-0005. Internal execution errors remain Status failed. Results after Check cancellation are discarded.

The three/fifteen-second means of FA-UEB-40/41 are measured targets, not per-Reference hard cutoffs. Budgets, timeouts, deadlines and concurrency that can affect retrieved evidence or Verdicts are part of the measured configuration. Run the quality gate and rate-limited load checks before activating changes; there is no blanket exemption for Operator settings. Replay must exercise the clock, waiting and limiter behavior, not merely return recorded metadata instantly.

## Identifier batching

- **arXiv:** collect direct identifier lookups across Checks and submit one `id_list` request per three-second opportunity; apply the API's supported batch bounds.
- **Semantic Scholar:** collect identifier lookups for at most 200 ms into batches of at most 500 identifiers, under its shared request budget. This batching primitive does not add another source after early termination or alter the selected source order.
- Batches contain only identifiers sent to their responsible Data source; demultiplex results to the correct Reference runs. Batch association with Owners/Checks is not disclosed. Waiting must respect individual deadlines and cancellation.

## Source permissions, cache and URL retrieval

Every Data source is an adapter with Operator-controlled enablement. Before launch use, establish paid-service usage rights and separate caching/fixture-storage permissions. Disabled is not failed: record it, exclude it from the active failure set and do not report it as an outage. Disabling a mandatory source is not a launch-compliance waiver; if clearance cannot be obtained, return the requirement to the client. Every enablement change is a quality-gate trigger.

Cache only source-origin metadata indexed by DOI, ISBN, PMID, arXiv ID or source-record identifier, without Owner/Check association. Do not cache user reference text or title/author search strings. Cache only where the source permits it; source terms can require stricter behavior than the common policy. Initial TTL is 24 hours, with no negative caching. A Re-check uses the same cache; expiry bounds local cache age, not the source's publication/update delay or successful refresh availability. Per-run Candidates and logs remain Check content and are deleted with it (ADR-0005).

Harden URL requests against SSRF: reject private/link-local/internal destinations, validate resolved addresses and each redirect, defend against DNS rebinding, bound response size and time, and send no credentials. Preserve only the agreed observation (status, redirect target and archive match); classification of 403, 429 and soft-404 belongs to Scoring. [ADR-0015](0015-security-abuse-protection.md), accepted on 25 October 2026, adds HTTP/HTTPS-only untrusted retrieval, at most five redirects and a 5 MiB response ceiling on the wire and after decompression. Existing timeouts/deadlines remain; qualify enforcement and resource behavior in the security profile. A safety/size refusal is incomplete evidence, never successful proof of nonexistence. Outcome-affecting settings retain the existing Quality gate and performance protocol.

## Retraction and search evidence

The retraction marker belongs to the Best match, independently of the Verdict. An affirmative report from Crossref/Retraction Watch, OpenAlex or Europe PMC is sufficient to mark that Source, with provenance. Do not treat an unavailable or absent retraction field as a verified negative.

F18 supersedes F16's proposed extra OpenAlex DOI lookup: after an unambiguous match, query no additional source, including for retraction enrichment. Use only evidence already received or available in a permitted cache. Unknown retraction evidence stays unknown; it must not become a verified negative. This preserves FA-SUC-06 without claiming that the optional retraction checks are complete for every Source.

The search log is versioned Check content, not operational telemetry. Record:

- each routed source's outcome: match; no unambiguous match with candidate count; failed with timeout/error/rate-budget/deadline reason; skipped after early termination; or Operator-disabled;
- each call's kind (identifier, combined, title-only, authors/year), duration, outcome, candidate count and cache hit;
- source observations, retrieved Candidates, failed sources and retraction provenance needed to replay the result;
- the Search strategy version, alongside the Scoring rules version on the run.

Emit per-Reference progress identifying the current source. Check content follows ADR-0005 deletion and consent rules; operational logs remain content-free. Fixture recording/replay additionally requires each source's storage rights and ADR-0006's private-dataset protocol.

## Performance evidence and activation gates

Use the live EU-region FA-UEB-40/41/42 sets from ADR-0006, with Check time beginning after Structuring at automatic Check start. Measure live before releases changing search, sources, concurrency or hosting, and monthly with the drift run. Run the fifty-Check replay load exercise on every release, with the actual global limiter and recorded source latency.

F20 adds a live fifty-Check load test before launch under the approved acceptance workload and provider terms, respecting the shared limits. Repeat live validation after material capacity/configuration changes. Replay remains regression evidence, not a substitute for the live FA-UEB-43 acceptance result. A limiter makes the traffic compliant; it does not make the target feasible. If validation fails, revise capacity or routing and rerun the gates; any relaxation of the required targets needs an explicit client-approved specification change.

Neither replay nor prepaid credits proves live supplier throughput. For 50 × 100 References in 180 seconds, the required completion rate is about 27.78 References/s. An ambiguous no-cache route with one combined plus two fallback queries costs up to three requests **per source**. The starting budgets therefore need an explicit capacity/quality validation, not a claim that I/O concurrency makes the requirements hold. Waiting until deadline and producing unavailable-source results is not evidence of successful coverage or the required quality.

For scale, 5,000 no-match References each requiring one Crossref search consume about 2,000 seconds at 2.5 requests/s; three searches each consume about 6,000 seconds. These are conditional arithmetic lower bounds, not measurements or a claim about every mixed acceptance list. Prepaid credits and ten active References per Check do not establish live supplier capacity.

## Consequences and handoff

- **Bounded evidence under load:** rate waiting and deadlines can make a source unavailable. Record that loss of coverage and apply the explicit failure rules; do not treat it as a successful empty response or claim it proves performance/quality acceptance.
- **[Scoring and verdict rules](https://github.com/jeffnawroth/source-taster/issues/17):** define unambiguous-match criteria, mixed-citation/DOI/outside-coverage precedence, ties, URL-status interpretation and retraction title-prefix normalization under the fixed source order and common Candidate budget. Reconcile identifier evidence with the 1 + 2 + 2 bibliographic allocation without exceeding the cap.
- **[Non-AI structuring approach](https://github.com/jeffnawroth/source-taster/issues/20):** map canonical CSL types and normalized identifiers to the routes; do not infer native arXiv-ID lookup from arXiv DOI support.
- **[Hosting and operations](https://github.com/jeffnawroth/source-taster/issues/22):** qualify global budgets, process/connection/memory capacity, fair scheduling, clock/deadline behavior, SSRF/response-size bounds and cancellation under real load; implement the recorded replay/live cadence and observe incomplete source coverage.
- **[Operator tools without a dedicated interface](https://github.com/jeffnawroth/source-taster/issues/24):** enforce source-rights/enablement and exact measured-configuration gates for outcome-affecting settings; obtain required keys, prepaid credits and approved rate increases during execution, without bypassing provider limits.
- **Source rights and acceptance:** endpoint compatibility, source terms, fixture/cache permissions and latency distributions require actual evidence. The approved requirements remain unchanged; provider clearance, load tests and corpus/harness implementation remain outside this decision.
