# Bibliographic adapter fixtures

Recorded 2026-10-28 from the public metadata endpoint
<https://api.openalex.org/works/doi:10.1038/nphys1170>.
`openalex-nphys1170.json` is a **sanitized projection of that recorded record**,
not a fabricated Source or a claim to preserve the complete upstream response.
It retains the observed id, DOI, title, dates, identifiers, bibliographic fields,
author objects and primary journal display name. Affiliations, locations,
abstract/content fields, metrics and unrelated enrichment were omitted. There
are no user References, credentials, email addresses or account/contact details.
The fixture SHA-256 is
`8dd7589adecdb13ca1daaa20c0a5d1fe123de792d7581a75360aaf9a283419a3`;
the original local response SHA-256 is
`385d959a3fd2be1f59596acd6f7ae4013eab3abc4a607f152408a2dc0686be4e`.

OpenAlex publishes its complete dataset under CC0, allowing storage and reuse:
[primary dataset documentation at observed commit 8cec9dba](https://github.com/ourresearch/openalex-docs/blob/8cec9dba1ee17af56e5de4666f63650a02fb798b/README.md#why-openalex).
This supplies fixture-storage evidence; it is not launch clearance, a provider
account allowance, paid-service qualification or approval to retrieve full text.
Crossref replay uses the separately recorded bibliographic metadata in
[../doi/README.md](../doi/README.md); its policy distinguishes freely reusable
bibliographic facts from copyrighted abstracts. No new Crossref abstract is stored.

All other generated records, swapped fields, empty result envelopes, duplicates,
identifier combinations, body failures, timing and authority witnesses in the
HTTP/browser suites are **explicitly synthetic protocol witnesses**. They are
not recorded upstream responses, real catalog entries, calibration data or the
private Development/Reference test sets. Tests replay only owned loopback HTTP
fixtures and never probe live providers.

Public compatibility spot checks on 2026-10-28 confirmed OpenAlex DOI and PMID
singletons and a `title.search` + `raw_author_name.search` + `publication_year`
list query. The latter returned two records; it does not prove recall or latency.
A known PMCID (`PMC5815332`) returned HTTP 404, while DOI
`10.7717/peerj.4375` and PMID `29456894` resolved to `W2741809807`.
The older singleton documentation lists PMCID, but this observation does not
qualify a functioning PMCID route. Runtime therefore declares it unsupported,
issues no PMCID request, and never treats that capability limitation as a
successful no-match. No arXiv/ISBN endpoint or invented third identifier lookup
was added. Public allocator witnesses cover 0, 1 and 2 distinct supported
identifier records; its generic three-record ceiling is implemented but has no
claimed live/HTTP three-identifier witness with the currently verified adapters.

Primary endpoint documentation read:
[OpenAlex singleton routes](https://github.com/ourresearch/openalex-docs/blob/8cec9dba1ee17af56e5de4666f63650a02fb798b/api-entities/works/get-a-single-work.md),
[search filters](https://github.com/ourresearch/openalex-docs/blob/8cec9dba1ee17af56e5de4666f63650a02fb798b/how-to-use-the-api/get-lists-of-entities/search-entities.md),
and [Crossref reuse policy](https://www.crossref.org/documentation/retrieve-metadata/).
The help.openalex.org authentication/pricing pages returned 403 to the recorder;
the older GitHub rate documentation differs from the earlier research. No
current account allowance is inferred. Development uses an explicitly enabled,
unauthenticated, shared one-request/s and one-concurrent-request cap, below the
research's 10/s unauthenticated allowance and the 25/s planning cap. Daily
provider limits and Retry-After remain binding. No keys, purchased access,
contact identity, caching rights beyond this CC0 fixture or launch qualification
are fabricated.
