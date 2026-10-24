# Requirements Specification – Source Taster

*Functional specification without technical implementation details · Version 3.2 draft: target state of the commercial product*

24 October 2026 · Jeff Nawroth

> This English document is authoritative. Version 3.2 is a draft consolidating the client-accepted scoring decisions of 24 October 2026. Version 3.1 remains the approved baseline until this draft is approved; the prior version is preserved in Git history. The superseded German document does not govern this work.

**Document information**

| Attribute | Value |
| --- | --- |
| Document | Requirements Specification Source Taster |
| Version | 3.2 draft of 24 October 2026 |
| Status | Draft for review; scoring design and amendment instructions accepted on 24 October 2026; consolidated wording pending approval |
| Client | Jeff Nawroth |

**Change history**

| Version | Date | Change |
| --- | --- | --- |
| 3.2 draft | 24 October 2026 | Explicit identity evidence, expanded Not verifiable reasons, coverage/DOI precedence, author/date/page and web/archive rules, correction eligibility and numeric precision; sections 8 and 17 |
| 3.1 | 23 October 2026 | Acceptance criterion of FA-KTO-28 refers to the monthly subscription |
| 3.0 | 23 October 2026 | First approved version |

## 1 Introduction

Source Taster is a commercial product that automatically checks references to determine whether the cited source exists and is cited correctly. This specification describes **what** the product must deliver from the perspective of the operator, customers and users – not how it is implemented technically.

### 1.1 Background

AI language models frequently produce references in academic texts that look plausible but do not exist, or that combine real elements incorrectly, for example real authors with an invented title (hallucinations). Plagiarism checkers do not detect such references. Checking every reference by hand is time-consuming – for students before submission as well as for editorial offices and reviewers.

### 1.2 Product goals

- Recognize references in texts, documents and reference managers and break them down into their components.
- Match every reference against academic databases and catalogs.
- Deliver a transparent, reproducible verdict for each reference: what is correct, what deviates, what is probably invented – with an explanation and a correction suggestion.
- Document results as evidence (verification report).
- Operate the product on a sustainable commercial basis: free entry, paid plans for individual users, later also licenses for organizations and a usage-based API.

### 1.3 Obligation, release stages and acceptance

Every requirement has a unique ID (e.g. **FA-ERF-01**) and an acceptance criterion against which its fulfilment is checked. The obligation level also determines the release stage.

| Obligation | Meaning | Release stage |
| --- | --- | --- |
| must | The product is not sold without this requirement | Market launch |
| should | Implemented next after market launch | Expansion |
| deferred | Implemented only when its trigger in section 19 occurs; the obligation is then set anew (FA-EIN-02) | On demand |

Values marked **initial value** are set by this specification for market launch; the operator can adjust them afterwards without changing the software (FA-BTR-02). Acceptance is based on the initial values. Section 16 describes the acceptance procedure.

## 2 Product overview

The product takes users from any text or document to a verdict for each reference: **capture and structure**, **search and score**, **judge and correct**.

**Verification flow, from text to verdict:** input (text, document, reference manager or selection on a web page) → structuring (AI extraction or rule-based parser) → search in the relevant data sources → field-by-field scoring of the candidates → verdict with explanation → correction suggestion, manual confirmation and verification report.

The system accepts documents in all plans and detects the bibliography in them. If the plan includes AI, the AI breaks the references down, including from running text; otherwise the free parser does. After a correction, only the affected reference is checked again.

### 2.1 Usage environments

| Environment | Purpose | Target group |
| --- | --- | --- |
| Browser extension | Checking directly within the workflow: select text on a web page and check it, side panel next to the document | Students, researchers, reviewers |
| Web app | Same functionality without installation; additionally purchasing and changing plans | All users |
| Operator administration | Manage customers, plans, quotas and support | Operator |
| Information offering | Website, documentation and published quality measurement, in German and English | Prospects, users |
| API | At market launch used only internally by the extension and the web app; opening it to third-party systems is deferred (section 12) | Integrators (deferred) |
| Organization administration area | Manage members, seats, billing and keys; deferred (section 12) | Organization administrators (deferred) |

### 2.2 Functional parity of extension and web app

The extension and the web app are two ways into the same product and the same account. They may differ only where a function is bound to the respective environment.

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-GLE-01 | The extension and the web app must offer users the same functionality. All requirements of sections 4 to 11 and 14 apply to both unless explicitly excluded. | Every acceptance test of these sections is run in both environments and passes there. | must |
| FA-GLE-02 | The only exceptions are the context menu for selected text (FA-ERF-03, FA-ERF-04) and the display as a side panel (FA-KON-04), which exist only in the extension, as well as purchasing, changing plans and the operator administration (section 13), which exist only on the web; the same applies to organization administration once section 12 is implemented. For these, the extension forwards to the web. | A feature comparison of both environments shows no further differences; every purchasing and administration path in the extension leads to the web. | must |
| FA-GLE-03 | Both must use the same default settings and deliver the same verdict for the same input and settings. | 50 references from the reference test set (14.4) receive identical verdicts and scores in both environments. | must |
| FA-GLE-04 | Workflow, terminology and presentation of results must be consistent in both. | Visual inspection: terms and workflow steps match. | should |
| FA-GLE-05 | New features must become available in both with the same version. | Release notes of both environments list new features under the same version number. | should |

### 2.3 Business model and plans

Entry is free; at market launch, revenue comes from check packs and the Pro subscription for individual users. Organization licenses and the third-party API follow only when an organization makes a concrete request (section 12). The billing unit is the checked reference.

| Offering | For whom | Scope | Billing |
| --- | --- | --- | --- |
| Guest | Everyone, without an account | Checking with the parser, including entire documents; verdicts with explanation and correction suggestion; small quota per browser | Free |
| Free | Registered users | Like Guest, but with a monthly instead of a daily quota, so that checks of up to 100 references at once are possible; history of the last 5 checks | Free |
| Check pack | Students, occasional users | Pro features for a fixed quota with a validity period, e.g. for one bibliography | One-time, no subscription |
| Pro | Researchers, reviewers, heavy users | AI extraction, verification reports, extended history | Subscription, monthly |
| Organization (deferred) | Publishers, editorial offices, universities, libraries | Pro features for all members, shared quota, administration area, API | Annual license by volume, purchase on invoice |
| API (deferred) | Integrators with an organization account | All verification functions machine-to-machine | Usage-based |

The operator sets prices and the exact scope of each plan (FA-KTO-10). The initial quota values are given in FA-KTO-15.

## 3 Target groups and roles

The product is aimed at people who write, supervise or review academic references, and at the organizations they work for. No account is needed for the basic function; purchasing, history and membership in an organization require an account.

| Role | Goal | Typical use | Pays via |
| --- | --- | --- | --- |
| Guest | Quickly check a reference or list | Free access without an account with a small quota | – |
| Students | Make sure before submission that all sources exist and are cited correctly | Check the bibliography of a thesis, verification report for the supervisor | Check pack; later campus license |
| Researchers | Safeguard their own manuscripts and AI-assisted literature searches | Check reference lists from drafts and reference managers | Pro; later organization license |
| Reviewers and lecturers | Detect invented sources in other people's work | Check bibliographies in batches, document anomalies with a report | Pro; later organization license |
| Operator | Provide, sell and support the service | Plans, customers, quotas, support, key figures | – |
| Editorial offices of journals and publishers (deferred) | Check submitted manuscripts before peer review | Checking within the editorial workflow, together as a team | Organization license |
| Organization administrator (deferred) | Manage their institution's license | Invite members, seats, billing, default settings, API keys | – |
| Integrator (deferred) | Build the verification function into their own systems | Automated API calls | Usage-based API |

Guests remain anonymous. The system recognizes them only by a random, browser-bound identifier that allows no conclusions about the person.

## 4 Use cases

The core use case is checking a complete bibliography (AF-01); the other cases are variants or additions, or serve sales and administration. (AF = use case.)

