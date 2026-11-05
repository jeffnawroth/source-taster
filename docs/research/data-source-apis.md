# Research: Data source APIs

*Research ticket: [#5 Data source APIs](https://github.com/jeffnawroth/source-taster/issues/5) · Decision map: [#4](https://github.com/jeffnawroth/source-taster/issues/4) · Research date: 2026-10-24*

> Status: complete (2026-10-24). Facts are cited by label; see References. Spot checks are single requests, not measurements.

## Question

Which current APIs and usage terms can meet the data source coverage in section 7 and the performance targets FA-UEB-40 to FA-UEB-43 of the [requirements specification](../requirements-specification.md)? This note delivers evidence and a capability matrix; it does not select the final search strategy.

## Notes per data source

### OpenAlex

Verified facts:

- **Access and authentication.** Basic queries work without a key; a free API key (email-verified) raises the daily budget tenfold and is required for cursor paging past the first page. [OA-auth]
- **Usage-based pricing.** Free key: USD 1.00 of usage per day; without a key: USD 0.10 per day (one tenth). Budget resets at midnight UTC. [OA-auth] [OA-pricing] [OA-costs]
- **Cost per call type (per 1,000 calls).** Get single entity by ID or DOI: free; list + filter: USD 0.10; full-text keyword search: USD 1; semantic search: USD 1; content (PDF) download: USD 10. So the free USD 1/day buys about 1,000 keyword searches or 10,000 filter calls per day, while ID/DOI lookups are free. [OA-costs]
- **Paid options.** Prepaid pay-as-you-go in USD 1 increments (expires 3 months after the last purchase); annual plans Member USD 5,000/year (USD 20/day budget), Member+ USD 10,000/year (USD 100/day), Partner from USD 20,000/year (USD 200+/day). No SLA is mentioned. [OA-pricing]
- **Per-second rate limits.** No key: 10 req/s; free key or prepaid: 30 req/s; annual plan: 50 req/s. Semantic search: 1 req/s. Queries with more than 5 Boolean operators: 1 / 5 / 25 req/s by tier. Exceeding either the daily budget or the per-second limit returns HTTP 429; per-second 429s cost nothing. Usage headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Credits-Used`, `X-RateLimit-Reset`. [OA-auth]
- **Lookup.** Single works by DOI (`/works/doi:…` or full DOI URL) and by PMID (`/works/pmid:…`); the page does not list PMCID or arXiv ID as lookup keys. [OA-single]
- **Search.** `search.title`, `search.title_and_abstract`, `search.title_abstract_keywords` (each with `.exact`), Boolean `AND/OR/NOT`, phrase quotes, fuzzy terms `~0..2`, proximity; `search.semantic` cannot be combined with other search parameters. The older `filter=title.search:` syntax is deprecated but still works. List pages default to 25 results, max 100. [OA-search] [OA-ref]
- **Metadata fields relevant to scoring (section 8.2).** `doi`, `ids` (incl. `pmid`, `pmcid`, `mag`), `biblio` (volume, issue, first_page, last_page), `authorships`, `publication_date` (ISO 8601), `primary_location.source` (journal), `type`. [OA-work]
- **Retraction coverage.** `is_retracted`: "True if the work is known to be retracted, per the Retraction Watch database." [OA-work] A peer-reviewed analysis documented misclassification of `is_retracted` between 22 Dec 2023 and 19 Mar 2024, when any update notice flagged a work as retracted. [Hauschke-2024]
- **License.** Data released under CC0; no "personal use only" restriction; the pricing page does not restrict commercial use. [OA-pricing] Corpus size stated as "300M+ works". [OA-ref]

Unknowns / to measure:

- Latency of `/works/doi:` and `search.title` from an EU host (no published latency figures found).
- Whether a filter-based batch DOI lookup (`filter=doi:a|b|…`) is billed as "list + filter" and its value limit (not stated on the single-entity page). [OA-single]
- Whether the `is_retracted` classification is currently accurate (FA-SUC-09 acceptance test).

### Crossref

Verified facts:

- **Pools and authentication.** Public pool (no identification), polite pool (`mailto` parameter or `agent` header), Metadata Plus (paid subscription, API key header `Crossref-Plus-API-Token`). Limits are exposed in `x-rate-limit-limit`, `x-rate-limit-interval` and `x-concurrency-limit` headers; excess returns 429, blocked clients get 403. The access page lists Public 5 / concurrency 1, Polite 10 / concurrency 3, Metadata Plus 150 / no concurrency limit. [CR-access]
- **Split limits for single records versus lists.** Since 1 Dec 2025: public pool 5 req/s single-record lookups and 1 req/s list/query requests, each with concurrency 1; polite pool 10 req/s single-record and 3 req/s list/query, concurrency 3. [CR-limits-2025] A forum notice of 21 Jul 2026 confirms list-returning requests (queries and filters) at 1 req/s public and 3 req/s polite; single-record lookups unchanged at 5 and 10. [CR-limits-2026]
- **Reason.** Requests tripled in five years, records grew from 120 to about 180 million, and Crossref reports "periods of instability"; Metadata Plus is recommended for production services ("more stability, support, and access to monthly snapshots"). [CR-limits-2025]
- **Metadata Plus pricing and SLA** are not stated on the access page. [CR-access]
- **Search.** `/works` supports `query.bibliographic` ("useful for citation look up, includes titles, authors, ISSNs and publication years"), `query.title`, `query.author`, `query.container-title` and others; sorting by `score` (descending default); list requests return up to 1,000 items, default 20. [CR-swagger] [CR-tips] DOI lookups are single-record requests (`/works/{doi}`). [CR-limits-2025]
- **Retraction coverage.** Retraction Watch data is in the production REST API: retractions appear in the `update-to` field with a `source` of `publisher` or `retraction-watch`; filter `update-type:retraction`. The Retraction Watch database is updated every working day; a CSV copy is in a Crossref GitLab repository. Expressions of concern and corrections are included but "not as comprehensive as retractions". [CR-RW] Crossref's forum example shows the retraction on the retracted work's record as `updated-by` with `source: retraction-watch` and the Labs integration was deprecated after the January 2025 production schema. [CR-RW-forum] [CR-labs-deprecation]
- **License and commercial use.** Bibliographic metadata including references: "Facts, not subject to copyright"; Crossref-generated data and the Retraction Watch database: CC0; abstracts: copyright of publisher or author. "Almost all of the metadata we hold is reusable without restriction." [CR-retrieve]
- **Caching.** Crossref asks clients to cache responses and avoid repeated identical requests; "most metadata fields rarely change". [CR-tips] [CR-limits-2025]

Unknowns / to measure:

- Metadata Plus price and any SLA (not on public pages consulted; requires a sales enquiry).
- Latency of `query.bibliographic` versus DOI lookup (no published figures).
- Polite-pool concurrency: the access page and the 2025 announcement say 3; a community forum note seen only as a search snippet (https://community.crossref.org/t/updates-to-rest-api-rate-limits/14872, not fetched) mentions 5. Read the live `x-concurrency-limit` header.

### Semantic Scholar (Academic Graph API)

Verified facts:

- **Authentication and rate limits.** Most endpoints work without a key but are "rate-limited to 1000 requests per second shared among all unauthenticated users" and "may also be further throttled during periods of heavy use". Keys are requested via a form; "The introductory rate limit for an API key is 1 RPS on all endpoints"; higher limits are not quantified. [S2-overview]
- **Lookup.** `/paper/{id}` accepts `DOI:`, `ARXIV:`, `PMID:`, `PMCID:`, `MAG:`, `ACL:`, `CorpusId:` and `URL:` (for semanticscholar.org, arxiv.org, aclweb.org, acm.org, biorxiv.org URLs). `/paper/batch` accepts up to 500 IDs per call. [S2-swagger]
- **Search.** `/paper/search/match` returns only the single closest title match (404 on no match); `/paper/search` returns up to 1,000 relevance-ranked results, `limit` ≤ 100; `/paper/search/bulk` up to 1,000 per call. Responses are capped at 10 MB. [S2-swagger]
- **Metadata fields.** `externalIds` (ArXiv, MAG, ACL, PubMed, Medline, PubMedCentral, DBLP, DOI), `title`, `authors`, `year`, `venue`, `journal` (name, volume, pages), `publicationDate`, `publicationTypes`. [S2-swagger]
- **Retraction coverage.** No retraction field was found in the portion of the API specification read (the last ~19 % of the specification was not read). [S2-swagger]
- **License terms (API License Agreement, last updated 17 May 2023).** Requires attribution to "Semantic Scholar" on the licensee's website or published materials; prohibits repackaging, selling, distributing or sublicensing the API; forbids exceeding or circumventing limits; use is "at will" and may be terminated by AI2 "any time for any reason"; S2 Data is "separately governed by the licenses that accompany such S2 Data", naming CC BY-NC or ODC-BY as examples. The agreement does not address commercial use or caching explicitly. [S2-license]

Unknowns / to measure:

- **Commercial use is unresolved.** Which data license (CC BY-NC versus ODC-BY) attaches to Graph API responses used inside a paid product is not stated; needs written confirmation from AI2 before market launch.
- Whether AI2 grants a key rate above 1 RPS for a commercial product, and on what terms.
- Real behaviour of the shared unauthenticated pool under load (third-party reports describe uneven throttling and HTTP 500 responses; not a primary source). [S2-casrai]
- Retraction status: absent unless found in the unread part of the specification.

### Europe PMC

Verified facts:

- **Service.** RESTful web service at `https://www.ebi.ac.uk/europepmc/webservices/rest/`; `resultType` `idlist`, `lite` (default) or `core` (full metadata incl. abstract, full-text links, MeSH). No API key is mentioned; use implies acceptance of the Privacy Notice. Europe PMC is an ELIXIR Core Data Resource. The developer page states no rate limit and no metadata license. [EPMC-dev]
- **Paging.** Default page size 25, maximum 1,000 per page (EMBL-EBI training slides, 2020). [EPMC-slides]
- **Terms (EMBL-EBI Terms of Use, updated 14 Oct 2026).** EMBL-EBI "places no additional restrictions" on data beyond those of the original data owners; original data "may be subject to rights claimed by third parties"; use that prevents or is likely to prevent others' use may be blocked "at its sole discretion, without prior notice"; services are provided "AS IS" with no responsibility for discontinuity. Commercial use and caching are not explicitly addressed. [EBI-terms]
- **Spot check (single request, 2026-10-24, not a latency measurement).** `search?query=EXT_ID:9500320 AND SRC:MED&resultType=core&format=json` returned HTTP 200 in 0.19 s from the researcher's machine; the record for the retracted Wakefield 1998 paper carries `pubTypeList.pubType` = "Retracted Publication" and a `commentCorrectionList`. Available keys include `doi`, `pmid`, `authorList`, `journalInfo`, `pageInfo`, `pubYear`, `firstPublicationDate`. This shows retraction status is exposed for MEDLINE records via publication type; coverage for non-MEDLINE records is not established.

Unknowns / to measure:

- The full search-syntax guide and the Web Service Reference Guide PDF (`europepmc.org/docs/EBI_Europe_PMC_Web_Service_Reference.pdf`) returned HTTP 403 to automated fetching; field list (`DOI:`, `TITLE:`, `AUTH:` etc.) should be confirmed manually.
- No published rate limit: the safe sustained request rate has to be agreed with Europe PMC helpdesk or measured cautiously.

### arXiv

Verified facts:

- **Rate limit (Terms of Use for arXiv APIs).** "make no more than one request every three seconds, and limit requests to a single connection at a time", applying "to all of the machines under your control as a whole". [AX-tou] The user manual repeats a 3-second delay between repeated calls. [AX-manual]
- **No authentication** is described. [AX-manual]
- **Lookup and search.** `id_list` for arXiv IDs (with optional version `vN`); `search_query` with field prefixes `ti:`, `au:`, `abs:`, `cat:`, `all:`, Boolean `AND/OR/ANDNOT`, phrases in quotes. Default 10 results, max 2,000 per slice and 30,000 per query. [AX-manual]
- **Metadata fields.** Title, abstract, authors (optional affiliation), `published` (date of v1), `updated`, `arxiv:journal_ref`, `arxiv:doi`, categories, comment. [AX-manual]
- **Caching.** Results change only when new articles are added; the manual advises caching and not repeating the same query more than once a day. [AX-manual]
- **License and commercial use.** Descriptive metadata is CC0 ("free to use … under the terms of the Creative Commons Universal (CC0 1.0)"); e-print content may be used "for your own personal use, or for research purposes", and storing/serving e-prints from own servers is prohibited without permission; the project may not be represented as endorsed by arXiv. Commercial use of the API is not explicitly addressed. [AX-tou]
- **Retraction coverage.** No retraction or withdrawal field is listed among the returned fields. [AX-manual]
- **Batch lookup (spot check, 2026-10-24).** `export.arxiv.org/api/query?id_list=1706.03762,1810.04805` returned both entries in one request (HTTP 200 after a redirect to HTTPS), so identifier lookups can be batched; only searches without an identifier need one request each.

Unknowns / to measure:

- Whether arXiv permits a higher rate for a commercial service (no process documented on the pages read).
- How withdrawn arXiv versions appear in the API (not documented on the pages read).

### Book catalogs via ISBN: Open Library

Verified facts:

- **Rate limits.** Non-identified requests: "1 request per second"; identified requests (User-Agent with app name and contact email): "3 requests per second". [OL-api]
- **Commercial use.** The APIs are not meant to be "a bulk data backend or high-traffic commercial infrastructure"; using Open Library as a backend for high-traffic commercial services is listed under "Please Do Not", and violations may lead to blocking. Bulk metadata download via the API is discouraged; monthly data dumps are offered instead. [OL-api]
- **Lookup.** `/isbn/{isbn}.json` (ISBN-10 or ISBN-13) redirects to the edition record. The legacy Books API `/api/books?bibkeys=ISBN:…,ISBN:…&jscmd=data&format=json` batches several identifiers in one call and returns `title`, `subtitle`, `authors`, `publishers`, `publish_date`, `number_of_pages`, `identifiers`; it "is legacy and may be phased out", with the Book Search API recommended instead. [OL-books]
- **Search.** A Book Search API (`search.json`) is listed and recommended over many single-book requests. [OL-api]

Unknowns / to measure:

- Data license of Open Library records (the developer page links to a licensing page but states no terms). [OL-api]
- Whether "high-traffic commercial" applies at Source Taster's expected volume; requires asking openlibrary@archive.org (contact named on the page). [OL-api]
- Book chapter coverage (Open Library is edition-level; no chapter records described).

### Book catalogs via ISBN: Google Books

Verified facts:

- **Authentication.** Requests for public data "must be accompanied by an identifier" (API key or OAuth token). [GB-using]
- **Search and lookup.** `q=` with `isbn:`, `intitle:`, `inauthor:`, `inpublisher:`, `subject:`, `lccn:`, `oclc:`; `maxResults` default 10, max 40. `volumeInfo` includes title, authors, publisher, publishedDate, pageCount, industryIdentifiers (ISBN-10/13). "API results are restricted based on your server or client application's IP address." [GB-using]
- **Terms (Books API Terms of Service, last modified 25 Apr 2012).** "You may not charge users any fee for the use of your application" unless there is a separate agreement with Google. [GB-terms]

Unknowns / to measure:

- **Commercial use is a blocker without a separate agreement**: Source Taster charges for check packs and Pro (section 2.3), so the "no fee" clause needs a legal reading or a Google agreement before Google Books can be used in paid plans (FA-UEB-23 legal review). [GB-terms]
- Daily quota: commonly reported as about 1,000 requests/day by default, but no primary source was found; check the project's Cloud console quota page. [GB-quota-forum]
- Effect of IP-based restrictions when calling from an EU server (FA-UEB-13 hosting).

### Web sources: URL reachability and Internet Archive

URL reachability is not a third-party API: the system requests the cited URL itself. Relevant HTTP semantics: `HEAD` is identical to `GET` except that the server does not send content [RFC9110-HEAD]; a server may reject a method with `405 Method Not Allowed` [RFC9110-405], so a `GET` fallback is needed. Cited sites are arbitrary third parties; their rate limits, bot protection and terms are unknowable in advance (measurement needed on the reference test set's web sources, 14.4).

Internet Archive, verified facts:

- **Availability API.** `https://archive.org/wayback/available?url=…[&timestamp=YYYYMMDDhhmmss]` returns `archived_snapshots.closest` (`available`, `url`, `timestamp`, `status`) or an empty object. The Wayback Machine is "fully compliant with the Memento Protocol". The page dates from 2013 and gives no rate limits, authentication or terms. [IA-wayback-api]
- **CDX server.** `http://web.archive.org/cdx/search/cdx?url=…` with `matchType`, `limit`, `from`/`to`, `filter`, `fl`, `output=json`, `collapse`, resume keys; default server-side maximum 150,000 results per query; marked "BETA", changelog from 2013; no rate-limit statement. [IA-cdx]
- **Current throttling.** On 15 Sep 2026 the Internet Archive reported "waves of high-volume automated traffic", added protections and rewrote its HTTP 429 block message; no thresholds are published and the protections "sometimes catch real people by mistake". Appeals go to info@archive.org. [IA-blog-2026]
- **Generic 429 semantics** in Internet Archive developer docs (REST microservices): 429 means rate limiting over a period; a `Retry-After` header may be included. [IA-iarest]

Unknowns / to measure:

- **No published rate limit** for Availability or CDX; user reports (forums, 2019 and 2026) mention 15 requests/minute caps for Save Page Now and unexplained 429s on normal access; anecdotal, not policy. [IA-forum-15]
- **Terms of use** could not be read: `archive.org/about/terms.php` is rendered client-side and returned no text to automated fetching; commercial use of Wayback lookups is unresolved.
- Latency of the Availability API from an EU host.

### Cross-cutting spot checks (single requests, 2026-10-24)

These are single unauthenticated requests from the researcher's machine, without `mailto`. They confirm field behaviour; the timings are **not** latency evidence for FA-UEB-40 to FA-UEB-43.

| Request | Result |
| --- | --- |
| `api.crossref.org/works/10.1016/S0140-6736(97)11096-0` (retracted Wakefield 1998) | HTTP 200, 0.40 s. Retraction is in `updated-by` (not `update-to`) with `type: retraction`, `source: retraction-watch`, `record-id: 4036`; a 2004 correction is also listed. The title carries the prefix "RETRACTED: ". |
| `api.openalex.org/works/doi:10.1016/S0140-6736(97)11096-0` | HTTP 200, 0.36 s. `is_retracted: true`; title also prefixed "RETRACTED: ". |
| `api.crossref.org/works/10.48550/arXiv.1706.03762` (arXiv DOI) | HTTP 404: Crossref does not know this DOI. |
| `doi.org/ra/10.48550` | Registration agency of the arXiv DOI prefix is DataCite. |
| `doi.org/api/handles/10.48550/arXiv.1706.03762` versus a made-up suffix | HTTP 200 versus HTTP 404: the DOI resolver distinguishes existing from non-existing DOIs regardless of registration agency. |
| `api.openalex.org/works/doi:10.48550/arXiv.1706.03762` | HTTP 200: OpenAlex resolves the DataCite arXiv DOI. |

So the Crossref documentation's `update-to` wording [CR-RW] describes the notice record; the retracted work itself carries `updated-by`, matching the forum example [CR-RW-forum].

## Capability matrix

"n/s" = not stated in the primary sources read. Rates are per identified client (key, `mailto` or User-Agent) unless noted.

| Data source | Identifier lookup | Bibliographic search | Retraction signal | Auth | Documented rate limit | Commercial use | Caching / storage | Published latency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OpenAlex | DOI, PMID (free calls) [OA-single] [OA-costs] | `search.title` etc., fuzzy, Boolean, semantic; max 100/page [OA-search] [OA-ref] | `is_retracted` from Retraction Watch [OA-work] | Optional free key; key ×10 budget [OA-auth] | 10 / 30 / 50 req/s by tier; USD 0.10 / 1 per day free; search USD 1 per 1,000 [OA-auth] [OA-costs] | CC0 data; no commercial restriction stated [OA-pricing] | Not restricted (CC0) [OA-pricing] | n/s |
| Crossref | DOI [CR-limits-2025] | `query.bibliographic`, `query.title`, `query.author`; score sort [CR-swagger] | `updated-by` / `update-to` with `source: retraction-watch`; daily RW updates [CR-RW] | None; `mailto` for polite; paid Metadata Plus token [CR-access] | Single: 5 (public) / 10 (polite) req/s; list/query: 1 / 3 req/s; concurrency 1 / 3; Plus 150 [CR-limits-2025] [CR-limits-2026] [CR-access] | Facts / CC0, except abstracts [CR-retrieve] | Caching requested [CR-tips] | n/s |
| Semantic Scholar | DOI, arXiv, PMID, PMCID, MAG, ACL, URL; batch 500 [S2-swagger] | `/paper/search/match` (single best title match), `/paper/search` (limit ≤ 100) [S2-swagger] | None found [S2-swagger] | Optional key by application [S2-overview] | Key: 1 RPS introductory; no key: 1000 RPS shared by all, extra throttling [S2-overview] | **Unresolved**: data under "CC BY-NC or ODC-BY"; attribution required; no circumventing limits [S2-license] | n/s [S2-license] | n/s |
| Europe PMC | PMID via `EXT_ID`/`SRC` (spot check); DOI field not verified | Query syntax; `lite`/`core`; max 1,000/page [EPMC-dev] [EPMC-slides] | `pubType` "Retracted Publication" for MEDLINE records (spot check) | None stated [EPMC-dev] | n/s; blocking of excessive use at EBI's discretion [EBI-terms] | No additional EBI restriction; third-party rights possible [EBI-terms] | n/s | n/s |
| arXiv | `id_list` with versions [AX-manual] | `ti:`, `au:`, `abs:`, Boolean [AX-manual] | None listed [AX-manual] | None [AX-manual] | 1 request / 3 s, single connection, across all machines [AX-tou] | Metadata CC0; content personal/research only [AX-tou] | Cache; same query ≤ once a day [AX-manual] | n/s |
| Open Library | `/isbn/{isbn}.json`; batch via legacy Books API [OL-books] | `search.json` [OL-api] | n/a | None; User-Agent + email for higher rate [OL-api] | 1 req/s anonymous, 3 req/s identified [OL-api] | **Restricted**: not for "high-traffic commercial infrastructure" [OL-api] | Bulk via dumps, not API [OL-api] | n/s |
| Google Books | `q=isbn:` [GB-using] | `intitle:`, `inauthor:`; max 40 [GB-using] | n/a | API key or OAuth required [GB-using] | n/s in docs; ~1,000/day reported (unverified) [GB-quota-forum] | **Restricted**: "may not charge users any fee" without separate agreement [GB-terms] | n/s | n/s |
| URL reachability | n/a (direct HTTP `HEAD`/`GET`) [RFC9110-HEAD] | n/a | n/a | n/a | Per target site, unknown | Per target site | n/a | n/s |
| Internet Archive | Availability API by URL + timestamp; CDX [IA-wayback-api] [IA-cdx] | n/a | n/a | None stated | n/s; undisclosed 429 protections since Sep 2026 [IA-blog-2026] | **Unresolved** (terms page not machine-readable) | n/s | n/s |

No data source publishes latency figures or an SLA on the pages read; FA-UEB-40 to FA-UEB-43 can therefore only be verified by measurement.

## Load at 50 concurrent checks (derived, not measured)

Assumptions (from the requirements, not from measurement): a check is a run over a set of references (GLOSSARY); FA-UEB-42 sizes a list at 100 references finished in at most 180 s; FA-UEB-43 requires this with 50 concurrent checks. Worst-case aggregate demand is therefore 50 × 100 = 5,000 references in 180 s ≈ **28 references per second**. Each reference triggers at least one call: an identifier lookup first (FA-SUC-02), a DOI resolution whenever a DOI is given (FA-ABG-14), then searches in the responsible data sources until early termination (FA-SUC-06). Not-found references (FA-UEB-41, up to 15 s) are the worst case because they query every responsible source.

| Documented ceiling | Share of 28 references/s if each reference needs one such call | Note |
| --- | --- | --- |
| OpenAlex free key, 30 req/s [OA-auth] | ~107 % | Fits only if each reference needs ≤ 1 search; 5,000 searches cost USD 5, i.e. five days of the free USD 1/day budget [OA-costs]; ID lookups are free. |
| Crossref polite single-record, 10 req/s [CR-limits-2025] | ~36 % | DOI lookups only. |
| Crossref polite list/query, 3 req/s [CR-limits-2026] | ~11 % | Bibliographic search; Metadata Plus raises the ceiling (150, unit to confirm) [CR-access]. |
| Semantic Scholar key, 1 RPS [S2-overview] | ~4 % | The shared unauthenticated pool is larger but subject to unannounced throttling. |
| Open Library identified, 3 req/s [OL-api] | ~11 % | Books only (≥ 20 % of the reference test set, 14.4), plus the commercial clause. |
| arXiv, 1 request per 3 s [AX-tou] | ~1.2 % | Identifier lookups can be batched via `id_list` (spot check), so the limit binds mainly on searches without an ID: 100 such searches would need ≥ 300 s, above the 180 s of FA-UEB-42. Batching across concurrent checks adds queueing delay of up to 3 s per batch. |
| Europe PMC, Internet Archive, Google Books | unknown | No published limit. |

Limits apply per operator, key or identity. Spreading traffic across several keys or client IPs is a terms question (Semantic Scholar forbids attempts "to exceed or circumvent limitations" [S2-license]; arXiv counts "all of the machines under your control as a whole" [AX-tou]), not a free capacity fix. Caching of identifier lookups reduces load for repeated references; the hit rate is unknown.

## Verified facts versus measurements still needed

Verified (documented): authentication models, published rate limits, OpenAlex pricing, license texts, lookup and search parameters, retraction fields in Crossref and OpenAlex (also confirmed by spot check).

Measurements still needed:

1. p50/p95 latency per data source and call type (ID lookup vs search) from the intended EU hosting region (FA-UEB-13), at the planned request rates.
2. Recall per data source and source type on the reference test set (14.4): which sources find books, book chapters, German-language works and web sources.
3. Calls per reference (mean and for not-found references) under a given routing order, which converts the ceilings above into real headroom.
4. Cache hit rate for identifier lookups across checks.
5. Live values of Crossref `x-rate-limit-*` and `x-concurrency-limit` headers per pool; Metadata Plus limit unit.
6. Europe PMC and Internet Archive sustainable request rates (no published limit).
7. Google Books default quota in a real Cloud project.

## Unresolved terms

- **Semantic Scholar**: whether Graph API data is CC BY-NC or ODC-BY for a paid product; needs written confirmation from AI2. [S2-license]
- **Google Books**: "You may not charge users any fee for the use of your application" without a separate agreement. [GB-terms]
- **Open Library**: "high-traffic commercial infrastructure" clause; data license not stated on the developer page. [OL-api]
- **Internet Archive**: terms of use not machine-readable; commercial use of Wayback lookups unresolved.
- **arXiv**: commercial use of the API itself not addressed (metadata is CC0). [AX-tou]
- **Crossref Metadata Plus**: price and SLA not public.
- **Europe PMC**: no API-specific terms beyond EMBL-EBI's general terms. [EBI-terms] A spot `DOI:"…"` query returned HTTP 503 twice on 2026-10-24 (cause unknown), so DOI search in Europe PMC is unverified.

## Implications for later decision tickets

These are inputs for search routing (blocking issue [#16](https://github.com/jeffnawroth/source-taster/issues/16)), not a selected strategy.

1. **Identifier-first routing is cheap and fast where it is free.** OpenAlex DOI/PMID lookups cost nothing [OA-costs]; Semantic Scholar resolves DOI, arXiv, PMID and PMCID and batches 500 IDs [S2-swagger]. Searches are the scarce resource: OpenAlex charges for them, Crossref limits them to 3 req/s [CR-limits-2026].
2. **arXiv search without an identifier does not scale to FA-UEB-43 at the documented rate**; identifier lookups can be batched in one `id_list` request (spot check). arXiv identifiers and DataCite arXiv DOIs can also be resolved via OpenAlex (spot check) or Semantic Scholar `ARXIV:` [S2-swagger]. Whether arXiv title searches are routed through such an index is a routing question for #16.
3. **DOI conflict (FA-ABG-14) must not rely on Crossref alone.** Crossref returns 404 for DataCite DOIs such as arXiv's (spot check); a registration-agency-neutral existence check (doi.org handle API) distinguishes existing from non-existing DOIs. Otherwise real DataCite DOIs would yield a red verdict and threaten the ≤ 1 % / ≤ 3 % false-alarm targets (14.4). FA-UEB-12 allows references to be passed only to "the responsible data sources"; doi.org (and DataCite, deferred in section 7) are not listed there, so using the DOI resolver is itself a requirements question.
4. **Retraction (FA-SUC-09, FA-ABG-17) is available from Crossref and OpenAlex** via Retraction Watch [CR-RW] [OA-work], and from Europe PMC publication types for MEDLINE records (spot check). Retracted works' titles carry a "RETRACTED: " prefix in Crossref and OpenAlex (spot check), which will lower the title field score (FA-ABG-01) of a correctly cited retracted paper; no comparison rule in 8.3 strips such prefixes, so the FA-ABG-17 acceptance case (retracted publication rated "Correct") needs a rule or clarification.
5. **Books are the weakest coverage.** Both named catalogs carry commercial restrictions (Open Library, Google Books), and Open Library's 3 req/s is about 11 % of the peak load. Books and chapters are ≥ 20 % of the reference test set (14.4).
6. **Caching versus FA-UEB-10.** Crossref and arXiv ask clients to cache [CR-tips] [AX-manual]. A cache keyed by identifiers that stores only source metadata does not store the user's reference; a cache keyed by the user's title/author query string arguably stores reference content beyond 24 hours for guests. The cache design must resolve this tension.
7. **Budget and paid tiers.** OpenAlex prepaid usage or an annual plan, and Crossref Metadata Plus, are the documented ways to raise ceilings; neither publishes an SLA, so FA-UEB-44 (99.5 %) depends on FA-SUC-05 (continue without a failed source) rather than on provider guarantees.
8. **Load tests must not burn shared quotas.** A single FA-UEB-43 load test against live APIs consumes about five days of the free OpenAlex budget and may trigger throttling elsewhere; mocks or recorded responses are needed for repeated load tests.

## References

Fetched and read (primary sources), accessed 2026-10-24:

- [OA-auth] OpenAlex, Authentication and rate limits (updated 15 Oct 2026): https://help.openalex.org/api/authentication/
- [OA-pricing] OpenAlex, Pricing (updated 11 Aug 2026): https://help.openalex.org/access/pricing/
- [OA-costs] OpenAlex, Example costs: https://help.openalex.org/access/example-costs/
- [OA-single] OpenAlex, Get single entities (updated 20 Sep 2026): https://help.openalex.org/how-to-use-the-api/get-single-entities
- [OA-search] OpenAlex, Search works (updated 3 Oct 2026): https://help.openalex.org/api-entities/works/search-works
- [OA-work] OpenAlex, Work object (updated 17 Oct 2026): https://help.openalex.org/api-entities/works/work-object
- [OA-ref] OpenAlex, API reference overview (paging, corpus size): https://help.openalex.org/api-reference/authentication.md
- [CR-access] Crossref, REST API access and authentication (updated 16 Oct 2025): https://www.crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication/
- [CR-limits-2025] Crossref blog, Announcing changes to REST API rate limits (5 Nov 2025): https://crossref.org/blog/announcing-changes-to-rest-api-rate-limits/
- [CR-limits-2026] Crossref community, Refining REST API limits for improved stability and reliability (21 Jul 2026): https://community.crossref.org/t/refining-rest-api-limits-for-improved-stability-and-reliability/16137
- [CR-swagger] Crossref REST API specification: https://api.crossref.org/swagger-docs
- [CR-tips] Crossref, Tips for using the Crossref REST API (updated 24 Oct 2025): https://www.crossref.org/documentation/retrieve-metadata/rest-api/tips-for-using-the-crossref-rest-api/
- [CR-RW] Crossref, Retraction Watch (updated 19 Jan 2025): https://crossref.org/documentation/retrieve-metadata/retraction-watch/
- [CR-retrieve] Crossref, Metadata retrieval, license table (updated 16 Oct 2025): https://www.crossref.org/documentation/retrieve-metadata/
- [S2-overview] Semantic Scholar API overview: https://www.semanticscholar.org/product/api
- [S2-swagger] Semantic Scholar Academic Graph API specification (first ~81 % read): https://api.semanticscholar.org/graph/v1/swagger.json
- [S2-license] Semantic Scholar API License Agreement (updated 17 May 2023): https://www.semanticscholar.org/product/api/license
- [EPMC-dev] Europe PMC RESTful Web Service: https://dev.europepmc.org/RestfulWebService
- [EBI-terms] EMBL-EBI Terms of Use (updated 14 Oct 2026): https://www.ebi.ac.uk/about/terms-of-use
- [AX-tou] arXiv, Terms of Use for arXiv APIs: https://info.arxiv.org/help/api/tou.html
- [AX-manual] arXiv API User's Manual: https://info.arxiv.org/help/api/user-manual.html
- [OL-api] Open Library, Developers / APIs (revision of 9 Oct 2026): https://openlibrary.org/developers/api
- [OL-books] Open Library, Books API: https://openlibrary.org/dev/docs/api/books
- [GB-using] Google Books APIs, Using the API (updated 28 Aug 2025): https://developers.google.com/books/docs/v1/using
- [GB-terms] Google Books API Terms of Service (modified 25 Apr 2012): https://developers.google.com/books/terms
- [IA-wayback-api] Internet Archive, Wayback Machine APIs: https://archive.org/help/wayback_api.php
- [IA-cdx] Internet Archive, Wayback CDX Server README: https://github.com/internetarchive/wayback/blob/master/wayback-cdx-server/README.md
- [IA-blog-2026] Internet Archive blog, An Update on Wayback Machine Access (15 Sep 2026): https://blog.archive.org/2026/09/15/an-update-on-wayback-machine-access/

Seen only as search-result snippets, not fetched (lower confidence):

- [Hauschke-2024] Hauschke & Nazarovets, "(Non-)retracted academic papers in OpenAlex": https://arxiv.org/abs/2403.13339
- [CR-RW-forum] Crossref community, Retraction Watch retractions now in the Crossref API: https://community.crossref.org/t/retraction-watch-retractions-now-in-the-crossref-api-crossref/13119
- [CR-labs-deprecation] Crossref community, Deprecating Retraction Watch annotations in the Labs API: https://community.crossref.org/t/deprecating-retraction-watch-annotations-in-the-labs-api/15884
- [S2-casrai] CASRAI guide on the Semantic Scholar API (secondary): https://casrai.org/guides/semantic-scholar-api
- [EPMC-slides] EMBL-EBI webinar slides, Europe PMC programmatically (2020): https://www.ebi.ac.uk/training/online/courses/embl-ebi-programmatically/wp-content/uploads/sites/128/2020/11/Webinar-slides-Europe-PMC-programmatically_2020.pdf
- [GB-quota-forum] Google Developer forum, Requesting higher quota for Google Books API: https://discuss.google.dev/t/requesting-higher-quota-for-google-books-api-bookquest-app/286093
- [IA-iarest] Internet Archive developer portal, RESTful microservices: https://archive.org/developers/iarest.html
- [IA-forum-15] Internet Archive forum, IP blocked if >15 requests per minute: http://archive.org/post/1103865/ip-blocked-for-one-day-if-and-gt15-requests-per-minute-is-that-possible-in-the-first-place

Not fetched; cited from the standard text (verify wording before relying on it):

- [RFC9110-HEAD] RFC 9110, HTTP Semantics, section 9.3.2 HEAD: https://www.rfc-editor.org/rfc/rfc9110#section-9.3.2
- [RFC9110-405] RFC 9110, section 15.5.6 405 Method Not Allowed: https://www.rfc-editor.org/rfc/rfc9110#section-15.5.6

Spot checks: single `curl` requests by the researcher on 2026-10-24 (see "Cross-cutting spot checks" and the Europe PMC section); reproducible with the URLs given there.
