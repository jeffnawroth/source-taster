---
status: proposed
---

# Route References sequentially with shared source budgets and bounded search time

This draft records the client's accepted rounds F1–F17 in [Search strategy and latency budget](https://github.com/jeffnawroth/source-taster/issues/16). It builds on [ADR-0003](0003-system-architecture.md), [ADR-0005](0005-check-reference-lifecycle.md) and [ADR-0006](0006-reference-test-set-quality-gate.md). Search is sequential across Data sources within a Reference and concurrent across References, so it can stop before querying another source when scoring establishes an unambiguous match.

The design remains **proposed** while the contradictions and validation decisions at the end are resolved. No implementation, source-terms clearance, capacity measurement or requirements amendment is claimed. Numeric limits below are initial operating settings, subject to provider terms and measurement; they are not evidence that the performance requirements have been met.

## Routing and source order

The routing key is the Reference's canonical CSL `type` (ADR-0005). Exact CSL type lists are aligned with [Non-AI structuring approach](https://github.com/jeffnawroth/source-taster/issues/20).

- **Articles, conference papers, preprints, reports and theses:** OpenAlex, Crossref, Europe PMC and Semantic Scholar; direct arXiv access is identifier-only. Unknown/other types take this route.
- **Books and chapters:** Open Library and Google Books ISBN catalogs, OpenAlex and Crossref.
- **Web pages and blog posts:** URL reachability and Internet Archive, plus the DOI path when a DOI is supplied.
- **Outside coverage:** laws, judgments, archival records and personal communications receive Not verifiable without a coverage search. The boundary with the mandatory supplied-DOI rule must not be silently redefined.