| ID | Use case | Actor | Result |
| --- | --- | --- | --- |
| AF-01 | Check a bibliography | All users | Every reference has a verdict with explanation |
| AF-02 | Check selected text on a web page | Extension users | The selection is available as input without copying |
| AF-03 | Check a document (PDF, Word) | All users | The bibliography is found and checked |
| AF-04 | Check a reference manager library (BibTeX, RIS) | Researchers | Entries checked, corrections exported back as a file |
| AF-05 | Check a single suspicious reference | All users | Verdict and correction suggestion |
| AF-06 | Correct components and check again | All users | Faulty structuring corrected, verdict updated |
| AF-07 | Confirm or override a verdict manually | All users | The final decision rests with a human and is documented |
| AF-08 | Create and share a verification report | Users with a paid plan | PDF as evidence |
| AF-09 | Create an account and purchase a plan | Guests, account users | Paid access activated |
| AF-10 | Manage an organization | Organization administrator | Deferred (section 12) |
| AF-11 | Integrate checking into a third-party system | Integrator | Deferred (section 12) |
| AF-12 | Support customers and plans | Operator | Quotas, blocks and support handled |

### 4.1 Flow of AF-01 Check a bibliography

1. The user pastes text, selects it on a web page or uploads a document; in documents, the system detects the bibliography.
2. The system breaks the references down into their components – using AI if the plan includes it, otherwise using the rule-based parser. Structuring does not consume quota.
3. The system shows how many references it found and how much quota the check will consume. If the quota suffices, the check starts automatically; otherwise the system offers a partial check or an upgrade.
4. The system searches for each reference in the appropriate data sources, scores the candidates field by field and forms a verdict with explanation and correction suggestion.
5. The system shows the summary and verdicts while the check is running.
6. If necessary, the user corrects components; the system checks the affected reference again.
7. The user confirms or overrides individual verdicts, applies corrections and creates a verification report if needed.

## 5 Capturing references

Users must be able to bring in references the way they already work: as text, as a document, from their reference manager and as a selection on a web page.

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-ERF-01 | The system must provide a multi-line input field for any text containing one or many references. | A pasted text with 100 references is taken over completely. | must |
| FA-ERF-02 | The system must accept PDF and Word documents (.pdf, .docx) and extract their text completely. If a PDF contains no text, the system reports this clearly and counts such cases without storing any content. | For 10 test documents of each format, all references of the bibliography are extracted; a scanned PDF without text leads to a clear message and is counted. | must |
| FA-ERF-03 | The extension must offer the entry "Check selected text" in the context menu for selected text. It opens the side panel and takes over the selection as input. | Selected text on any web page appears as input in the side panel after the entry is chosen. | must |
| FA-ERF-04 | The extension must offer the entry "Open side panel" in the context menu while the side panel is closed. | The entry opens the side panel; while it is open, the entry is disabled. | should |
| FA-ERF-05 | In entire documents, the system must, in all plans and also without AI, automatically detect the bibliography, split it into individual references and check only the bibliography; users can correct the start and end of the selection. | In at least 19 of 20 test documents, the bibliography is delimited correctly and split into individual references without AI; the selection can be moved. | must |
| FA-ERF-06 | The system must import reference lists in BibTeX and RIS format. | Exports from Zotero, Citavi and EndNote with 50 entries each are imported completely. | must |
| FA-ERF-07 | The system reads scanned PDFs without embedded text using optical character recognition. | For 10 scanned test documents, at least 90 % of the references are recognized. | deferred |
| FA-ERF-08 | Before starting, the system must show the number of recognized references and the expected quota consumption. | The display appears before every check; for a complete check it matches the amount deducted, and if the check is cancelled only what was checked is deducted (FA-SUC-08). | must |
| FA-ERF-09 | Checks of 100 references or more (initial value) run in the background; users are notified on completion in the interface and, if they have an account, by e-mail. | A check with 300 references continues after the window is closed; the notification arrives. | deferred |
| FA-ERF-10 | While the input is empty, structuring and checking must be disabled; an example shows the expected format. | With empty input, the start buttons are disabled and an example is visible. | must |
| FA-ERF-11 | Users must be able to reset input and results completely with one action. | After resetting, input, intermediate results and results are empty. | must |
| FA-ERF-12 | The system must accept files of up to 20 MB and checks of up to 1,000 references (initial values); it rejects larger inputs with a message stating the limit. | 20 MB and 1,000 references are accepted; 21 MB and 1,001 references are rejected with a message. | must |
| FA-ERF-13 | The check can be started with a keyboard shortcut. | Ctrl+Enter or Cmd+Enter starts the check. | deferred |

## 6 Structuring and correction

The system must break every reference down into its bibliographic components, because only structured references can be compared with sources field by field. AI extraction is the default; the rule-based parser serves as the free path without AI.

| Attribute | AI extraction | Rule-based parser |
| --- | --- | --- |
| Input | Any text, including running text and entire documents | Structured references, one per line; for documents, bibliography detection supplies the individual references (FA-ERF-05) |
| Available in | Paid plans, without a user's own key | All plans, also without an account |
| Quota | Structuring consumes none; only the checked reference is billed | Same |
| Afterwards | The check starts automatically if the quota suffices (FA-STR-05) | Same |

### 6.1 General requirements

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-STR-01 | For every reference, the system must store the original text and the structured data in the standard format Citation Style Language (CSL). | For every checked reference, the original text and CSL data can be retrieved and exported. | must |
| FA-STR-02 | The system must process common citation styles, at least APA, MLA, Chicago, IEEE, Vancouver, Harvard, ACS, AMA, Oxford, Springer and DIN ISO 690. | In the reference test set (14.4), at least 90 % of the references of each style are structured correctly via AI extraction. | must |
| FA-STR-03 | If the plan includes AI extraction, it must be usable without a user's own key. Otherwise, the system states the reason, uses the parser and offers an upgrade. | Pro account without a key: AI extraction runs. Free account: the reason, the parser result and an upgrade offer appear. | must |
| FA-STR-04 | Organizations store their own AI provider key (FA-KON-20); AI extraction then runs via their own provider contract. | With a stored key, extractions demonstrably run via the organization's key. | deferred |
| FA-STR-05 | After structuring, the check must start automatically if the quota suffices; otherwise FA-KTO-13 applies. Structuring itself does not consume quota. | With sufficient quota, the search starts without further action; with insufficient quota, the offer from FA-KTO-13 appears first; cancelling during structuring deducts nothing. | must |
| FA-STR-06 | If no references are recognized, the system must report this and give hints on the input. | A text without references leads to a message with hints and consumes no quota. | must |
| FA-STR-07 | The system must point out that AI results can be wrong. | The notice is visible with every AI result. | must |
| FA-STR-08 | Fields that the AI added or changed must be recognizable as such. | Fields changed compared with the original text are marked in the detail view. | must |

### 6.2 Correction

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-STR-10 | For every reference, users must be able to edit the recognized fields (authors, title, year, journal, volume, pages, DOI etc.), regardless of the structuring method. | All fields can be changed for both AI and parser references. | must |
| FA-STR-11 | After a correction, the system must check only the affected reference again; the re-check consumes no quota. | After correcting a reference, only that reference is checked again; the quota balance stays the same. | must |
| FA-STR-12 | Users must be able to remove a reference from the check or add a missing one by hand. | A removed reference is missing from the result and the report; an added one is checked. | must |
| FA-STR-13 | With the parser, users can additionally rename the marked text segments of a reference (single and multiple selection, searchable list of labels) or remove them. | Renamed segments change the fields of the reference accordingly. | deferred |

## 7 Searching data sources

The system must search for every reference in the data sources responsible for its source type and return several candidates. The list of data sources is extensible; new data sources must not worsen existing verdicts. Deferred data sources are added when the quality measurement (14.4) shows values below target for a language or a source type (section 19).

