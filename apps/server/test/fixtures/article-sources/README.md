# Article Data source fixtures (#78)

Recorded 2026-10-29 from public, unauthenticated endpoints. Every file is a
**sanitized projection of the recorded response**. It is not a fabricated Source
and does not claim to preserve the complete upstream response. Tests replay the
files only through owned loopback HTTP fixtures and never contact live providers.

| Fixture                             | Recorded request                                                                                                                                                                          | Original SHA-256                                                   | Fixture SHA-256                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `europepmc-pmid29456894.json`       | `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID%3A29456894%20AND%20SRC%3AMED&format=json&resultType=core&pageSize=5`                                                | `c3a07f10b385a3582b2ceca8d9909af704a560530d2b2e047f9e2a0f31f5b6ae` | `db72f8f8ef83d18b17471644d9e09221097361fbe026c6f7a999eaeb03711ce1` |
| `europepmc-pmc5815332.json`         | `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=PMCID%3APMC5815332&format=json&resultType=core&pageSize=5`                                                                 | `86f6eaa5934d79adf69fd65fd2835bc3575af410a155d976615faa7905e304be` | `736927d70bfe44c4206d0ec26b4cf0cad23d518068eb8b374e827d19ddb0e054` |
| `europepmc-search-state-of-oa.json` | `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=TITLE%3A%22state%20of%20OA%22%20AND%20AUTH%3A%22Piwowar%22%20AND%20PUB_YEAR%3A2018&format=json&resultType=core&pageSize=5` | `ca3cbd7bc48449a255b020bf95cec96f00c06fc840675b618d4960a4390dc02d` | `40ee3f54070865444a2bdd576f56beec214d2f6a02543c07bf958e7f1323a929` |
| `arxiv-1706.03762.xml`              | `https://export.arxiv.org/api/query?id_list=1706.03762&max_results=1`                                                                                                                     | `526fbded9d650eb9a9c24ae172a645f6912e62e7c9e3983bce5a6883bb78fe7e` | `aa4af6770f0f9db659ffb65bba87df2af349c954037939af5a0d2621ecb2af81` |

Sanitization:

- **Europe PMC.** Each `core` record keeps the fields that the adapter projects or
  that identify it: `id`, `source`, `pmid`, `pmcid`, `doi`, `title`,
  `pubYear`, `pageInfo`, `firstPublicationDate`, the author names, journal
  title, volume, issue and `pubTypeList`. Abstracts, full-text links, MeSH,
  affiliations, ORCIDs, grants, citation counts and all other enrichment were
  removed. The envelope keeps `version`, `hitCount` and the request's
  `queryString` and `resultType`.
- **arXiv.** The Atom feed is otherwise unchanged, except that the abstract
  (`<summary>`) is replaced by `[abstract removed]`.

None of the files contain user References, credentials, email addresses, or
account or contact details.

## Rights

The sources are the project's Data source research
(`research/data-source-apis:docs/research/data-source-apis.md`) and the primary
pages it cites. They show fixture-storage evidence only. They do not grant launch
clearance, a provider allowance, or approval to retrieve full text.

- **Europe PMC.** No API-specific licence. The
  [EMBL-EBI Terms of Use](https://www.ebi.ac.uk/about/terms-of-use) add no
  restriction of their own, but third-party rights in individual records remain
  possible. That is the reason the fixtures store only the bibliographic facts
  that the adapter compares, and no abstracts.
- **arXiv.** Descriptive metadata is CC0 under the
  [Terms of Use for arXiv APIs](https://info.arxiv.org/help/api/tou.html). The
  abstract is removed anyway, and no e-print content is stored.
- **Semantic Scholar.** The live `ARXIV:1706.03762` request returned HTTP 429
  (unauthenticated shared pool). Separately, the
  [API licence](https://www.semanticscholar.org/product/api/license) leaves open
  whether the data falls under CC BY-NC or ODC-BY. **No Semantic Scholar response
  is stored.** Its tests use explicitly synthetic records in the documented Graph
  API response shape (`paperId`, `title`, `authors`, `year`, `venue`, `journal`,
  `externalIds`, `publicationDate`).

## Synthetic witnesses

The following are **explicitly synthetic protocol witnesses**, not recorded
upstream responses or calibration data:

- All Semantic Scholar records.
- The Europe PMC `Retracted Publication` record. It is the PMCID fixture with
  `Retracted Publication` appended to `pubTypeList`.
- All 404, 429, 500 and 503 responses, and held or slow responses.
- The `Synthetic article N` records used in the fairness tests.
- The browser suite's Europe PMC empty page and 503 witness.