**Identifier-first precedence:** for a covered Reference with a supplied DOI, resolve its existence through the registration-agency-neutral doi.org Handle API before the route's other work, including the book/web routes. Retrieve bibliographic metadata through OpenAlex/Crossref. Crossref's absence alone does not establish DOI non-existence. A definitive DOI conflict does not stop candidate retrieval by title/authors; an unavailable resolver is a failure, not evidence of an invalid DOI. Verdict derivation remains with [Scoring and verdict rules](https://github.com/jeffnawroth/source-taster/issues/17).

Initial order after that precedence:

1. **Article route:** DOI metadata via OpenAlex; PMID/PMCID via OpenAlex where the exact identifier operation is supported, otherwise Europe PMC; arXiv identifier via a supported indexed lookup, otherwise a batched direct arXiv lookup. Then bibliographic searches: OpenAlex → Crossref `query.bibliographic` → Europe PMC → Semantic Scholar.
2. **Book route:** ISBN lookup Open Library → Google Books; bibliographic searches OpenAlex → Crossref → Open Library → Google Books.
3. **Web route:** URL request → Internet Archive lookup, after mandatory DOI handling where applicable.

An arXiv DOI lookup must not be presented as proof that OpenAlex accepts a native arXiv ID. The official [OpenAlex singleton documentation](https://github.com/ourresearch/openalex-docs/blob/main/api-entities/works/get-a-single-work.md#external-ids) lists DOI, MAG, PMID and PMCID, but not native arXiv IDs; its current endpoint behavior still needs validation. For a native identifier without a supported indexed lookup, take the approved direct arXiv fallback rather than inventing an OpenAlex endpoint or counting a capability limitation as an outage. Direct arXiv title search is excluded from the accepted plan because its shared request budget is too small for the intended load.

## Candidate retrieval and early termination

Score a source's Candidates before advancing to another source. The initial FA-SUC-03 cap is five Candidates per Data source. If a combined bibliographic query does not establish an unambiguous match, additionally query by title alone and by authors plus year. These two queries may run concurrently within the **same** source, still consuming its global budget.

Merge the query evidence for scoring and Mixed citation detection. The queries can return more than five distinct upstream records, so selection under the per-source cap needs the decision below; five per query is not silently substituted. Scoring and verdict rules owns unambiguous-match/early-termination thresholds, DOI-conflict precedence (including outside-coverage cases), score ties and treatment of `RETRACTED: ` title prefixes. Search-strategy order/version and source enablement changes are gate triggers under ADR-0006.

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

The three/fifteen-second means of FA-UEB-40/41 are measured targets, not per-Reference hard cutoffs. Budget-change gating is unresolved below.

## Identifier batching

- **arXiv:** collect direct identifier lookups across Checks and submit one `id_list` request per three-second opportunity; apply the API's supported batch bounds.
- **Semantic Scholar:** collect identifier lookups for at most 200 ms into batches of at most 500 identifiers, under its shared request budget. This batching primitive does not add another source after early termination or alter the selected source order.
- Batches contain only identifiers sent to their responsible Data source; demultiplex results to the correct Reference runs. Batch association with Owners/Checks is not disclosed. Waiting must respect individual deadlines and cancellation.

## Source permissions, cache and URL retrieval

Every Data source is an adapter with Operator-controlled enablement. Before launch use, establish paid-service usage rights and separate caching/fixture-storage permissions. Disabled is not failed: record it, exclude it from the active failure set and do not report it as an outage. Disabling a mandatory source is not a launch-compliance waiver; if clearance cannot be obtained, return the requirement to the client. Every enablement change is a quality-gate trigger.

Cache only source-origin metadata indexed by DOI, ISBN, PMID, arXiv ID or source-record identifier, without Owner/Check association. Do not cache user reference text or title/author search strings. Cache only where the source permits it; source terms can require stricter behavior than the common policy. Initial TTL is 24 hours, with no negative caching. A Re-check uses the same cache; expiry bounds local cache age, not the source's publication/update delay or successful refresh availability. Per-run Candidates and logs remain Check content and are deleted with it (ADR-0005).

Harden URL requests against SSRF: reject private/link-local/internal destinations, validate resolved addresses and each redirect, defend against DNS rebinding, bound response size and time, and send no credentials. Preserve only the agreed observation (status, redirect target and archive match); classification of 403, 429 and soft-404 belongs to Scoring. Exact response-size/resource limits must be qualified before implementation/acceptance; none is invented here.

## Retraction and search evidence

The retraction marker belongs to the Best match, independently of the Verdict. An affirmative report from Crossref/Retraction Watch, OpenAlex or Europe PMC is sufficient to mark that Source, with provenance. Do not treat an unavailable or absent retraction field as a verified negative.

Round F16 also accepted an extra OpenAlex DOI lookup when a Best match lacks retraction data. Its interaction with FA-SUC-06's no-further-source rule remains unresolved below; this draft does not silently grant an enrichment exception.

The search log is versioned Check content, not operational telemetry. Record:

- each routed source's outcome: match; no unambiguous match with candidate count; failed with timeout/error/rate-budget/deadline reason; skipped after early termination; or Operator-disabled;
- each call's kind (identifier, combined, title-only, authors/year), duration, outcome, candidate count and cache hit;
- source observations, retrieved Candidates, failed sources and retraction provenance needed to replay the result;
- the Search strategy version, alongside the Scoring rules version on the run.

Emit per-Reference progress identifying the current source. Check content follows ADR-0005 deletion and consent rules; operational logs remain content-free. Fixture recording/replay additionally requires each source's storage rights and ADR-0006's private-dataset protocol.

## Performance evidence and unresolved decisions

The accepted measurement plan uses live EU-region FA-UEB-40/41/42 sets from ADR-0006, with Check time beginning after Structuring at automatic Check start. Measure live before releases changing search, sources, concurrency or hosting, and monthly with the drift run. Run the fifty-Check replay load exercise on every release, with the actual global limiter and recorded source latency.

Neither replay nor prepaid credits proves live supplier throughput. For 50 × 100 References in 180 seconds, the required completion rate is about 27.78 References/s. An ambiguous no-cache route with one combined plus two fallback queries costs up to three requests **per source**. The starting budgets therefore need an explicit capacity/quality validation, not a claim that I/O concurrency makes the requirements hold. Waiting until deadline and producing unavailable-source results is not evidence of successful coverage or the required quality.

The following decisions must be confirmed before this ADR is accepted:

1. **Early termination versus enrichment:** keep FA-SUC-06 strict and use already obtained/permitted cached retraction evidence without another source lookup, or request an explicit enrichment exception from the client. Do not silently redefine an extra source query as something outside the acceptance criterion.
2. **Budget/deadline configuration versus the gate:** reconcile F11's ungated operating-budget changes with ADR-0006, because changed waits/deadlines can change candidate coverage and Verdicts. Proposed correction: include outcome-affecting budgets/timeouts/concurrency in the measured configuration and run the quality and rate-limited load checks before activating changes.
3. **Live-load acceptance:** replay is reproducible regression evidence, not a measured fifty-Check live result. Proposed correction: retain replay on every release and add an authorized, rate-limited live fifty-Check launch test; revalidate live after relevant capacity/configuration changes. Keep any unattainable FA-UEB-43 target as a client change request rather than a silent downgrade or an assertion that live traffic must exceed source limits. For scale, 5,000 no-match References each requiring one Crossref search consume about 2,000 seconds at 2.5 requests/s; three searches each consume about 6,000 seconds. These are conditional arithmetic lower bounds, not measurements or a claim about every mixed acceptance list.
4. **Candidate selection across queries:** proposed correction: deduplicate records with the same source-record identifier, then take at most five in deterministic round-robin order across the combined, title-only and authors/year result lists, respecting each list's provider ordering. The adapter emits only that retained selection for project scoring and display; replay fixtures can preserve the raw responses where licensed. This gives every available query branch a place without first-five-wins or scoring fifteen Candidates under a nominal cap of five. Measure the resulting mixed-citation recall; any change to the selection rule triggers the gate. No recall guarantee is claimed.

Implementation endpoint compatibility, latency distributions, fairness, cancellation under load, precise Candidate selection and source-rights evidence remain validation/handoff items. The approved requirements remain unchanged.