| Data source | Coverage | Obligation |
| --- | --- | --- |
| OpenAlex | Academic works from all disciplines | must |
| Crossref | Publications with a DOI, including notices of retractions | must |
| Semantic Scholar | Cross-disciplinary academic literature | must |
| Europe PMC | Biomedicine and life sciences | must |
| arXiv | Preprints from physics, mathematics, computer science and related fields | must |
| Book catalogs via ISBN (e.g. Open Library, Google Books) | Books and book chapters | must |
| German-language library catalogs (e.g. German National Library) | German-language literature | deferred |
| Web sources | Reachability of the URL and archived version (e.g. Internet Archive) | must |
| DataCite | Research data | deferred |
| DBLP | Computer science conference papers | deferred |

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-SUC-01 | The system must select data sources according to the source type of the reference, e.g. book catalogs for books, and search the responsible data sources until a unique match is found (FA-SUC-06). | According to the search log, test references for a book, a web page and a journal article are searched in the respective responsible data sources. | must |
| FA-SUC-02 | If a reference contains an identifier (DOI, ISBN, PMID, arXiv ID), the system must first search specifically for it and only if that fails search by title, authors and other details. | A reference with a valid DOI and an incorrect title is found via the DOI. | must |
| FA-SUC-03 | The system must score several candidates per data source, initial value: up to 5. | For an ambiguous test reference, several candidates per data source are scored and displayed. | must |
| FA-SUC-04 | Candidates must be presented so that they can be compared field by field, with a link to the work found. | Every candidate shows its field values and a working link. | must |
| FA-SUC-05 | If one of several responsible data sources fails, the check must continue with the others; the verdict names the failed data source. If all responsible data sources fail, the verdict is "Not verifiable". | With a simulated failure of one data source, all references are judged and the affected verdicts name it; if all responsible data sources fail, the verdict is "Not verifiable". | must |
| FA-SUC-06 | The search for a reference must end as soon as a candidate matches unambiguously (early termination); the operator sets the threshold. | With an unambiguous match in the first data source, the search log shows that no further sources were queried. | must |
| FA-SUC-07 | The system must check several references concurrently and show progress per reference and overall. | Progress updates during the check; the performance targets from 14.5 are met. | must |
| FA-SUC-08 | Users must be able to cancel a running check at any time; finished verdicts are kept and unchecked references are not billed. | Cancelling halfway: finished verdicts remain visible and only they are deducted. | must |
| FA-SUC-09 | The system should check whether a publication found has been retracted. | Known retracted test publications are recognized as retracted. | should |
| FA-SUC-10 | In expert mode, users switch individual data sources off and on and set their order (FA-KON-11). | A disabled data source is not queried; the order is respected. | deferred |

## 8 Scoring and verdict

The system must compare every reference with its candidates using rules and derive a verdict from this. The same input, the same source situation and the same settings always yield the same verdict; no AI decides the verdict.

### 8.1 Scoring rules

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-ABG-01 | The system must determine a similarity value from 0 to 100 % for every scored field. Typos such as missing, additional, replaced or transposed characters reduce the value proportionally. | "Jouranl" instead of "Journal" yields a field score above 80 % and below 100 %. | must |
| FA-ABG-02 | Only fields present in both the reference and the candidate may be compared. | If the year is missing in the reference, the score does not change because of it. | must |
| FA-ABG-03 | The overall score must be the weighted mean of the field scores; the weights of the scored fields add up to 100 %. | Recalculating 10 test cases at the defined internal precision yields the stored scores and their two-decimal display. | must |
| FA-ABG-04 | The candidate with the highest overall score counts as the best match. | The highest-scoring candidate is marked as best; a tied score alone does not establish identity, and verified identifier evidence may select a tied highest-scoring source as described in 8.4. | must |
| FA-ABG-05 | The system must apply the field-specific comparison rules from 8.3. | Every example given in 8.3 yields the field score described there. | must |
| FA-ABG-06 | Every verdict must carry the version of the scoring rules. | The result and the verification report show the version. | must |

### 8.2 Default weighting

| Field | Weight |
| --- | --- |
| Title | 30 % |
| Authors | 25 % |
| Publication date | 15 % |
| Journal or edited volume | 15 % |
| DOI | 10 % |
| Volume | 3 % |
| Pages | 2 % |

Weights and thresholds are calibrated and apply equally to all users. An expert mode for deviating values is deferred (10.2).

Field scores and overall scores are processed and stored to six decimal places in percentage points and displayed to two. Display rounding must not affect thresholds, ranking or verdicts. Keep normalized full agreement separately from rounded similarity: a real deviation never becomes agreement merely because the score rounds to 100 %. Comparison rules, precision and thresholds belong to the scoring rules version. The initial field weights above remain unchanged by this revision.

### 8.3 Comparison rules

All rules are always active. Switching off individual rules or comparing character by character without normalization ("Strict" mode) belongs to the deferred expert mode (10.2).

- **Normalization of spelling:** typography, damaged characters, Unicode representation, accents, umlauts ("ü" = "ue"), punctuation, whitespace, upper and lower case.
- **Normalization of identifiers:** DOI, ISBN, ISSN, PMID, PMCID and arXiv ID without prefixes; URLs without tracking parameters and fragments.
- **Authors:** assign names one-to-one; one candidate author cannot satisfy multiple supplied names. The same surname plus compatible initials counts as a match ("Müller, A. B." = "Muller, Anna"). Incompatible full given names do not become equal through shared initials. Reversed author order and unmarked missing coauthors are deviations; an explicitly recognized "et al." abbreviation may omit trailing coauthors without a penalty. Exact similarity weights and order penalties require calibration.
- **Structured dates:** compare only year, month and day components present on both sides, renormalizing their weights. The year counts most; a deviation of exactly one year receives half agreement on the year component. "2021" against "2021-06-15" fully agrees on the shared year. Component weights require calibration.
- **Volume and issue numbers:** recognize numbers in combined notations ("Vol. 12 (3)" = volume 12).
- **Page ranges:** expand abbreviated notation such as "123-8" first. Agreement is the proportion of cited pages contained in the source range: a contained single page or range receives full agreement ("125–126" within "123–128" = 100 %); partial overlap receives proportional agreement ("127–130" against "123–128" = 50 %); no overlap receives zero. A valid contained location is preserved in correction suggestions.
- **Journal title variants:** ignore appended acronyms in brackets ("Journal of Testing (JOT)" = "Journal of Testing").
- **Retraction title prefix:** ignore a candidate-side "RETRACTED: " prefix for comparison only when provenance establishes that the data source added it and retraction is known. Preserve raw values, never strip arbitrary reference text, and retain the retraction marker independently of the verdict. Unknown retraction evidence is not a verified negative.

### 8.4 Verdict

**Score and identity are separate.** A high score alone is not an unambiguous match. A supplied verified DOI, ISBN, PMID or arXiv ID must identify the candidate without strong identity counterevidence. Without identifier proof, articles and books require strong title and author agreement and a sufficient lead over different sources. A title alone is insufficient when authors are absent. Web sources require the same or verified canonical target URL and a matching title; HTTP 200 alone is insufficient. Similarity, counterevidence and lead thresholds require calibration.

For equal highest scores belonging to different sources, unique verified supplied-identifier evidence may select one tied source if there is no strong counterevidence. Otherwise the result remains ambiguous. Display ordering alone never establishes identity. Different identifiers or editions are not automatically treated as equivalent; unresolved identity is Not verifiable. A confirmed wrong ISBN is a deviation when the intended source is independently and unambiguously established; it does not change the fixed score weights or become DOI conflict.

**Precedence and incomplete evidence:**

1. Outside-coverage references receive Not verifiable before DOI-conflict assessment; no mandatory DOI verification is required there.
2. Within coverage, a confirmed non-existent or foreign DOI takes precedence over Mixed citation. Retain any mixed-component evidence in the explanation.
3. An unavailable mandatory verification step produces Not verifiable; a DOI resolver failure is neither confirmed non-existence nor a foreign DOI. Do not finalize Mixed citation while unavailable mandatory DOI evidence leaves the higher-priority DOI condition unresolved.
4. Mixed citation requires strong evidence for different sources with contradictory opposing fields, such as title from one and authors from another. Shared authors or similar titles alone are insufficient.
5. Otherwise apply the identity, deviation, ambiguity and completed-no-match conditions below. Failed or uncompleted mandatory work is never a successful empty response. A source failure is named and other responsible sources continue (FA-SUC-05); completed, sufficient evidence may still establish a source, but incomplete mandatory work cannot establish a negative result.

For web sources, 403, 429, timeouts and unclear error/soft-404 pages produce Not verifiable. A definitive 404/410 and a completed archive lookup with no matching page produce Not found; unavailable archive verification instead produces Not verifiable. A matching archive for the cited original URL and title can establish existence; a dead original URL is an explicit deviation. These observations do not bypass the covered-reference DOI rule.

