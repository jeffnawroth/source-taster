---
status: accepted
---

# Own the rule-based bibliography detection and parser, and wrap stable TypeScript libraries behind ports for extraction, interchange and rendering

The client accepted this decision on 25 October 2026 in [Non-AI structuring approach](https://github.com/jeffnawroth/source-taster/issues/20). It builds on the evidence in [Non-AI structuring and citation tools](https://github.com/jeffnawroth/source-taster/issues/8), at research commit [`f108533`](https://github.com/jeffnawroth/source-taster/blob/f10853303cd0c8fd588f707041cd9f76a445d48b/docs/research/non-ai-structuring-tools.md). It makes the concrete library choice that [ADR-0002](0002-tech-stack.md) left open. It also fills the handoffs from ADR-0005, ADR-0006, ADR-0007, ADR-0008 and ADR-0010.

- **Owned module.** No package covers bibliography detection, splitting and field parsing under the constraints of ADR-0002. Source Taster builds a deterministic, rule-based TypeScript module for them, and it is on the critical path for both Structuring paths.
- **Libraries behind ports.** PDF, DOCX, BibTeX/RIS and CSL work uses stable TypeScript libraries or owned adapters behind application-owned ports, so each library choice is a two-way door.
- **Never guess.** The parser leaves an uncertain field empty, keeps every value as written, and records where in the original text each field came from.

The cost is owned rule code that must prove 19 of 20 documents and the section 14.4 parser targets, with an explicit escalation path if it cannot.

The baseline is the approved [requirements specification v3.2](../requirements-specification.md). This ADR approves no requirement change. Its interpretations and change-request candidates are listed under Consequences.

## Feasibility first

- **Build order.** The owned detection, splitting and parsing module is built first and measured early against the 20 held-out FA-ERF-05 documents and the section 14.4 parser targets.
- **Escalation.** If held-out documents miss 19 of 20, or the parser misses the section 14.4 targets, the client receives named options:
  - a change request for the target;
  - reopening the "no learned parsing method" constraint of ADR-0002.

  Accepted inputs are never restricted silently.
- **Development documents.** Detection and splitting rules are tuned only on a separate document corpus, initially 60 documents in PDF, DOCX and plain text, in German and English, with hard layouts. The 20 FA-ERF-05 gate documents never enter rule development. Parser field rules are tuned on the existing Development set (ADR-0006).

## Owned module

- **Scope.** Bibliography detection, splitting into References and field parsing form one TypeScript module in the open repository under AGPL-3.0-or-later (ADR-0001).
- **Plain rules.** It uses hand-written TypeScript rules: no parser generator, no learned method, no external service.
- **All eleven styles.** The parser covers all eleven styles of FA-STR-02 in German and English, not only APA. The false-alarm target of section 14.4 (at most 3 %) applies to every real, correctly cited Reference, and a mis-split entry ends as Not found, a red false alarm.
- **Chicago input.** The parser recognizes both Chicago forms, author-date and notes-bibliography.

## Input handling

### Documents and pasted text

This refines ADR-0010, which says documents are delimited first and that the parser runs line by line on pasted text.

- **Files.** Bibliography detection always runs on uploaded PDF and DOCX files.
- **Pasted or selected text.** Text with a bibliography heading followed by entry-like lines counts as a document. The bibliography is delimited, the Bibliography selection is movable, and only that selection goes to AI extraction or the parser. "Documents" in ADR-0010 therefore includes pasted full texts.
- **Lists.** Any other pasted text is a list.
  - In the parser path, a line that does not look like the start of an entry is joined to the previous one, which is typical for lists copied from PDFs.
  - "One per line" (section 6) remains the minimum contract.

### Bibliography selection

- **Several regions.** A Bibliography selection can consist of several regions, for example per-chapter bibliographies. By default all detected regions are selected. Each region can be moved and deselected individually.
- **Footnotes** are never treated as a bibliography.
- **Nothing detected.** If no bibliography is detected, the user sees a clear message and can mark the region by hand. Nothing is guessed and nothing is billed.

### Moving the selection

A boundary correction re-runs Structuring (ADR-0010). Re-structuring everything would give every entry a new slot and bill it again, so a move works on the difference:

- **Unchanged.** A slot whose source span lies completely inside the new selection keeps its fields, corrections and results.
- **Dropped.** A slot outside the new selection is removed, as in FA-STR-12. If it already had a Verdict, it stays billed (ADR-0005).
- **Added.** Only newly included text is structured, in the AI path and the parser path alike.
  - It receives new slots, billed on their first Verdict.
  - They are checked automatically under FA-STR-05; otherwise FA-KTO-13 applies.
- **Cut.** An entry cut by the new boundary becomes a removed slot plus a new slot.

### Rejected lines

This fills the ADR-0010 handoff that the parser must reject lines that are not References.

- **Joining comes first.** Continuation lines are joined to their entry before any check, so a line such as "Journal of X, 12(3), 45–67." is never rejected on its own. Every check below applies to each joined entry.
- **When an entry is rejected.** An entry is rejected when it shows no reference feature: no identifier, no year or "n.d."/"o. J.", and no author–title pattern. Typical examples are headings such as "Literatur", page numbers and running heads.
- **What the user sees.** Rejected entries appear in a collapsible list "Not recognized as a Reference". One click adopts an entry as a Reference, as a new slot under FA-STR-12.
- **Billing.** A rejected entry gets no slot and is not billed.
- **Scope.** The rule applies to AI extraction, the parser and the per-chunk fallback alike.

## Text extraction

- **PDF.** PDF.js (`pdfjs-dist`) is used directly, without `pdf-parse` and without the optional native canvas.
- **DOCX.** An owned adapter over `jszip` 3.x and `saxes` 6.x, both stable, reads:
  - paragraphs and heading styles;
  - numbering;
  - indentation;
  - footnotes.
- **Mammoth is rejected.** The "no pre-1.0 structural dependency" rule of ADR-0002 also covers transitive structural dependencies, and Mammoth parses XML with `@xmldom/xmldom` 0.8 and depends on `lop` 0.4.
- **No OCR and no external converters.** OCR stays deferred (FA-ERF-07).
- **Extraction port.** Both adapters sit behind an extraction port.

### PDFs without text, partially without text, or broken

- **Without text.** No page has extractable text. The user gets the FA-ERF-02 message, and a content-free counter records it. That counter is the OCR trigger of section 19.
- **Partially without text.** Some pages have no text. A visible notice says "Some pages contain no text", and a separate content-free counter records it as supporting evidence for OCR.
- **Encrypted or broken.** These files get their own error message and are **not** counted as PDFs without text.

## Limits and structuring time

- **File size.** "20 MB" means 20 MiB (20,971,520 bytes). The message says "20 MB". The 20 MB and 21 MB test files of FA-ERF-12 pass under either reading.
- **Reference count.** The 1,000-Reference limit is counted after Structuring. At 1,001 the input is rejected with a message, never silently truncated. For documents, moving the Bibliography selection remains available.
- **Resource ceilings (Initial values).**
  - at most 2,000 PDF pages;
  - at most 200 MB of uncompressed DOCX content;
  - an extraction timeout of 60 s.

  Exceeding a ceiling produces its own message and is not counted as a PDF without text.
- **Structuring time (Initial values).** The Check clock starts after Structuring (ADR-0007).
  - a 100-Reference document: at most 10 s at p95;
  - a 20 MB or 1,000-Reference input: at most 60 s at p95.

## Field parsing

- **Identifiers first.** DOI, ISBN, ISSN, arXiv ID, PMID, PMCID and URL are recognized by pattern first and taken out of the remaining text. Authors, year, title, container, volume, issue and pages follow.
- **As written.** Field values are taken as written. Normalized forms are stored separately. This is the same convention as AI extraction (ADR-0010), including `container-title-short` for abbreviated journal titles.
- **Conservative.** An uncertain field stays empty rather than being guessed.
- **No new Status.** There is no "parser unsure" Status or grey reason. A route from a low-confidence parse to Not verifiable would be a change-request candidate against ADR-0008 and is not decided here.
- **Source span per field.** Every field stores the span of the original text it came from. This is the hook for the deferred FA-STR-13 and for marking fields in the interface.
- **Keyword lists.** German and English keyword lists include "Hrsg."/"eds.", "In:", "S."/"pp.", "Aufl."/"ed.", "Bd."/"vol.", "o. J."/"n.d." and "u. a."/"et al.".

## Canonical projection

Parser, AI extraction and import all produce the same canonical CSL projection (ADR-0005). It retains what ADR-0008 needs:

- **Names.** Names are kept in order, with name particles. Corporate authors are stored as `literal`, never as a person.
- **Truncation.** "et al." or "u. a." is recorded as an explicit truncation, not as an author.
- **Partial dates.** A date may be a year, or a year and month. "n.d." or "o. J." means no date, not year 0.
- **Editions.** An edition is stored together with its ISBN.
- **Pages and article numbers.** Page ranges and article numbers such as `e1234` stay separate and are kept as written.
- **Raw and normalized values** are stored separately per field.

### CSL types and routes

One owned mapping table maps the parser result, BibTeX entry types and RIS types to CSL 1.0.2 types, and those to the routes of ADR-0007.

Every one of the 45 CSL 1.0.2 types has a fixed route:

| Route | CSL types |
|---|---|
| Articles | `article`, `article-journal`, `article-magazine`, `article-newspaper`, `paper-conference`, `report`, `thesis`, `review`, `review-book`, `periodical`, `dataset`, `software`, `document` |
| Books | `book`, `chapter`, `entry-dictionary`, `entry-encyclopedia`, `entry`, `classic`, `pamphlet` |
| Web | `webpage`, `post-weblog`, `post` |
| Outside coverage | `legislation`, `bill`, `regulation`, `treaty`, `hearing`, `legal_case`, `standard`, `patent`, `manuscript`, `collection`, `personal_communication`, `interview`, `speech`, `broadcast`, `motion_picture`, `song`, `musical_score`, `performance`, `event`, `graphic`, `figure`, `map` |

- **Outside coverage.** These types have no responsible Data source. Following section 17 of the requirements specification, they receive Not verifiable before any coverage search. This makes ADR-0007's "other types take the article route" precise and extends its list of laws, judgments, archival records and personal communications.
- **Unknown types.** Only a value that is not a CSL 1.0.2 type, or a missing type, takes the article route.

### Identifiers

Identifiers are normalized while the original stays:

- **DOI.** `https://doi.org/` and `doi:` prefixes are removed, and the DOI is lowercased.
- **ISBN** is converted to ISBN-13, and its check digit is validated.
- **ISSN.** Its check digit is validated.
- **arXiv ID.** The old and new schemes are recognized. It is used only for identifier access and is never inferred from an arXiv DOI (ADR-0007).
- **PMID, PMCID and URL.**

## Import

- **BibTeX and BibLaTeX.** BiblioJSON (LGPL-3.0, native TypeScript) is used with its options for raw text, offsets and unknown fields enabled.
- **RIS.** An owned parser with dialect profiles for Zotero, Citavi and EndNote. BiblioJSON loses information on RIS: it takes PY before DA and so loses date precision, it drops name parts, and it handles only one continuation-line form.
- **Import port.** Both run behind an import port. The raw record is kept unchanged as the original input (ADR-0005).
- **"Completely imported" (FA-ERF-06).** Every entry becomes a Reference slot. Every field is either mapped to CSL or kept and shown as an unsupported field.

## Export

- **Source.** The export is built from the current canonical fields (ADR-0005). "With applied corrections" affects only the export.
- **CSL-JSON.** It carries the original input in the `custom` field, so the original and the CSL data are exportable together (FA-STR-01).
- **BibTeX.**
  - The export is traditional BibTeX, not BibLaTeX, in UTF-8. Only BibTeX special characters are escaped.
  - Imported entries keep their original citation key.
  - Unsupported imported fields are **not** written back, so they never carry stale values after a correction. They remain retrievable in the unchanged original input.
- **Zotero reimport (FA-ERG-30)** is proven by the export fixtures of ADR-0006.
- **RIS export.** FA-ERG-31 (should) gets only its hook in the export port now.

## Rendering

- **Renderer.** citeproc-js runs under its AGPL-3.0-or-later option, pinned, behind an owned typed facade, on the server only.
- **Styles and locales.** Official CSL files are pinned to a fixed commit and shipped with the product, never loaded at runtime. They are separately licensed assets under CC BY-SA 3.0, with notices.
- **License layer.** Neither the renderer nor the assets ever enter the dual-licensed transport layer of ADR-0001.

### Style manifest

Each of the eleven styles has exactly one pinned CSL file with a fixed locale that does not follow the interface language. The research inspected style commit `d2cc420` and locale commit `8bef426`.

The APA, MLA, Chicago, IEEE, Vancouver and Harvard files set no default locale, so their locale below is fixed by Source Taster. For the other five styles it is the file's own default locale.

| Style | CSL file | Locale |
|---|---|---|
| APA | `apa.csl` (7th edition) | en-US |
| MLA | `modern-language-association.csl` (9th edition) | en-US |
| Chicago | `chicago-author-date.csl` (18th edition) | en-US |
| IEEE | `ieee.csl` | en-US |
| Vancouver | `nlm-citation-sequence.csl` | en-US |
| Harvard | `harvard-cite-them-right.csl` | en-GB |
| ACS | `american-chemical-society.csl` | en-US |
| AMA | `american-medical-association.csl` (11th edition) | en-US |
| Oxford | `oxford-guide-to-style-notes.csl` | en-GB |
| Springer | `springer-basic-author-date.csl` | en-US |
| DIN ISO 690 | `iso690-author-date-de.csl` (based on DIN ISO 690:2013-10) | de-DE |

- **Single entry.** A Correction suggestion is rendered as one bibliography entry, without number labels such as "[1]" and without disambiguation suffixes such as "2020a".
- **Oxford** is a note style. The bibliography form is rendered, not the footnote.
- **Preferred style (FA-KON-03).** The default is APA until the user chooses another style.

## Versions

- **Measured configuration.** It includes:
  - the parser rules version;
  - the versions of the extraction and import adapters;
  - the style manifest commit for styles and locales;
  - the citeproc-js version.

  Every outcome-affecting change needs a new Quality gate run.
- **Parser path in every gate run.** Every Quality gate run also measures the parser path (ADR-0006).
- **Per slot.** Every Reference slot records its Structuring path (parser, AI extraction or import) with the corresponding version, analogous to the Scoring rules version.

## Considered options

- **Mammoth for DOCX**, rejected because it carries pre-1.0 structural XML dependencies.
- **`pdf-parse`**, rejected in favor of PDF.js directly, which avoids a wrapper.
- **OCR or external converters**, rejected because OCR is deferred and external runtimes violate ADR-0002.
- **AnyStyle, GROBID, CERMINE and refextract**, rejected because they are learned methods or run in other languages.
- **A parser generator such as Chevrotain or Peggy** as the core of the parser, rejected because it is infrastructure only and does not reduce the rule work.
- **Citation.js 0.9**, rejected as pre-1.0.
- **`@retorquere/bibtex-parser`**, rejected because it ships a learned NLP model and pre-1.0 dependencies.
- **Citestyle BibTeX/RIS adapters**, rejected because of documented mapping defects.
- **BiblioJSON for RIS**, rejected because it loses date precision, name parts and continuation lines.
- **BibLaTeX export instead of traditional BibTeX**, rejected because FA-ERG-30 names BibTeX.
- **Re-structuring the whole document after a boundary move**, rejected because it would bill unchanged References again.
- **A locale that follows the interface language**, rejected because a language toggle must not change the chosen citation standard.

## Consequences

- **Owned rule work.** Detection, splitting and parsing are the largest feasibility risk and need early measurement and the separate development documents.
- **Requirements interpretations and change-request candidates:**
  - FA-ERF-12 (interpretation): 20 MB means 20 MiB, and the 1,000-Reference limit is counted after Structuring.
  - FA-ERF-02 and section 6 (interpretation): pasted text with a detected bibliography counts as a document, and lists accept joined continuation lines beyond "one per line".
  - Section 17 (interpretation): every CSL type without a responsible Data source, including bills, regulations, treaties, standards, patents and media types, is outside coverage and receives Not verifiable.
  - FA-ERF-06 (interpretation): "completely imported" means every entry becomes a slot, and every field is mapped or kept as unsupported.
  - FA-ERG-30 (interpretation): BibTeX means traditional BibTeX.
  - FA-STR-02 and FA-KON-03 (interpretation): the eleven styles are represented by the pinned manifest above, with a locale fixed per style; where a file sets no default locale, Source Taster fixes it.
  - FA-STR-01 (interpretation): the original text is exported in CSL-JSON `custom`.
  - ADR-0002 (interpretation): the pre-1.0 rule covers transitive structural dependencies.
  - Change-request candidates if measurement fails:
    - the FA-ERF-05 or section 14.4 targets;
    - reopening the learned-method constraint.
  - Change-request candidate against ADR-0008: a route from a low-confidence parse to Not verifiable. Not proposed.
- **Open scoring gap.** The journal-title abbreviation fog on the map stays open. The parser only stores abbreviations in `container-title-short`.
- **Legal review.** License clearance for citeproc-js, BiblioJSON (LGPL-3.0) and the CC BY-SA 3.0 assets remains outside this plan (section 14.6, FA-UEB-23).
- **Handed-off interfaces:**
  - [Hosting and operations](https://github.com/jeffnawroth/source-taster/issues/22):
    - the content-free counters for PDFs without text and partially without text;
    - the resource ceilings and the structuring-time measurement;
    - CI for the FA-ERF-05, import, export and rendering fixture suites;
    - storage of the private development documents next to the Reference test set.
  - [Operator tools without a dedicated interface](https://github.com/jeffnawroth/source-taster/issues/24):
    - reading the OCR trigger counters;
    - activation of a new parser rules version or style manifest only after a passed Quality gate.
