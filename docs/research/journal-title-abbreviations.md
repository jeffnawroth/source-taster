# Journal-title abbreviations: data source fields, abbreviation lists, ISO 4

Research note for [issue #50][issue-50] ("Journal-title abbreviations in scoring").
All facts were retrieved on **25 October 2026** unless a different date is stated.
Wayback items are cited as "archived <date>, retrieved 2026-10-25".
Sections marked **Observation** describe what the evidence shows. They are not recommendations. The decision belongs to the client.

## Context in this repository

- Extraction keeps values as written. An abbreviated journal title goes to CSL `container-title-short`, a full one to `container-title` ([ADR-0010][adr-0010] l. 37; [ADR-0011][adr-0011] l. 112).
- Both ADRs record the gap: scoring must compare `container-title-short` with the Candidate's journal title or its abbreviation, or abbreviating styles lose the 15 % journal weight ([ADR-0010][adr-0010] l. 158; [ADR-0011][adr-0011] l. 246).
- [Requirements §8.3][req] normalizes typography, accents, umlauts ("ü" = "ue"), punctuation, whitespace and case. It ignores appended bracketed acronyms ("Journal of Testing (JOT)" = "Journal of Testing").
- Constraints: TypeScript only, no pre-1.0 core dependency, no service in another language, no learned method ([ADR-0002][adr-0002]). The verification program is AGPL-3.0-or-later, and third-party data keeps its own grants ([ADR-0001][adr-0001]).
- Under the [ADR-0007][adr-0007] search route (article: OpenAlex → Crossref → Europe PMC → Semantic Scholar), no further source is queried after an unambiguous match (F18).

## 1. What each data source carries

### Summary

| Data source | Field(s) on the work record | Extra request? | Observed for NEJM / PRL / Dtsch Arztebl Int |
|---|---|---|---|
| OpenAlex work | `primary_location.source` has `display_name`, `issn`, `issn_l`, `type`, … but **no abbreviation or alternate-name key**. `locations[].raw_source_name` sometimes contains an abbreviation. | No | Embedded source: full names only. `raw_source_name`: "N Engl J Med" (NEJM) and "Dtsch Arztebl Int" (Dtsch) appear among the location strings; PRL has none. |
| OpenAlex Sources entity | `alternate_titles` (array). `abbreviated_title` is documented but was **absent** from every live record fetched. | Yes, `/sources/{id}`. Single-record lookups are free under the metered API. | NEJM: `["NEJM","Boston Medical and Surgical Journal","Boston Med. Surg. J"]`. PRL: `["Physical review letters online","Physical review letters on CD-ROM","PRL"]`. Dtsch: `["Aerzteblatt-international.de"]` |
| Crossref work | `short-container-title` (array) | No | `["N Engl J Med"]` / `["Phys. Rev. Lett."]` / `[]` |
| Europe PMC (`resultType=core`) | `journalInfo.journal.medlineAbbreviation`, `.isoabbreviation`, `.title`, `.nlmid` | No | `N Engl J Med` / `Phys Rev Lett` / `Dtsch Arztebl Int` |
| Semantic Scholar | `publicationVenue.alternate_names` (array), `journal.name`, `venue` | No | NEJM: `["n engl J Med","The New England Journal of Medicine","N Engl J Med"]`. PRL (LIGO paper): `publicationVenue` null; PRL (1996 paper): `["Phys Rev Lett"]`. Dtsch: `["Dtsch Ärztebl Int","Dtsch Arzteblatt Int","Deutsches Arzteblatt International"]` |
| Open Library | No abbreviation field. Edition schema has `series`, `other_titles`, `work_titles`. | n/a | n/a (books) |
| Google Books | Per the documentation, no container, series or abbreviation field in `volumeInfo` | n/a | not tested live (see Gaps) |
| doi.org | Resolver only | n/a | n/a |

Sample DOIs: NEJM `10.1056/NEJMoa2034577`; PRL `10.1103/PhysRevLett.116.061102` (LIGO) and `10.1103/PhysRevLett.77.3865`; Deutsches Ärzteblatt international `10.3238/arztebl.2020.0225`. That journal has a German title but is the English-language edition of a German journal; it stands in for "non-English title, smaller journal". Revista de Saúde Pública and The Lancet were checked in OpenAlex Sources only.

### OpenAlex

- **Work record, embedded source.** The keys of `primary_location.source` are `display_name, host_organization, host_organization_lineage, host_organization_lineage_names, host_organization_name, id, is_core, is_in_doaj, is_oa, issn, issn_l, listed_in, type`. There is no abbreviation. NEJM is W3111255098 → S62468778 "New England Journal of Medicine". PRL is W2252795400 → S24807848 "Physical Review Letters". Dtsch is W3024516423 → S40230991 "Deutsches Ärzteblatt international". ([work API][oa-work-nejm])
- **Work record, `locations[].raw_source_name`.** These strings come from individual locations and are noisy:
  - NEJM includes "New England Journal of Medicine", "The New England journal of medicine", "N Engl J Med", `null`, "United States" and repository names.
  - Dtsch: "Deutsches Ärzteblatt international", "Deutsches Arzteblatt international", "", "Dtsch Arztebl Int".
  - PRL has no abbreviation. It does contain whole citation strings from repositories.
- **Sources entity.** The help docs list `abbreviated_title`: "The source's standard abbreviated title (e.g. the ISO 4 abbreviation), when known". They describe `alternate_titles` as titles "as obtained from the ISSN Centre and individual work records… commonly abbreviations or translations" ([Sources attributes][oa-src-attr]; older [GitHub docs][oa-src-gh] show `abbreviated_title` example "J. addict. med. ther. sci.").
- **What the live API returned:**
  - The key `abbreviated_title` was absent from all 5 full Sources records fetched: S62468778, S24807848, S40230991, S49861241 (The Lancet), S164583999 (Revista de Saúde Pública). Each record had 39 keys.
  - `filter=abbreviated_title:…` is rejected with "abbreviated_title is not a valid field".
  - `select=abbreviated_title` is dropped silently.
  - `alternate_titles` for The Lancet is `[]`; for Revista de Saúde Pública it is `["RSP","Journal of public health"]`.
  - In a random sample of 50 sources (`sample=50&seed=7`), 17 had a non-empty `alternate_titles`.
  - `sources?search=N Engl J Med` and `search=Phys Rev Lett` returned 0 results.
- **Cost.** OpenAlex is metered. Unauthenticated callers share a small daily budget, and "single-record lookups are free" ([llms.txt][oa-llms]).

**Observation:** the OpenAlex work record carries abbreviations only incidentally, in `raw_source_name`. The NLM-style abbreviation "N Engl J Med" was not among NEJM's `alternate_titles`. The documented `abbreviated_title` did not appear in any response. Getting `alternate_titles` takes one more `/sources/{id}` request after the work request. Whether that request counts as an "additional source" under ADR-0007 F18 is for the client to decide.

### Crossref

- `short-container-title` is documented as "Array of String | Abbreviated titles of the containing work" ([api_format.md][cr-format]). It is publisher-deposited.
- Live values: NEJM `["N Engl J Med"]` and PRL `["Phys. Rev. Lett."]` (both PRL DOIs). Dtsch Arztebl Int `[]`, with `container-title` "Deutsches Ärzteblatt international". ([Crossref works][cr-nejm])
- A random sample of 100 `journal-article` works (`sample=100&select=DOI,container-title,short-container-title`):

| Category | Count | Examples |
|---|---|---|
| Missing or empty | 9 | — |
| Identical to the full title | 40 | — |
| Acronym | 12 | IJSMM, ApJ, IJERPH, IVKKT, AGS, CMR |
| Dotted abbreviation | 21 | "IEEE Trans. Signal Process.", "J. Electrochem. Soc.", "Mem. Inst. Oswaldo Cruz", "j. ther." (for *TERAPUTIK*) |
| Dotless or other | 18 | "Ann Glob Anal Geom", "Sci Am", "ijarcs", "Soil Science Soc of Amer J", "Jour of Counseling &amp;amp; Develop", mojibake "�������� �����" |

- One record had three values ("J Acoust Soc Jpn (E)" variants).
- Book chapter `10.1007/978-3-030-58452-8_13`: `container-title` is `["Lecture Notes in Computer Science","Computer Vision – ECCV 2020"]`, which mixes the series and the book in one array. `short-container-title` is `[]`.

**Observation:** Crossref short titles mix ISO-4 dotted forms, NLM dotless forms, acronyms and copies of the full title. Their quality is uneven.

### Europe PMC

- `resultType=core` → `journalInfo.journal`:
  - NEJM (PMID 33301246): `{"title":"The New England journal of medicine","medlineAbbreviation":"N Engl J Med","isoabbreviation":"N Engl J Med","nlmid":"0255562"}`
  - PRL (PMID 26918975): `{"title":"Physical review letters","medlineAbbreviation":"Phys Rev Lett","isoabbreviation":"Phys Rev Lett","nlmid":"0401141"}`
  - Dtsch (PMID 32343668): `{"title":"Deutsches Arzteblatt international","medlineAbbreviation":"Dtsch Arztebl Int","isoabbreviation":"Dtsch Arztebl Int","nlmid":"101475967"}`
  - Diacritics are stripped and the title is in NLM sentence case. ([Europe PMC search][epmc])
- `resultType=lite` returns only `journalTitle` = "N Engl J Med", which is the abbreviation and not the full title ([lite][epmc-lite]).
- Coverage is not uniform. Agricola record IND607158729 had only `{"title":"Journal of the science of food and agriculture.","issn":"0022-5142"}` and no abbreviation, although another AGR record had one. The sampled PMC records had abbreviations. ([AGR sample][epmc-agr])

### Semantic Scholar

- The Swagger spec documents `publicationVenue.alternate_names` as "an array of alternate names for the venue", with the example ACL `["Annu Meet Assoc Comput Linguistics", …, "ACL", …]` ([Swagger][s2-swagger]).
- Live records ([S2 paper API][s2-paper]):
  - NEJM: `alternate_names` `["n engl J Med","The New England Journal of Medicine","N Engl J Med"]`.
  - PRL `10.1103/PhysRevLett.77.3865`: `["Phys Rev Lett"]`, `journal.name` "Physical review letters".
  - PRL LIGO `10.1103/PhysRevLett.116.061102`: `publicationVenue` null, `venue` "", `journal` null.
  - Dtsch: `["Dtsch Ärztebl Int","Dtsch Arzteblatt Int","Deutsches Arzteblatt International"]`. Other fields on the same record are messy: `pages` "\n 225-234\n", `volume` "117 13".
- **Observation:** venue linkage is missing on some records, even well-known ones. Casing and diacritics in `alternate_names` vary.

### Open Library and Google Books

- The Open Library edition schema has `series` (string array), `other_titles` and `work_titles`, with no abbreviation field ([schema][ol-schema]). Sample edition [OL9055322M][ol-ed] had `series` empty.
- Google Books `volumeInfo` documents title, subtitle, authors, publisher, publishedDate, industryIdentifiers and similar fields. There is no series or container field ([Volumes reference][gb-ref]).

## 2. Downloadable abbreviation lists

| List | Content | Size | Update cadence | Terms (verbatim or summarized) | Redistribution inside an AGPL program |
|---|---|---|---|---|---|
| **ISSN LTWA** ([page, archived 2026-03-17][ltwa-page]; [CSV][ltwa-csv]) | **Word rules**, not title pairs: "more than 56,000 words and their abbreviations in 65 languages". The basis of the "abbreviated key titles" in the ISSN Register. | CSV 1,466,397 bytes, tab-separated, `WORD / ABBREVIATION / LANGUAGES`, 56,463 rows; also PDF | CSV "updated 2024-02-26". Earlier editions 2017-09-14 and 2021-07-02 (abbrevIso file names) | No LTWA-specific licence found. The ISSN legal notices say the databases "are the exclusive property of CIEPS and are protected under … the European Directive of 11 March 1996 on the legal protection of databases", and "Any performance, whether total or partial, of this site by any company whatsoever, without the express authorization of the CIEPS is strictly forbidden". They add: "Users and visitors cannot place a hyperlink to this website without the CIEPS' express and prior authorization" ([legal notices, archived 2026-08-29][issn-legal]) | **Unresolved.** The portal (`portal.issn.org/ltwa`) is behind a bot challenge. Ask the ISSN International Centre. |
| **NLM journal list** ([J_Medline.txt][nlm-jm]; [J_Entrez.txt][nlm-je]) | **Title → abbreviation pairs**. Fields `JournalTitle, MedAbbr, IsoAbbr, ISSN (Print), ISSN (Online), NlmId` | J_Medline 9,104,834 bytes, 38,093 records; J_Entrez 10,102,999 bytes, 42,143 records; .gz/.zip variants | "updated daily" ([serfile info][nlm-serfile]); Last-Modified 25 Oct 2026 | "Courtesy of the U.S. National Library of Medicine". No implied endorsement. Redistributors must keep the most current version or disclose that it is not current. No fees ([NLM terms][nlm-terms]). US government works may be freely used ([web policies][nlm-web]) | **Permitted** with attribution. A shipped snapshot must be kept current or marked as not current. |
| **JabRef abbrv.jabref.org** ([repo][jabref-repo]; [list README][jabref-lists]) | **Pairs**: `"<full name>","<abbreviation>"[,"<shortest unique>"]`, "should follow the ISO4 standard with dots" | 19 lists, 715 B – 1.2 MB | Repo last pushed 2026-10-01 | CC0-1.0 at repo level. CC0 §4(c): "Affirmer disclaims responsibility for clearing rights of other persons that may apply to the Work" ([LICENSE][jabref-license]) | CC0 as given. Upstream rights per list are below. |
| **CASSI** (CAS Source Index) ([about][cassi-about]) | Lookup tool: title, abbreviation, CODEN, ISSN. Limit of 100 results per search. No bulk download. | n/a | "last updated October 11, 2026" | "use CASSI only for your own internal business purposes"; "prohibited from incorporating CASSI into your own products and services for redistribution"; "prohibited from using automated programs for systematic retrieval" ([guidelines][cassi-terms]) | **Prohibited.** |

### JabRef lists and their upstream sources

Provenance comes from the [journals README][jabref-lists]. The licence status of each upstream source was not verified unless stated.

| List | Bytes | Upstream / maintainer per README | Notes |
|---|---|---|---|
| entrez | 1,231,227 | Emmanuel Charpentier. "Medline (dotless) abbreviations only." | 19,506 rows, versus 38,093 in the current J_Medline, so it is an older NLM derivative. 148 abbreviations are shared by more than one full-title string. |
| medicus | 191,635 | Guy Tsafnat. Index Medicus, dotless | 3,169 rows. Contains garbled rows and empty abbreviations. |
| ubc | 810,326 | Generated from the [UBC library site][ubc] by `update_ubc.py` | 13,227 rows, 117 abbreviations shared by more than one full-title string. No terms found on the UBC page (gap). |
| mathematics | 288,556 | Generated from MathSciNet's CSV by `update_mathscinet.py` | MathSciNet terms not checked (gap) |
| aea | 62,167 | Jeff Arnold, "as posted on the AEA website" | AEA terms not checked |
| lifescience | 572,044 | Zé Roberto Ribeiro | 9,741 rows, 48 shared abbreviations |
| general | 133,491 | — (no contributor listed) | 1,895 rows |
| acs, ams, annee-philologique, astronomy, dainst, geology_physics, ieee, meteorology, sociology | 715 – 166,462 | Individual contributors named in the README. annee-philologique and dainst are "non-ISO abbreviations only". astronomy points to an upstream GitHub repo. | — |
| geology_physics (part), mechanical | 77,516 / 305,476 | Credited (wholly or partly) to an "anonymous user" via SourceForge patches | — |
| geology_physics_variations, ieee_strings | 10,967 / 16,871 | Not listed in the README table | Provenance unknown |

The "shared" counts in this table compare full-title strings exactly (case-insensitive). They include spelling variants of a single journal, e.g. ubc "ACS Sustainable Chemistry & Engineering" vs "… and Engineering". They also include renamed sections of one journal, e.g. two "Acta Crystallographica. Section A" titles. They are not counts of distinct journals.

According to the README, JabRef merges all dotted lists at each release, and "In case of duplicate appearances … the last occurring abbreviation is chosen" ([README][jabref-readme]).

### NLM list analysis (J_Medline.txt, 25 Oct 2026)

- `MedAbbr` is unique across all 38,093 records. `IsoAbbr` equals `MedAbbr` in every record where both are present. Both are dotless, and only 24 contain a ".".
- 2,705 `MedAbbr` values carry a parenthetical qualifier, e.g. "Acta Anat (Basel)". With the qualifier stripped, 821 base abbreviations are shared by 1,799 journals ("Proc" 11, "Medicina" 6, "Health" 5, "Nursing" 5).
- 2,069 `MedAbbr` values are identical to `JournalTitle`.
- Examples: N Engl J Med (0255562); Phys Rev Lett (0401141); Rev Saude Publica; "Lancet (London, England)" → "Lancet".
- Two distinct entries: "Dtsch Arztebl" (16610180R) and "Dtsch Arztebl Int" (101475967).
- NLM construction rules are NLM's own convention, based on the ISSN form ([NLM construction][nlm-construct], reviewed 2024-04-02):
  - "Articles, conjunctions, and prepositions are always omitted".
  - "One word titles are never abbreviated".
  - "All punctuation is removed, except for parentheses used when a qualifier is supplied".
  - "All diacritics are removed".
  - "Each title abbreviation must be unique": qualifiers are city, publisher, edition or date.
  - A major title change gets a new abbreviation.

## 3. ISO 4 rule-based abbreviation

- **The standard.** ISO 4:1997, edition 3, 11 pages, CHF 67, stage 90.93 "confirmed". The page states the standard "is updated by a Maintenance Agency or Registration Authority" ([iso.org, archived 2026-06-23][iso4]). The standard text was **not** accessed. The ISSN International Centre is the ISO-appointed registration authority for the LTWA ([LTWA page][ltwa-page]).
- **How the LTWA encodes rules.** The following comes from analysing the downloaded CSV:
  - 16,801 trailing-hyphen stems match word beginnings: "letter-" → "lett.", "review-" → "rev.", "medicin-" → "med.", "internation-" → "int.", "physica-" → "phys.".
  - 207 leading-hyphen entries are suffixes.
  - 18,853 words have an empty abbreviation, meaning "not abbreviated" ("acta", "physician").
  - There are multi-word entries: "New England" → "N. Engl.", "Neue Folge" → "N. F.".
  - Some entries are case-sensitive: "Essen" is not abbreviated, but "essen" → "ess."; likewise "Canton"/"canton".
  - Other examples: "journal" → "j.", "Deutsch" → "Dtsch.", "Ärzteblatt" → "Ärztebl.".
  - The CSV has 68 language labels. The largest are German (9,901), English (9,423) and French (5,180).
- **General rules.** This is a third-party summary from the [abbrevIso overview][abbreviso-page], not the standard:
  - "articles, conjunctions and prepositions are omitted".
  - "commas are removed, periods are replaced by commas".
  - "capitalization is not specified".
  - "diacritics are left as in the original title".
  - "words like Part, Series, Section should be omitted".
  - "single word titles … are not abbreviated".
  - Caveats include "Names of persons should not be abbreviated, even if they match" and "if two rules contradict, check the languages column".
- **Ambiguity.** Several stems can match one word, so the longest match and the language matter. Different full titles can produce the same abbreviation (see Pitfalls). The mapping is many-to-one, so it cannot be reversed. The JabRef README says of abbrevIso: "it does not handle unabbreviation, for which there is no alternative to lists" ([JabRef README][jabref-readme]).

### JS/TS implementations

| Package | Language | npm | Version | Licence | Last activity | Notes |
|---|---|---|---|---|---|---|
| [abbrevIso][abbreviso-gh] (`package.json` name `abbreviso`) | JavaScript (ES modules, rollup bundles), not TypeScript | **Not published**: `registry.npmjs.org/abbreviso` returns 404 | 1.2.0 in `package.json` | MIT (code) | Last commit 2025-07-13, "Small update to LTWA_2024-modified.csv" | Bundles copies of the LTWA (2017, 2021, 2024, plus "modified" versions fixing "obvious bugs"). The MIT licence covers the code; it says nothing about rights to the bundled LTWA. Runtime deps `bunyan` and `express` serve the API server only. Shortwords list covers English, French, German and Spanish. |

- npm registry searches for `iso4`, `iso 4 abbreviation`, `journal abbreviation`, `ltwa`, `abbreviso` and `journal title abbreviation` found no ISO 4 implementation.
- Name probes returned 404: `abbreviso`, `abbrevIso`, `abbrev-iso`, `iso4`, `iso-4`, `ltwa`, `journal-abbreviations`, `journal-abbreviation`, `iso4-abbreviation`, `abbrev-journal`.
- The `@iso4/*` scope (version 0.8.1, Oct 2026) is an unrelated V8 sandbox runtime; only the name collides.
- **Observation:** no maintained ISO 4 package published on npm at version 1.0 or later was found by these queries.

## 4. Pitfalls with evidence

| Pitfall | Evidence |
|---|---|
| One abbreviation, several journals | NLM: `MedAbbr` is unique only because of qualifiers. Once qualifiers are removed, 821 base abbreviations are shared by 1,799 journals ("Proc" × 11, "Medicina" × 6), so an unqualified "Medicina" in a reference is ambiguous. UBC/JabRef map "Adv. Med." to both "Advanced Medicine" and "Advances in Medicine". J_Medline has only "Advances in medicine" (Adv Med, 101651448), so it is **unverified** whether "Advanced Medicine" is a separate journal. |
| Dots and spacing | Crossref "Phys. Rev. Lett." vs Europe PMC and S2 "Phys Rev Lett". LTWA output is dotted, NLM output is dotless. |
| Diacritics vs §8.3 umlaut rule | NLM and Europe PMC "Dtsch Arztebl Int" and title "Deutsches Arzteblatt international" drop the umlaut. OpenAlex has "Deutsches Ärzteblatt international" and LTWA has "Ärztebl.". §8.3 normalizes accents and maps "ü" = "ue". If "Ä" is folded to "Ae", "Aerzteblatt" does not equal NLM's "Arzteblatt"; if it is folded to "A", the two match. OpenAlex's own alternate title is "Aerzteblatt-international.de". |
| Acronyms posing as short titles | Crossref sample: 12 % acronyms (ApJ, IJERPH, CMR). OpenAlex `alternate_titles` "NEJM", "PRL", "RSP". §8.3 covers bracketed acronyms only. |
| Short title = full title | 40 % of the Crossref sample. 2,069 NLM records. One-word titles are never abbreviated (Lancet). |
| Title changes | OpenAlex NEJM `alternate_titles` contains the predecessor "Boston Medical and Surgical Journal" / "Boston Med. Surg. J". NLM keeps separate "Dtsch Arztebl" and "Dtsch Arztebl Int". NLM gives a major change a new abbreviation. JabRef entrez/lifescience map two successive "Acta Crystallographica. Section A" titles to one abbreviation "Acta Crystallogr A" / "Acta Crystallogr. A". |
| Non-English titles | LTWA has 65 languages, with case-sensitive and language-dependent entries ("Essen"/"essen"). abbrevIso's shortword list covers 4 languages only. Crossref sample had "Nier społ a wzrost gosp", "j. ther." for an Indonesian title, and mojibake. |
| Series vs journal | Crossref LNCS chapter: `container-title` holds the series and the proceedings in one array, with an empty short title. ISO 4 drops "Part, Series, Section". JabRef general has two Jpn. J. Appl. Phys. "Part 1" titles under one abbreviation. |
| Noisy source strings | OpenAlex `raw_source_name` holds citation strings and repository names. S2 `alternate_names` casing varies ("n engl J Med"). |

## Gaps

- **LTWA licence:** no LTWA-specific terms were found. issn.org returns 403 to scripted access, and the portal is behind a bot challenge. A written answer from the ISSN International Centre is needed before the LTWA can be shipped.
- **ISO 4 text:** the paid standard was not read, and the rule summary above is secondary. The PDF text of the LTWA and the ISSN Manual could not be extracted.
- **OpenAlex `abbreviated_title`:** it is documented but absent in 5 of 5 records. It is unknown whether it was removed or is only populated for some sources.
- **ISSN Portal:** whether the free tier exposes the abbreviated key title, and under which terms, was not checked.
- **Google Books:** live calls failed with HTTP 429 (daily quota 0 unauthenticated), so the results above come from documentation only.
- **Crossref sample:** only one sample of 100 was taken. Repeated samples hit HTTP 429.
- **Upstream terms:** MathSciNet, UBC and AEA terms behind the derived JabRef lists were not verified.

## References

[issue-50]: https://github.com/jeffnawroth/source-taster/issues/50
[req]: ../requirements-specification.md
[adr-0001]: ../adr/0001-open-core-boundary.md
[adr-0002]: ../adr/0002-tech-stack.md
[adr-0007]: ../adr/0007-search-strategy-latency.md
[adr-0010]: ../adr/0010-ai-provider-model.md
[adr-0011]: ../adr/0011-non-ai-structuring.md
[oa-work-nejm]: https://api.openalex.org/works/doi:10.1056/NEJMoa2034577
[oa-src-attr]: https://help.openalex.org/data/sources/attributes.md
[oa-src-gh]: https://github.com/ourresearch/openalex-docs/blob/main/api-entities/sources/source-object.md
[oa-llms]: https://help.openalex.org/llms.txt
[cr-format]: https://raw.githubusercontent.com/CrossRef/rest-api-doc/master/api_format.md
[cr-nejm]: https://api.crossref.org/works/10.1056/NEJMoa2034577
[epmc]: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.1056/NEJMoa2034577%22&resultType=core&format=json
[epmc-lite]: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.1056/NEJMoa2034577%22&resultType=lite&format=json
[epmc-agr]: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=SRC:AGR%20AND%20PUB_YEAR:2020&resultType=core&format=json&pageSize=2
[s2-swagger]: https://api.semanticscholar.org/graph/v1/swagger.json
[s2-paper]: https://api.semanticscholar.org/graph/v1/paper/DOI:10.1103/PhysRevLett.77.3865?fields=venue,journal,publicationVenue,externalIds
[ol-schema]: https://raw.githubusercontent.com/internetarchive/openlibrary-client/master/olclient/schemata/edition.schema.json
[ol-ed]: https://openlibrary.org/books/OL9055322M.json
[gb-ref]: https://developers.google.com/books/docs/v1/reference/volumes
[ltwa-page]: http://web.archive.org/web/20260317013043/https://www.issn.org/services/online-services/access-to-the-ltwa/
[ltwa-csv]: https://www.issn.org/wp-content/uploads/2024/02/ltwa_current.csv
[issn-legal]: http://web.archive.org/web/20260829081525/https://www.issn.org/legal-notices/
[iso4]: http://web.archive.org/web/20260623143325/https://www.iso.org/standard/3569.html
[nlm-jm]: https://ftp.ncbi.nlm.nih.gov/pubmed/J_Medline.txt
[nlm-je]: https://ftp.ncbi.nlm.nih.gov/pubmed/J_Entrez.txt
[nlm-serfile]: https://www.nlm.nih.gov/bsd/serfile_addedinfo.html
[nlm-terms]: https://www.nlm.nih.gov/databases/download/terms_and_conditions.html
[nlm-web]: https://www.nlm.nih.gov/web_policies.html
[nlm-construct]: https://www.nlm.nih.gov/tsd/cataloging/contructitleabbre.html
[jabref-repo]: https://github.com/JabRef/abbrv.jabref.org
[jabref-readme]: https://github.com/JabRef/abbrv.jabref.org/blob/main/README.md
[jabref-lists]: https://github.com/JabRef/abbrv.jabref.org/blob/main/journals/README.md
[jabref-license]: https://github.com/JabRef/abbrv.jabref.org/blob/main/LICENSE.md
[ubc]: https://journal-abbreviations.library.ubc.ca/
[cassi-about]: https://cassi.cas.org/about.jsp
[cassi-terms]: https://cassi.cas.org/guidelines.jsp
[abbreviso-gh]: https://github.com/marcinwrochna/abbrevIso
[abbreviso-page]: https://marcinwrochna.github.io/abbrevIso/