| Verdict | Condition | Meaning for users | Color |
| --- | --- | --- | --- |
| Correct | Unambiguous match, all compared fields agree, and no confirmed identifier or URL deviation | The source exists and is cited correctly | Green |
| Exists, with deviations | Unambiguous match with field, confirmed ISBN or original-URL deviations | The source exists, the citation is faulty; fields and correction are named | Yellow |
| Mixed citation | Strong, contradictory component evidence identifies different works, with no higher-priority condition | Typical pattern of AI-generated references | Red |
| DOI conflict | Within supported coverage, the given DOI is confirmed non-existent or belongs to a different work | Strong indication of an invented or wrongly transcribed reference | Red |
| Not found | Completed sufficient searches yield no sufficiently matching candidate; mandatory verification is complete | Presumably invented; check manually | Red |
| Not verifiable | Outside coverage; all responsible data sources failed; ambiguous different sources; insufficient identity evidence; or uncompleted mandatory verification | No statement possible | Grey |

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-ABG-10 | Every fully checked reference must receive exactly one verdict. During the check, after cancellation or in the event of an internal technical error, the system shows a status instead of a verdict; FA-SUC-05 applies to failed data sources. | Every finished reference has exactly one of the six verdicts; ambiguity, insufficient identity evidence and uncompleted mandatory verification receive Not verifiable. Running, cancelled and internally failed ones show a status. | must |
| FA-ABG-11 | Every verdict must have a plain-language explanation that names deviating or missing fields with both values. | For a deviating year, the explanation reads along the lines of "Year 2019 instead of 2021". Not verifiable names the concrete reason, relevant candidates when available and failed or incomplete verification steps; unknown evidence is labelled unknown. | must |
| FA-ABG-12 | For every verdict with an unambiguous match, the system must provide a correction suggestion from the data of the source found, in the selected citation style. | Correct and Exists, with deviations provide a suggestion from proven metadata; DOI conflict does so only if other evidence establishes one source unambiguously. Mixed citation, Not found and unresolved identity do not receive an invented replacement. Valid page locations and original input are preserved; changes are offered, never applied automatically. | must |
| FA-ABG-13 | The system must detect mixed citations, where individual fields such as authors and title match different candidates. | Of 20 test references combining real authors with another work's title, at least 18 receive the verdict "Mixed citation". | must |
| FA-ABG-14 | Within supported coverage, a DOI given in the reference must always be resolved and matched against the other fields. Outside coverage receives Not verifiable before this step. | Covered references with a confirmed non-existent or foreign DOI receive "DOI conflict", ahead of Mixed citation. Resolver unavailability receives Not verifiable; an outside-coverage reference with a DOI remains Not verifiable. | must |
| FA-ABG-15 | The verdict thresholds must be calibrated and the same for all users; the operator sets them based on the quality targets (14.4). | Thresholds are calibrated only on a separate development set; the reference test set evaluates the exact versioned configuration against the unchanged targets from 14.4. Outcome-changing rules or thresholds require a new scoring rules version and a passed quality measurement before release or activation. Not verifiable does not remove records from quality denominators. | must |
| FA-ABG-16 | Users must be able to confirm or override a verdict manually; the change is marked as manual in the result and the verification report. | An overridden verdict is visible with its marking and the original verdict. | must |
| FA-ABG-17 | Retracted publications should be clearly marked regardless of the verdict. | A retracted test publication is marked even with the verdict "Correct". | should |
| FA-ABG-18 | The system matches in-text citations in the running text against the bibliography and reports missing and never-cited entries. | A test document with 2 missing and 2 never-cited entries leads to 4 messages. | deferred |
| FA-ABG-19 | The system checks whether the source found supports the cited statement; the result is labelled as an AI-assisted assessment and does not feed into the verdict. | The assessment appears separately from the verdict and is labelled. | deferred |

Not verifiable is a final verdict billed under the existing quota rules, including its additional reasons; a re-check of the same reference slot remains free. Statuses are not billed. This revision does not change quality targets or permit excluding ambiguous or insufficient-evidence records from their denominators.

## 9 Results, evidence and export

Users must see at a glance which references they should re-check, understand for each reference why it was judged that way, and be able to pass on the result as evidence.

### 9.1 Overview

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-ERG-01 | The system must show a summary: number of recognized references, progress and number per verdict. | The figures match the list and update during the check. | must |
| FA-ERG-02 | The verdicts in the summary must act as filters. | Clicking a verdict shows only references with that verdict. | must |
| FA-ERG-03 | Every reference must appear with its title, verdict (color, icon and text, never color alone) and a short explanation. | In greyscale, all verdicts remain distinguishable. | must |
| FA-ERG-04 | The result list should be searchable (original text, title, authors, journal), tolerant of typos. | Searching for an author name with a typo finds the reference. | should |
| FA-ERG-05 | An explanation "How the check works" must be directly accessible, with the note that a verdict is not proof of deception and that the decision rests with a human. | The explanation can be reached from the result list with one click and contains the note. | must |

### 9.2 Detail view of a reference

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-ERG-10 | The detail view must show the original text, recognized fields (editable, 6.2), verdict and explanation. | All four elements are visible in the detail view. | must |
| FA-ERG-11 | The reference and the best match must be shown side by side, field by field; deviations are marked. | Every deviating field is marked, matching fields are not. | must |
| FA-ERG-12 | All candidates must be retrievable in descending order of score, each with data source, score and field values. | The order corresponds to the scores. | must |
| FA-ERG-13 | Users must be able to open the source found in a new tab. | The link opens the source in a new tab. | must |
| FA-ERG-14 | Users must be able to copy the correction suggestion with one click or apply it for the export. | The copied text matches the suggestion; an applied correction appears in the export. | must |
| FA-ERG-15 | Users should be able to report a verdict as wrong. Before sending, they explicitly consent that exactly this reference with its verdict is sent to the operator (FA-BTR-08); without consent, nothing is transmitted. | Without consent, nothing is sent; with consent, the report with reference and verdict appears in the operator area. | should |

### 9.3 Verification report and history

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-ERG-20 | The system must generate a verification report as a PDF: date, document name, version of the scoring rules, all references with verdict, explanation, correction suggestion and manual changes. | The report of a test check contains all the listed elements and can be read with a screen reader. | must |
| FA-ERG-21 | Users share a report via a link; the link expires after 30 days (initial value) and can be revoked. | The link works without signing in and is invalid after 30 days and immediately after revocation. | deferred |
| FA-ERG-22 | Account users must be able to find earlier checks in the history and check them again, within the scope of their plan (FA-KTO-15, FA-KTO-16) and stored according to FA-UEB-11. | An earlier check can be opened and started again. | must |
| FA-ERG-23 | Account users organize checks in the history into projects. | A check can be assigned to a project and found there. | deferred |

### 9.4 Export

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-ERG-30 | The system must export the references as CSL-JSON and BibTeX, optionally with applied corrections. | The export can be imported into Zotero and contains the applied corrections. | must |
| FA-ERG-31 | The system should additionally export to RIS. | The export can be imported into Citavi and EndNote. | should |
| FA-ERG-32 | The system exports a table with verdict and explanation for each reference. | The file opens in a spreadsheet application with one row per reference. | deferred |

### 9.5 Error messages

The system must translate technical errors into understandable messages, at least for: no network connection, too many requests, exhausted quota, expired sign-in, unreachable data source, invalid input and failed scoring. A failed reference must not prevent the other references from being checked. Acceptance: for each of the error types listed, the corresponding message appears in the test, and the remaining references are checked to completion.

## 10 Settings

Users do not need to configure anything to obtain reliable verdicts; the verification parameters are calibrated. Settings are stored in the account, or in the browser without an account, and apply equally in the extension and the web app.

### 10.1 General

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-KON-01 | Users must be able to switch the interface language between German and English; the default is the browser language. | With a German browser, the interface starts in German; switching takes effect immediately. | must |
| FA-KON-02 | Users should be able to choose between light, dark and system theme. | All three options take effect immediately. | should |
| FA-KON-03 | Users must be able to choose a preferred citation style for correction suggestions and export. | The selected style appears in suggestions and export. | must |
| FA-KON-04 | The extension must appear as a side panel next to the open page. | In all supported browsers, the extension icon opens the side panel. | must |
| FA-KON-05 | Users choose whether the extension appears as a side panel or as a popup. | The choice takes effect the next time it is opened. | deferred |

### 10.2 Expert mode (deferred)

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-KON-10 | Users with a paid plan switch on an expert mode. | The option appears only for paid plans. | deferred |
| FA-KON-11 | In expert mode, users switch data sources off and on and set their order. | A disabled data source is not queried; the order is respected. | deferred |
| FA-KON-12 | In expert mode, users choose the scoring fields and their weights; the system only accepts weights that add up to 100 %. | A weighting whose sum is not 100 % cannot be saved. | deferred |
| FA-KON-13 | In expert mode, users switch off individual comparison rules or choose the "Strict" mode. | After a rule is switched off, the corresponding example from 8.3 no longer yields the field score described there. | deferred |
| FA-KON-14 | Verdicts with deviating settings are marked as such in the result and the verification report. | With a changed setting, the result and the report carry the marking. | deferred |
| FA-KON-15 | Every expert setting can be reset to the default. | After resetting, the default values apply again. | deferred |
| FA-KON-16 | Organization administrators can set expert settings as the default for their organization. | Members receive the organization's settings as their default. | deferred |

### 10.3 Own AI key for organizations (deferred)

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-KON-20 | Organization administrators choose an AI provider (OpenAI, Anthropic or Google; others only if they meet FA-UEB-12 and FA-UEB-13), store their own key, test it and delete it; the format is checked before saving. | A valid key is saved and the test reports success; an invalid format is rejected; a deleted key is no longer used. | deferred |
| FA-KON-21 | A stored key must never be displayed in plain text again; the system only shows that one is stored. | After saving, neither an interface nor the API shows the key. | deferred |
| FA-KON-22 | Without its own key, the organization uses the operator's AI within its quota. | An organization without a key can use AI extraction. | deferred |

### 10.4 Onboarding

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-KON-30 | On first start, a short, skippable onboarding should show an example check, the free quota and the plans. | The onboarding appears on first start, can be skipped and does not appear again afterwards. | should |
| FA-KON-31 | The onboarding must not force registration. | A check can be reached without registering. | must |

## 11 Accounts, plans and payment

The basic function can be used without an account; an account is needed by anyone who wants to buy, keep their history or belong to an organization. Purchasing, changing plans and cancelling work entirely via self-service and comply with the rules for consumer contracts (11.3).

### 11.1 Guest access and account

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-KTO-01 | Checking must be usable without registration, within the guest quota (FA-KTO-15). | A check runs without an account; once the quota is exhausted, a notice about accounts and plans appears. | must |
| FA-KTO-02 | Users must be able to register and sign in by e-mail with a one-time code or link, without a password. | Registration and signing in again by e-mail work without a password. | must |
| FA-KTO-03 | An account must apply equally in the extension and the web app. | After signing in, the extension shows the same plan and history as the web. | must |
| FA-KTO-04 | Users must be able to delete their account themselves. Verification data are deleted immediately; billing data remain stored and blocked for the statutory period of 8 years, which the system points out before deletion. | After deletion, verification data can no longer be retrieved; invoices are accessible only to the operator's accounting. | must |
| FA-KTO-05 | Users export their data themselves in a machine-readable format; until then, FA-BTR-11 applies. | The export contains account data, history and invoices. | deferred |
| FA-KTO-06 | Users secure sign-in with a second factor. | With the second factor enabled, sign-in requires it. | deferred |
| FA-KTO-07 | Results of a guest session are transferred to the new account on registration. | After registration, the results appear in the history. | deferred |
| FA-KTO-08 | Users register and sign in with a Google or Microsoft account. | Both paths lead to a usable account; an existing account with the same e-mail address is linked. | deferred |

### 11.2 Plans and quotas

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-KTO-10 | The system must implement the plans from 2.3; the operator sets prices, quotas and scope without changing the software. | Changing a quota in the operator area takes effect without a new release. | must |
| FA-KTO-11 | The billing unit must be the checked reference; structuring and re-checks after a correction do not count. | A check with 40 references deducts 40; structuring, correction and re-check deduct nothing. | must |
| FA-KTO-12 | Quota and consumption must be visible at all times; at 80 % and 100 % consumption, the system warns and offers the upgrade directly. | At 80 % and 100 %, the warning appears with an upgrade button. | must |
| FA-KTO-13 | If the quota is insufficient for a check, the system must offer a partial check or an upgrade before starting. | For a list with more references than the remaining quota, the offer appears before the start. | must |
| FA-KTO-14 | Verdicts, explanations and correction suggestions must be included in all plans. | Guests also receive all three. | must |
| FA-KTO-15 | The following initial values apply at market launch: Guest 20 references per day per browser; Free 100 references per month and history of the last 5 checks with a fixed retention period of 30 days; check pack 300 references, valid for 30 days; Pro 1,000 references per month. | The configuration at market launch corresponds to these values. | must |
| FA-KTO-16 | AI extraction, the verification report and the extended history must be reserved for paid plans. Extended history means: any number of checks with the retention period for paid plans according to FA-UEB-11. | In a free account, these functions are locked with a notice about the plans; with Pro and a check pack they are available. | must |

### 11.3 Purchase and payment

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-KTO-20 | Users must be able to buy Pro as a monthly subscription and the check pack as a one-time purchase without a subscription. A check pack is a quota with a validity period; the operator sets both per pack, so that further packs are possible without changing the software. | Both purchases succeed with a test payment; a second pack with a different quota and validity period can be created without a new release. | must |
| FA-KTO-21 | The system must offer credit card and PayPal; card payments require strong customer authentication. | Test payments with both methods succeed; the card payment requires confirmation by the bank. | must |
| FA-KTO-22 | The order button must be clearly labelled as an obligation to pay, and the total price including VAT must be visible before completion. | The button reads "zahlungspflichtig bestellen" ("order with obligation to pay") or equivalent; the gross price is shown next to it. | must |
| FA-KTO-23 | Before the service begins, consumers must consent via a separate, non-preselected option to the immediate start and confirm that they are aware of the loss of their right of withdrawal; the consent is confirmed by e-mail. | Without consent, the service does not start immediately; the e-mail contains the consent and the withdrawal instructions. | must |
| FA-KTO-24 | Invoices must be retrievable in the account; VAT is calculated according to the rules for electronic services, for consumers in the EU at the German rate up to the threshold in FA-KTO-34; business customers can enter their VAT ID; the customer's country is recorded with every purchase. | A tax advisor confirms the tax logic; every test purchase contains the customer's country. | must |
| FA-KTO-25 | Invoices over EUR 250 to domestic businesses must be issued as e-invoices according to EN 16931, e.g. XRechnung; invoices up to EUR 250 are exempt. With the plans at market launch, such invoices are not expected to occur. | An invoice over EUR 250 to a test company passes XRechnung validation. | deferred |
| FA-KTO-26 | Plan changes and cancellation must be possible via self-service; a cancellation takes effect at the end of the paid period. | Upgrade, downgrade and cancellation succeed without contacting the operator. | must |
| FA-KTO-27 | For consumer subscriptions, there must be a button "Verträge hier kündigen" ("cancel contracts here") reachable from every page, leading to a confirmation page with "jetzt kündigen" ("cancel now"); this page contains no retention offers, and receipt is confirmed immediately in text form. | A cancellation via the button immediately leads to an e-mail with the time of receipt and the end of the contract; the legal review confirms the process. | must |
| FA-KTO-28 | After the first term, consumer subscriptions may only be renewed for an indefinite period and must then be cancellable with at most one month's notice. | A monthly subscription can be cancelled at the end of the current month; with FA-KTO-32, the rule also applies to the annual subscription. | must |
| FA-KTO-29 | Organizations purchase on invoice with their own purchase order number. | The purchase order number appears on the invoice; the bank transfer is matched. | deferred |
| FA-KTO-30 | The system offers a free trial for Pro (initial value 14 days); without cancellation it turns into a paid subscription, which is pointed out before completion and by e-mail before it ends. | A trial cancelled before it expires results in no charge. | deferred |
| FA-KTO-31 | The system offers vouchers and a student discount with verification via the university e-mail address. | The voucher and the discount reduce the price. | deferred |
| FA-KTO-32 | Users can also buy Pro as an annual subscription. | The purchase succeeds with a test payment; the renewal complies with FA-KTO-28. | deferred |
| FA-KTO-33 | The system additionally offers SEPA direct debit. | A test payment by direct debit succeeds. | deferred |
| FA-KTO-34 | VAT for consumers in other EU countries is calculated according to their country; the export (FA-BTR-06) contains the data for the OSS return. | Test purchases from two EU countries are shown correctly; the export for one quarter suffices for the OSS return. | deferred |

### 11.4 Abuse protection

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-KTO-40 | An account's quota must become usable only after the e-mail address has been confirmed. | An unconfirmed account uses only the guest quota. | must |
| FA-KTO-41 | In the case of conspicuously many guest requests or registrations from the same origin, a privacy-friendly check for human use without tracking takes place. | An automated mass registration in the test is slowed down; normal use does not trigger a check. | deferred |
| FA-KTO-42 | Registrations with known disposable e-mail addresses are rejected. | A registration with an address from the maintained list is rejected. | deferred |
| FA-KTO-43 | Conspicuous usage, e.g. many accounts with the same payment method or chargebacks, is reported in the operator area. | A corresponding test case appears as a report. | deferred |

### 11.5 Notifications

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-KTO-50 | The system must send e-mails in the account's language for: registration and sign-in, purchase with invoice, failed payment and confirmation of a cancellation. Further occasions come with FA-ERF-09, FA-KTO-30 and FA-KTO-53. | Each occasion generates the appropriate e-mail in the test. | must |
| FA-KTO-51 | Before an annual subscription (FA-KTO-32) is renewed, the system sends a reminder (initial value 14 days in advance). | The reminder arrives 14 days before renewal. | deferred |
| FA-KTO-52 | Non-essential e-mails such as news may only be sent after consent and must be cancellable with one click. | Without consent, no such e-mail arrives; the unsubscribe link takes effect immediately. | must |
| FA-KTO-53 | The system sends e-mails at 80 % and 100 % quota consumption. | Both thresholds generate the appropriate e-mail in the test. | deferred |

## 12 Organizations and third-party API

Organization functions and opening the API to third parties are deferred. They are implemented only when a university, library or publisher makes a concrete request (FA-EIN-02). At market launch, however, the product must be built so that they can be added later without restructuring existing accounts, data and billing (12.1). The organization-related requirements FA-STR-04, 10.3, FA-KON-16, FA-KTO-25, FA-KTO-29 and FA-UEB-14 are also deferred.

### 12.1 Preparation for market launch

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-ERW-01 | Every quota, plan and stored check must be assigned to an owner who is a person at market launch and can later also be an organization. | In the architecture review, the technical concept shows that organizations can be added without restructuring existing data. | must |
| FA-ERW-02 | Existing accounts must later be able to join an organization without re-registering and without losing history or plan. | The scenario "account joins an organization" is described in the technical concept without data migration. | must |
| FA-ERW-03 | Permissions must be checked via roles, even though at market launch there are only the roles guest, user and operator. | Every protected function checks a role; a new role can be added without changing existing functions (review). | must |
| FA-ERW-04 | The extension and the web app must use all business functions via a versioned API with a uniform response and error format that can later be opened to third parties. | Both interfaces use exclusively the documented API. | must |
| FA-ERW-05 | Sign-in must be able to accommodate further methods such as university login without changing existing accounts. | The technical concept describes adding a further sign-in method without changing existing accounts. | must |
| FA-ERW-06 | The payment provider must support purchase on invoice, invoices with a purchase order number and e-invoices according to EN 16931, even if these functions are only used later. | The documented selection decision confirms these capabilities. | must |

### 12.2 Organization account (deferred)

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-ORG-01 | Organization accounts with a fixed number of seats. | An organization with 10 seats admits exactly 10 members. | deferred |
| FA-ORG-02 | Administrators invite members by e-mail. | An invited person becomes a member after accepting. | deferred |
| FA-ORG-03 | People with an approved e-mail domain join without an invitation as long as seats are available. | A person with a confirmed address from the domain joins without an invitation. | deferred |
| FA-ORG-04 | Roles administrator and member; only administrators manage members, seats, billing and keys. | A member cannot call any administration function. | deferred |
| FA-ORG-05 | Shared quota; administrators see the consumption per member but no verification content. | The administrator sees consumption figures but no references or reports. | deferred |
| FA-ORG-06 | Shared projects: members share checks in a project of the organization, e.g. an editorial office for a manuscript. | A member sees a check in the shared project that another member created. | deferred |
| FA-ORG-07 | Sign-in via the university login (SAML, eduGAIN). | Sign-in via a test federation succeeds. | deferred |
| FA-ORG-08 | Log of administrator actions. | Every administrator action appears with time and person. | deferred |
| FA-ORG-09 | Contractual availability of 99.5 % per month and support response time of one working day (initial values). | The model contract contains both values; availability is reported monthly. | deferred |

### 12.3 Third-party API (deferred)

The third-party API requires an organization account, which may also consist of a single person.

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-ORG-10 | Administrators create, rotate and revoke API keys in the self-service portal. | A revoked key is rejected immediately; after rotation, only the new key is valid. | deferred |
| FA-ORG-11 | A new key is displayed exactly once and carries a recognizable prefix. | After the display is closed, the key can no longer be retrieved. | deferred |
| FA-ORG-12 | API keys are not stored in plain text; unknown keys are rejected. | The stored data contain no plain text; an unknown key receives an error message. | deferred |
| FA-ORG-13 | All business functions can be called by third parties: extraction, parsing, search, scoring with verdict and verification report. | For every function there is a documented and tested call. | deferred |
| FA-ORG-14 | Public documentation of the API (FA-ERW-04) with examples. | All examples run against the test environment. | deferred |
| FA-ORG-15 | Every response reports consumption and remaining quota; usage over time can be viewed in the portal. | The values in the response and the portal match. | deferred |
| FA-ORG-16 | Large volumes run as background jobs with notification to an address specified by the customer; limits (initial values): 1,000 references per call, 10,000 per background job. | A job with 5,000 references is processed; larger calls are rejected with a message. | deferred |
| FA-ORG-17 | Test keys without billing. | Calls with the test key consume no quota. | deferred |

### 12.4 Integrations (deferred)

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-ORG-20 | Journal editorial systems (e.g. Open Journal Systems) have submitted manuscripts checked automatically. | A submission in a test instance generates a verification report for the editorial office. | deferred |
| FA-ORG-21 | Reference managers (e.g. Zotero): check the library and write corrections back. | A library with 50 entries is checked; approved corrections appear in Zotero. | deferred |
| FA-ORG-22 | Add-ins for Word and Google Docs: check the bibliography directly in the document. | The result appears in the side pane of the word processor. | deferred |
| FA-ORG-23 | University learning platforms via the LTI standard. | Integration into a Moodle test instance succeeds. | deferred |

## 13 Operator administration

The operator must be able to manage customers, plans and costs without directly intervening in data stores; at market launch, the payment provider's administration and a configuration suffice for this, and a dedicated interface is deferred (section 19). The operator does not see users' verification content; the only exception is references that users report as wrong verdicts with their explicit consent (FA-ERG-15).

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-BTR-01 | The operator must be able to search for accounts and view their plan, consumption and payment status. | Searching for an e-mail address finds the account with these details, without verification content. | must |
| FA-BTR-02 | The operator must be able to maintain plans, prices, quotas, scope and initial values. | A change takes effect without a new release. | must |
| FA-BTR-03 | The operator must be able to block accounts, credit quotas manually and upgrade an account to Pro free of charge for a limited time. | A blocked account cannot sign in; a credit appears immediately in the quota; a time-limited Pro upgrade ends by itself and without a charge. | must |
| FA-BTR-04 | The operator must be able to set request limits per plan, for guests per browser, and in total for all guests and per origin; when a limit is exceeded, users receive a message stating when they can continue. | Exceeding a limit in the test leads to the message with the time. | must |
| FA-BTR-05 | The operator must be able to select and change the AI model for extraction without anything changing for users; only providers that meet FA-UEB-12 and FA-UEB-13 are permitted. | After the change, extractions run with the new model; the quality measurement (FA-UEB-30) and the evidence for FA-UEB-12/13 are available beforehand. | must |
| FA-BTR-06 | The operator must be able to export invoice and payment data for accounting and tax advice, including country and tax rate per invoice and revenue per country. | The export for one quarter contains all invoices with country and tax rate. | must |
| FA-BTR-07 | The operator creates vouchers and discounts. | A created voucher can be redeemed at purchase. | deferred |
| FA-BTR-08 | The operator should be able to receive support requests and wrong verdicts reported with consent (FA-ERG-15) and assign them to an account. | A report from the detail view appears assigned in the operator area. | should |
| FA-BTR-09 | The operator should be able to view key figures: revenue, active users, conversion to paying customers, cost per checked reference and rate of reported wrong verdicts. | The key figures for a test month match the raw data. | should |
| FA-BTR-10 | Manage and block organizations and API keys and enable features in advance for individual organizations. | An enabled feature is visible only to the selected organization. | deferred |
| FA-BTR-11 | The operator must be able to export all data of an account in machine-readable form in order to answer requests for access and data portability within one month (Art. 15 and 20 GDPR). | The export of a test account contains account data, history and invoices in machine-readable form. | must |

## 14 Cross-cutting requirements

These requirements apply equally to all environments and functions.

### 14.1 Language, help and accessibility

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-UEB-01 | Interfaces, messages, verification reports, e-mails, invoices, website and documentation must be available in German and English. | A sample of 50 texts per language shows no missing translation. | must |
| FA-UEB-02 | The extension and the web app must offer help with documentation, frequently asked questions and a contact option. | Help can be reached from every interface with one click. | must |
| FA-UEB-03 | An about page should show the product name, version, version of the scoring rules and a link to the website. | The about page shows all four items. | should |
| FA-UEB-04 | All interfaces must comply with WCAG 2.2 level AA. | A documented self-assessment (automated check, test with keyboard and screen reader) ends without open critical defects. | must |
| FA-UEB-05 | The web app should be usable on smartphones. | Flow AF-01 succeeds on a 360-pixel-wide screen without horizontal scrolling. | should |
| FA-UEB-06 | An independent body audits accessibility according to WCAG 2.2 level AA. | The audit report contains no open critical defects. | deferred |

### 14.2 Data protection and trust

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-UEB-10 | Without an account and without history enabled, texts, documents and references must not be stored permanently; they are deleted no later than 24 hours after the end of the check. References that users report as wrong verdicts with consent (FA-ERG-15) are exempt. | An inspection of the storage 24 hours after a test check finds no content. | must |
| FA-UEB-11 | With history, checks may only be stored after consent; the free plan has a fixed retention period of 30 days, paid plans 90 days (initial values); deletion is possible at any time. | Without consent, no history is created; after the retention period, the entries are deleted. | must |
| FA-UEB-12 | References may only be passed on to the responsible data sources (for search) and to the AI provider (for extraction); AI providers may neither use them for training nor store them beyond processing. | The contracts with the AI providers exclude training and storage. | must |
| FA-UEB-13 | Account and verification data must be stored in the EU; service providers outside the EU only with GDPR-compliant safeguards. | The register of service providers names the storage location and safeguards for each. | must |
| FA-UEB-14 | Organizations should be able to choose processing exclusively within the EU. | With the option selected, the organization uses only services with processing in the EU. | deferred |
| FA-UEB-15 | Product analytics may only take place after consent and must not record any content of the checked references. | Without consent, no analytics events are created; events contain no references. | must |
| FA-UEB-16 | Stored AI keys must be kept encrypted and must neither be displayed nor logged; payment data are processed only by the payment provider. | Logs contain no keys; the operator's systems store no card data. | must |
| FA-UEB-17 | In paid plans, users choose the retention period of the history (7, 30, 90 or 365 days). | After the selected period, the entries are deleted. | deferred |

### 14.3 Legal

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-UEB-20 | Legal notice (Impressum), terms and conditions, privacy policy and withdrawal instructions must be accessible in all environments; when purchasing, users explicitly accept the terms and conditions. | All four can be reached from every interface; a purchase without acceptance is not possible. | must |
| FA-UEB-21 | The privacy policy must disclose which data go to whom for which purpose. | The legal review confirms completeness. | must |
| FA-UEB-22 | Business customers must be able to conclude a data processing agreement online. | A business account concludes the agreement online and downloads it. | must |
| FA-UEB-23 | Terms and conditions, withdrawal instructions, privacy policy, purchase process and license must be legally reviewed before market launch. | The review report of a specialist lawyer is available. | must |

### 14.4 Quality targets

Measurement is based on a reference test set that the operator maintains and versions: at market launch at least 400 real references in at least five citation styles including DIN ISO 690, in German and English, of which at least 20 % are books and book chapters and at least 10 % web sources, as well as at least 150 invented or falsified references from current AI models; afterwards it grows according to FA-UEB-32.

| Target | Measure | Target value |
| --- | --- | --- |
| Correctness, AI path | Share of real APA references with the verdict "Correct" | ≥ 93 % |
| Correctness, parser | Share of real APA references with the verdict "Correct" | ≥ 77 % |
| False alarms, AI path | Share of real, correctly cited references with a red verdict | ≤ 1 % |
| False alarms, parser | Share of real, correctly cited references with a red verdict | ≤ 3 % |
| Detection | Share of invented or falsified references without the verdict "Correct" | ≥ 98 % |
| Detection of entirely invented works | Share with a red verdict | ≥ 95 % |

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-UEB-30 | The quality targets must be measured with every change to the scoring rules and every change of the AI model; a deterioration below the target values prevents release. | A measurement log exists for every released version. | must |
| FA-UEB-31 | The measurement results should be published. | The results of the current version are on the website. | should |
| FA-UEB-32 | The reference test set should grow to at least 1,000 real references in at least ten citation styles and 300 invented or falsified references before measurement results are published (FA-UEB-31) or an organization makes a request. | The version of the reference test set at publication has at least this size. | should |

### 14.5 Performance, availability and security

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-UEB-40 | The mean check duration per findable reference must not exceed 3 seconds. | Measurement over 200 real references. | must |
| FA-UEB-41 | The mean check duration per reference that cannot be found must not exceed 15 seconds. | Measurement over 200 invented references. | must |
| FA-UEB-42 | First verdicts must appear no later than 10 seconds after the start; a list with 100 references is finished after no more than 3 minutes. | Measurement with a test list. | must |
| FA-UEB-43 | The performance targets must apply with at least 50 checks running concurrently (initial value). | Load test with 50 parallel checks. | must |
| FA-UEB-44 | Availability must be at least 99.5 % per month; planned maintenance is announced at least 48 hours in advance. | Monthly measurement; announcements verifiable in the product. | must |
| FA-UEB-45 | For account, plan, billing and history data, at most 24 hours of data may be lost; recovery takes at most 8 hours. | Recovery test before market launch and annually thereafter. | must |
| FA-UEB-46 | Before market launch and annually thereafter, a documented security assessment according to OWASP ASVS level 1 must take place; components used are continuously checked automatically for known vulnerabilities; critical findings are fixed before release. | The security assessment log contains no open critical findings. | must |
| FA-UEB-47 | A status page should inform about outages and maintenance. | An outage in the test appears on the status page. | should |
| FA-UEB-48 | An independent body carries out a security test, annually thereafter; critical findings are fixed before release. | The test report contains no open critical findings. | deferred |

### 14.6 Constraints

- The extension must work in Chromium-based browsers (Chrome, Edge, Brave, Opera) and in Firefox, in each case in the two latest major versions; for Firefox additionally in the current Extended Support Release (ESR).
- The web app must run without installation in the two latest major versions of Chrome, Edge, Firefox and Safari; the acceptance tests are run in all browsers listed.
- **License:** the verification core, extension, web app and shared data models are open under AGPL-3.0; accounts, billing and organization and operator functions are proprietary. Contributions by third parties require a grant of rights that also permits commercial licenses of the core. Before the first release, all included libraries must be checked for compatibility with AGPL-3.0, and the license and the grant of rights must be legally reviewed (FA-UEB-23).

## 15 Market launch and further development

Market launch takes place only after acceptance (section 16). After that, the product grows only through new versions of this specification.

| ID | Requirement | Acceptance criterion | Obligation |
| --- | --- | --- | --- |
| FA-EIN-01 | Before market launch, the website and documentation must reflect the state of this specification; features that do not exist must not be advertised. | A comparison of the website and documentation with the accepted features shows no discrepancies. | must |
| FA-EIN-02 | If a trigger from section 19 occurs, for example a concrete request from an organization, the client sets the obligation of the affected deferred requirements anew and amends the specification before they are implemented. | Before implementation begins, a new version of the specification with the obligation set is available. | must |
| FA-EIN-03 | The operator must review the triggers from section 19 quarterly, the VAT trigger monthly, and record the result. | For every quarter there is a note on all triggers, and one per month for VAT. | must |

## 16 Acceptance

The product is accepted for market launch when all must requirements meet their acceptance criteria and the following evidence is available.

1. **Acceptance log:** result of every acceptance criterion of the must requirements, in the web app and the extension (FA-GLE-01), with date and tested version.
2. **Quality measurement** on the reference test set with all target values from 14.4.
3. **Performance and load test** according to 14.5.
4. **Accessibility self-assessment** according to WCAG 2.2 level AA (FA-UEB-04).
5. **Security assessment** without open critical findings (FA-UEB-46).
6. **Legal review** (FA-UEB-23) and fulfilled license preconditions (14.6).

Deviations in should requirements are recorded in the log and do not prevent acceptance. Deferred requirements are not part of acceptance; the preparation for them (12.1 and section 19), however, is.

## 17 Out of scope

Source Taster checks whether a reference matches a source that actually exists and is cited correctly. The product explicitly does not do the following:

- **No judgment on deception:** a verdict is an indication, not proof. Whether a person has deceived is always decided by a human.
- **No plagiarism check:** textual similarity with other works is not examined.
- **No check of style conformity:** whether a document consistently follows a citation style is not assessed. Correction suggestions are offered; the user's document is not changed automatically.
- **No content check at market launch:** whether a source supports the cited statement is deferred (FA-ABG-19) and never feeds into the verdict.
- **No statement outside the coverage:** source types without a responsible data source, such as laws, archival records or personal communications, receive the verdict "Not verifiable" before DOI verification or DOI-conflict judgment, even when a DOI was supplied.
- **No organization functions at market launch:** organization accounts, campus licenses, the third-party API and integrations are deferred (section 12); the product is, however, prepared for them (12.1).
- **No on-premises operation:** the product is offered as a service of the operator.

## 18 Glossary

| Term | Meaning |
| --- | --- |
| Reference | Bibliographic entry as raw text whose existence and correctness are to be checked |
| Source | Actually published work to which a reference points |
| Data source | Database or catalog in which the system searches for sources, e.g. OpenAlex or a library catalog |
| Hallucination | Reference invented by an AI or incorrectly assembled from real components |
| Structuring (extraction, parsing) | Breaking a reference down into bibliographic fields such as authors, title, year, journal |
| Candidate | Entry returned by a data source that could match the reference |
| Score | Weighted agreement between reference and candidate from 0 to 100 % |
| Verdict | Result per reference: Correct, Exists with deviations, Mixed citation, DOI conflict, Not found or Not verifiable |
| Mixed citation | Reference whose components come from different real works |
| DOI conflict | Within supported coverage, the given DOI is confirmed non-existent or belongs to a different work |
| Correction suggestion | The reference rebuilt from proven metadata of an unambiguously identified source in the selected citation style, preserving valid cited page locations |
| Verification report | Document with all verdicts of a check as evidence |
| History | Stored earlier checks of an account; limited in the free plan, extended in paid plans |
| Expert mode | Area for experienced users in which data sources, weights and comparison rules can be set differently (deferred) |
| Early termination | End of the search for a reference as soon as a candidate matches unambiguously |
| Quota | Number of checked references that a plan allows within a period |
| Plan | Service package with price and quota, e.g. Free or Pro |
| Guest | User without an account |
| Deferred | Requirement that is implemented only when its trigger occurs (section 19) |
| Organization account | Account of an institution with members, seats and a shared quota (deferred) |
| API key | Access key of an organization for automated use (deferred) |
| Own AI key (BYOK) | Access key of an organization to an AI provider, "Bring Your Own Key" (deferred) |
| DOI | Digital Object Identifier, persistent identifier of a publication (e.g. 10.1038/nature12373) |
| CSL | Citation Style Language, standardized format for bibliographic data |
| BibTeX, RIS | Common exchange formats of reference managers |
| WCAG | Web Content Accessibility Guidelines, international standard for accessible web interfaces |
| AGPL-3.0 | Open-source license that also obliges providers of a service to disclose their changes |
| Acceptance criterion | Testable condition by which the fulfilment of a requirement is determined |
| Initial value | Value that this specification sets for market launch and that the operator can change afterwards |
| Reference test set | Versioned collection of real and invented references maintained by the operator for quality measurement |
| E-invoice | Structured electronic invoice according to EN 16931, e.g. XRechnung |
| Check pack | One-time purchase of a quota with a validity period and Pro features, without a subscription |
| Trigger | Observable event from which a deferred requirement is reassessed (section 19) |

## 19 Deferred requirements and triggers

Every deferred requirement is implemented only when its trigger occurs; the client then sets its obligation anew (FA-EIN-02). The operator reviews the triggers according to FA-EIN-03. Numbers in the triggers are initial values; the preparation is part of acceptance for market launch.

| Requirements | Trigger | Preparation for market launch |
| --- | --- | --- |
| Organizations, third-party API and integrations (section 12 except FA-ORG-21 and 22) as well as FA-STR-04, FA-KON-16, FA-KON-20 to 22, FA-KTO-25, FA-KTO-29, FA-UEB-14, FA-BTR-10 | Concrete request from an organization | FA-ERW-01 to 06 |
| FA-KTO-30 free trial for Pro | Conversion from Free to paid is below 2 % after 3 months | Time-limited Pro upgrade by the operator (FA-BTR-03) |
| FA-KTO-32 annual subscription, FA-KTO-51 reminder | 50 active Pro subscriptions with a mean duration of more than 3 months, or 5 customer requests | Validity periods in the plan model (FA-KTO-10); FA-KTO-28 |
| FA-KTO-33 SEPA direct debit | 5 customer requests or conspicuously many purchase abandonments at the payment selection | Payment provider supports SEPA |
| FA-KTO-34 VAT by customer country and OSS return | Sales to consumers in other EU countries reach EUR 8,000 in the calendar year (threshold EUR 10,000); not needed if the payment provider acts as merchant of record and handles VAT | Customer country per purchase (FA-KTO-24), revenue per country in the export (FA-BTR-06) |
| FA-KTO-08 sign-in with Google or Microsoft | 10 user requests or conspicuously many abandoned registrations | FA-ERW-05 |
| FA-KTO-05 self-service data export | More than 3 requests per month | FA-BTR-11 |
| FA-ERG-23 projects, FA-UEB-17 selectable retention period | 5 requests from paying customers for folders or longer retention | Retention periods as initial values (FA-BTR-02) |
| FA-KTO-41 to 43 check for human use, disposable addresses, anomaly reports | Data sources throttle because of load, the overall limit for guests is reached repeatedly, or chargebacks occur | Overall limit and limit per origin (FA-BTR-04) |
| FA-KTO-53 quota e-mails | 5 support requests per month about an unnoticed exhausted quota | Warnings in the interface (FA-KTO-12) |
| FA-KON-10 to 15, FA-SUC-10 expert mode | 5 justified requests from paying customers or a request from an organization | Version of the scoring rules per verdict (FA-ABG-06) |
| FA-KON-05 popup display | 10 user requests or a target browser without a side panel | – |
| Data sources German National Library, DataCite, DBLP (section 7) | Quality measurement or reported wrong verdicts show values below target for a language or source type | Reference test set with German-language books (14.4) |
| FA-UEB-06 independent accessibility audit | Request from a public institution or organization, or the operator has 10 employees or more than EUR 2 million annual revenue | Self-assessment according to FA-UEB-04 |
| FA-UEB-48 independent security test | Request from an organization, 500 paying customers or a security incident | Self-assessment according to FA-UEB-46 |
| Dedicated interface for the operator administration (section 13) | Support effort of more than 4 hours per week or a second person takes over support | – |
| FA-ERF-09 background checks | 5 user requests or conspicuously many cancelled checks of 100 references or more | – |
| FA-ERF-07 OCR for scanned PDFs | More than 5 % of uploaded PDFs without text | Counting according to FA-ERF-02 |
| FA-ERG-21 sharing a report via link, FA-ERG-32 table export | 5 user requests each | – |
| FA-STR-13 renaming text segments in the parser | Reported wrong verdicts show that field editing (FA-STR-10) is insufficient for parser errors | – |
| FA-KTO-06 second factor | Request from an organization, password sign-in is introduced, or the security assessment recommends it | – |
| FA-KTO-31, FA-BTR-07 vouchers and student discount | Planned cooperation, e.g. with a student council or university, or a discount campaign | – |
| FA-ABG-18 matching in-text citations | 10 user requests or competitors offer it as standard | – |
| FA-ERF-13, FA-KTO-07, FA-ABG-19 | 10 user requests each | – |
| FA-ORG-21, FA-ORG-22 reference managers, add-ins | 10 user requests or a request from an organization | FA-ERW-04 |
