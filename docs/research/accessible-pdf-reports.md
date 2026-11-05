# Accessible PDF Verification reports — decision #48

Research retrieved **25 October 2026** for [decision #48](https://github.com/jeffnawroth/source-taster/issues/48), against parent commit `89f02d53ffb68ecbadb5c36f046591fcbcdbf87b`.
Planning evidence only: no library installation, generated PDF, accessibility test, benchmark, deployment, purchase or certification was performed.
Registry metadata, selected release source and one published fontkit archive were inspected; archive inspection was not installation or execution.
The predecessor repository and local copies were not inspected, searched or cloned.

## Governing boundary

- [Requirements v3.3][requirements], FA-ERG-20: PDF with date, document name, Scoring rules version, every Reference's Verdict, explanation, Correction suggestion and manual changes; actual screen-reader readability is mandatory.
- FA-UEB-01/04 require DE/EN and the documented WCAG 2.2 AA self-assessment, including automated, keyboard and screen-reader checks. An independent audit is deferred; neither PDF/UA certification nor purchasing a certified converter is approved.
- FA-UEB-10–13 preserve consent, deletion, restricted disclosure and EU data/location safeguards; FA-UEB-46 requires the security assessment and continuous vulnerability checks. Conversion/scanning SaaS is not an authorized recipient.
- [ADR-0001][adr1]: generation belongs to the open AGPL-3.0-or-later verification program, never the proprietary service. MIT/Apache package labels inform, but do not replace, the required compatibility/legal review, third-party notices and font rights checks.
- [ADR-0002][adr2] and [ADR-0011][adr11]: TypeScript/Node boundary, maintained stable releases and **no pre-1.0 structural dependency, including transitives**. Type-only declarations are a limited exception; compression, layout, font parsing and browser installation are not type-only work.
- [ADR-0012][adr12]: Scalingo Paris, small initial deployment, capacity qualification and €650/month infrastructure ceiling. [ADR-0015][adr15] requires evidenced OS restrictions for hostile document processing; another ordinary process/container does not establish them.
- [ADR-0013][adr13] requires current authorization for queued work, publication and downloads, including revocation/deletion races. A signed URL or valid old token alone is insufficient.
- [ADR-0005][adr5]/[ADR-0016][adr16] fix the authorized generation snapshot: current non-removed Reference slots, actual result/revision, manual indication **and unchanged system Verdict**, current Status for unfinished work, and per-Reference Scoring rules versions when mixed.
- Unsaved fields, export-only suggestion choices and historical results must not become newly verified evidence. Citeproc's pinned style/locale assets remain ADR-0011's concern; PDF generation does not authorize fetching new styles/fonts or changing Reference language.

## Finding and current version snapshot

**No ready-made generator in this shortlist is established as compliant with all accepted boundaries.**
There are technically plausible tagging mechanisms, but the strongest packaged Node candidates hit explicit dependency exclusions; the browser path additionally lacks an approved production runtime/security placement.
The client can choose a bounded qualification/design route below; this note does not choose one or silently waive a requirement.

Official npm `latest` and version-specific records returned the following on retrieval; “stable” here means a non-prerelease published version, not a maintenance/security endorsement. See the package records below.

| Candidate | Published version / license | Relevant maturity finding | Outcome under current rules |
| --- | --- | --- | --- |
| PDFKit | [**0.20.2**][NK], MIT | Generator itself 0.x; mandatory `fflate ^0.8.3` compression also 0.x | Excluded despite real structure APIs |
| pdfmake | [**0.3.13**][NM], MIT | Generator 0.x → `pdfkit ^0.20.2` → `fflate` 0.x | Excluded; 0.3 is not 1.0 |
| `@react-pdf/renderer` | [**4.9.0**][NR], MIT | Direct `pdfkit 0.20.1`; `@react-pdf/font 4.1.2` also uses it; render 4.7.0 uses `abs-svg-path ^0.1.1`, `parse-svg-path ^0.1.2` | Excluded; React and renderer major versions do not cure transitives |
| pdf-lib | [**1.17.1**][NL], MIT; published 2021-11-06 | Core declared dependencies are ≥1; custom-font path needs separate bundled-code assessment (below) | Low-level substrate only; no maintained turnkey tagged-report route established |
| jsPDF | [**4.2.1**][NJ], MIT | Mandatory `fflate ^0.8.1` | Excluded as packaged; visual tables/language do not supply semantic tags |
| Puppeteer / puppeteer-core | [**25.16.0**][NP], Apache-2.0; Node ≥22.12 | Both → `@puppeteer/browsers 3.2.6` → `modern-tar ^0.8.6` | Current packaged route excluded without an explicit change/replacement |

pdfmake 0.3.13 was published on the retrieval date: recheck before selection; beta/dist-tag names and yesterday's dependency trees are insufficient.
This is a focused exclusion inspection, not a resolved pnpm lockfile, complete software bill of materials, advisory scan or compiler/runtime acceptance.
No TypeScript 7/future compiler capability or Node 26 compatibility is inferred from a package having declarations or accepting an older Node minimum.

## What the generators actually expose

### PDFKit, pdfmake and react-pdf

PDFKit 0.20.2 has real author-controlled structure: `tagged: true`, `struct`, `addStructure`, `markStructureContent`, artifact marking, heading/list/table types, document/element/Span language and alternative/actual text. [K]
Authors must build the logical tree, include all meaningful content, preserve word separators and write content in reading order; merely setting `tagged` is insufficient.
Its table implementation creates Table/TR/TH/TD, Scope, Headers, RowSpan and ColSpan attributes when attached through `structParent`. [KT]
Release annotation code attaches link annotations through `structParent`; this is stronger than the same release's stale prose saying logical structure does not support annotations. Qualify the actual link path, not that blanket limitation or a sample PDF. [KL]
Embedded TTF/OTF fonts are supported. Built-in Standard 14 fonts contain metrics only and cannot be embedded; upstream explicitly warns these fail its PDF/UA/PDF/A embedding requirement. [K]
The documented PDF/UA subset/metadata option is an author assertion and checklist, not independently verified conformance or evidence for Source Taster output.

pdfmake 0.3.13 passes document `tagged` (default false), `language`, `displayTitle`, `version` and `subset` to PDFKit. [M]
Its inspected Printer/Renderer path does not establish automatic semantic hierarchy, header-cell associations or reading-order correctness merely from its visual document definition; no PDFKit capability is inherited as a proven accessible pdfmake feature.
It provides ordinary wrapping, tables and fonts, but both the wrapper and underlying engine already fail the maturity rule.

React-pdf's released API exposes Document `language`, Text, Link, fonts and pagination, but no supported report-level tagged structure/table-header API was established in the inspected public declarations. [R]
A React component tree is not evidence of a PDF structure tree; link appearance, bookmarks, text extraction or visually correct page wrapping do not establish screen-reader semantics.
Do not confuse `@react-pdf/renderer` (generation) with PDF.js-based PDF viewers, or assume the separately published [@react-pdf/pdfkit 6.0.1](https://registry.npmjs.org/@react-pdf/pdfkit/6.0.1) is renderer 4.9.0's engine: its metadata names **pdfkit 0.20.1**. [NR]

### pdf-lib and jsPDF

pdf-lib 1.17.1 is TypeScript with low-level PDF objects/operators, drawing, font embedding and `setLanguage`, but its inspected public API supplies no high-level semantic tagging/reading-order/table-association generator. [L]
An owned implementation could write StructTreeRoot, MCIDs/marked content, ParentTree, Link/OBJR associations, language spans and table attributes; that would be substantial new PDF infrastructure, not a supported library feature or a small “enable tags” switch.
Pagination, semantic tables, cross-page order, link relationships and preservation through any save/post-processing step would all require owned evidence.
Declared core graph: `@pdf-lib/standard-fonts ^1.0.0`, `@pdf-lib/upng ^1.0.1`, `pako ^1.0.11`, `tslib ^1.11.1`; the [first](https://registry.npmjs.org/@pdf-lib/standard-fonts/1.0.0) and [second](https://registry.npmjs.org/@pdf-lib/upng/1.0.1) depend on pako 1.x. This narrow graph has no declared 0.x blocker. [NL]
However, Unicode custom-font examples use `@pdf-lib/fontkit 1.1.1`. Its published archive declares pako as the runtime dependency but bundles font machinery: its build manifest lists `@pdf-lib/restructure ^0.0.1`, `@pdf-lib/unicode-properties ^0.0.1`, `@pdf-lib/brotli ^0.0.0`, `unicode-trie ^0.3.0`; the distributed ES bundle includes restructure. [F]
Do not clear that font route from the top-level dependency list: bundled structural components still need qualification/replacement; a `devDependencies` label does not make shipped font parsing type-only.
Standard fonts are limited to their encodings (WinAnsi for Helvetica/Times/Courier); the documented custom-font route supports only glyphs present in the chosen font. Long reference wrapping, shaping, Unicode mappings and maintenance/security of the old release remain unresolved. [L]

jsPDF 4.2.1 has Node builds, TypeScript declarations, custom TTF/UTF-8 support, `setLanguage` and URI link annotations. [J]
The inspected core, language and annotation APIs do not establish a high-level structure-tree/semantic-table generator; a drawn table or HTML rasterization is not a tagged table.
Even an owned tagging extension would first need a permitted replacement for mandatory fflate 0.x and a qualified complete graph. Optional HTML/canvas/SVG paths add dependencies rather than curing that blocker. [NJ]

## Chromium HTML → tagged PDF: technically real, operationally unqualified

Puppeteer is a Node/TypeScript controller; Chrome for Testing/Chromium is a separate native browser executable, with OS libraries, subprocesses, fonts, sandbox and patch lifecycle.
It is neither a pure Node PDF library nor automatically an approved another-language conversion service. A new production browser runtime needs an explicit ADR-0002/0012/0015 decision and evidence; accepted Playwright **CI** does not approve it.
Puppeteer 25.16.0 pins Chrome and chrome-headless-shell **156.0.8078.47** in its revisions file; this is the paired browser version, not an independently established latest global Chrome release. [P]

- Supported API: `page.pdf({ tagged: true, outline: true, preferCSSPageSize: true, waitForFonts: true })`. `tagged` defaults true, `outline` false, font waiting true; both tagging and outline are marked experimental. [P]
- The implementation forwards tagging to CDP `Page.printToPDF.generateTaggedPDF` and outline to `generateDocumentOutline`, waits on `document.fonts.ready`, and requests a PDF stream. CDP marks these flags experimental and otherwise leaves tagging to the embedder. [P]
- Chromium **156.0.8078.47** maps accessibility-tree headings to H1–H6, links to Link, lists to list structure and tables to Table/TR/TH/TD; header scope, header IDs and row/column spans are explicitly emitted. It copies language changes relative to the parent and traverses unignored accessibility children in order. These are implementation facts, not just marketing. [C]
- Skia's writer has structure nodes, Alt/Lang and attributes; its API warns that unsupported drawing effects can rasterize. It does not promise that arbitrary HTML/CSS becomes correct accessible PDF. [S]
- Use semantic HTML in logical DOM order, selected report `lang`, known language changes, meaningful anchors, ordinary text and simple header-associated tables. CSS positioning/reordering, generated/repeated content, hidden content, complex tables, page splits and browser font fallback require inspection of the actual PDF.
- Font loading readiness does not prove embedding, correct ToUnicode mappings, glyph completeness, pronunciation or link focus order. Unicode shaping/ligatures, DE/EN language changes, long identifiers/URLs and text continuing across pages remain output tests.
- Print uses print CSS. Puppeteer's documented header/footer templates do not evaluate scripts or inherit page styles; do not assume repeated headers/footers receive correct artifact semantics. [P]

**Dependency blocker:** Puppeteer's current browser manager uses modern-tar 0.8.6 to unpack archives; the tagged release's source dynamically imports it for tar extraction. Both full Puppeteer and puppeteer-core declare the manager, so simply skipping browser download or choosing core does not remove the dependency. [PB]
`devtools-protocol 0.0.1704951` has declarations/JSON and no main entry; inspect its actual type-only use separately rather than treating it as the same structural blocker. The documented type exception cannot excuse modern-tar.
An owned small TypeScript CDP controller plus a separately pinned browser is a possible qualification route that avoids importing Puppeteer's installer graph; protocol lifecycle, cancellation, process supervision and the entire browser inventory then become owned responsibilities.
An alternative driver is not automatically cleared: Playwright-core **1.64.1** is Apache-2.0 and exposes PDF `tagged`/`outline`, but its complete bundled-code inventory and production browser placement were not qualified here. [PW]

### Scalingo and security evidence

Scalingo's official Node/Puppeteer recipe requires an apt multi-buildpack and lists stack-specific native libraries, including its scalingo-26 list. [H]
It explicitly says **“Puppeteer must be run with the option `--no-sandbox` on Scalingo.”** Puppeteer's own troubleshooting strongly discourages running without a sandbox. [H][PS]
This recipe establishes an installation path, **not** satisfaction of ADR-0015. “We own the HTML template” does not remove hostile Reference/metadata strings, font/layout parsers or rendering-engine vulnerabilities.
No provider-supported evidence was established here for the required production browser sandbox, denied database/key access, constrained network/filesystem/process rights or enforceable per-task resource bounds on the chosen Scalingo placement.
Do not recommend `--no-sandbox` as OS security, assume an ordinary second container suffices, or assume Docker/SYS_ADMIN examples are available or acceptable on Scalingo.
Qualification must prove a supported sandbox/restricted execution boundary, no inherited credentials, denied external/subresource network access, local approved fonts/assets, browser debugging endpoint confinement, forced descendant termination and temporary-profile/PDF cleanup.
If Scalingo cannot support this, a concrete hosting/topology change needs client approval; no provider move or spending is authorized by this research.
Puppeteer's Apache license does not license its browser binary. Chromium source is BSD-style with third-party components; exact Chrome-for-Testing/headless-shell artifacts, codecs, OS packages and font redistribution terms need their own inventory and review. [B]

## Report shape and practical scope to qualify

Proposed evidence shape, for client assessment rather than a decided template:

- One selected-language document title/H1; generation date/time, document name, Check context and applicable common Scoring rules version; a short explanation that Verdicts are evidence for human judgment.
- One heading-led section per current non-removed Reference in stable slot order: original/checked fields identified, current Verdict or Status, explanation, applicable Correction suggestion or explicit absence, provenance/manual changes and actual per-result version.
- For a Manual override, announce effective manual Verdict and the unchanged system Verdict in text, even when they agree. For running/cancelled/failed/not-checked slots, do not substitute a completed old Verdict; historical evidence must be labelled historical.
- Prefer ordinary linear paragraphs/lists; use a small real table only when comparisons benefit from row/column relationships. A giant many-column Reference table is not a requirement and makes long values/page transitions harder to qualify.
- Wrap and continue long References, titles, DOI/URL strings and suggestions without clipping, silent truncation, accidental word joining or links to the wrong destination; mark decorative rules/repeated page furniture as artifacts where supported.
- German and English UI/report labels are mandatory; bibliographic content can contain other scripts. Declare document language and known language spans without inventing a Source language; retain ADR-0011's fixed citation-style locales independently of interface language.
- Pin locally distributed fonts with embedding/redistribution grants and notices, explicit glyph/fallback coverage and verified text mappings. “Unicode support” is not a claim that every script/emoji, bidirectional sequence or combining character works.

The implementation must capture an authorized immutable generation snapshot, not reread changing results halfway through pagination. Snapshot acceptance versus worker-generation timing needs explicit definition under ADR-0005/0016, with current authority rechecked before publish/output.
Generation/delivery can use the open verifier's existing job mechanism, but async delivery policy, timeout, output/page/byte ceilings, concurrency, queue backpressure and expiry are still decision/measurement gaps, not newly invented limits.
No separate SLA for PDF generation is established. Measure cold/warm browser or library time, peak RSS/CPU/output, font loading, cancellation, 1,000 References and contention with the existing 50-Check acceptance load in the **actual** runtime/container.
Generated artifacts/profiles/queue snapshots are verification content: no persistent browser content cache, private-service relay, unapproved SaaS or indefinite artifact store. Apply fixed content expiry, consent withdrawal, deletion/tombstones and backup policy; generation never extends retention.
Authorize enqueue, worker start, snapshot access, publication and every download/output; exercise entitlement loss, Owner blocks, cancellation/deletion and late completion. Already downloaded bytes cannot be recalled. Keep diagnostics, traces and error filenames content-free.

## Verification protocol, not a certification promise

W3C's PDF techniques are informative ways to meet WCAG, not a converter endorsement or an automatic PDF/UA mandate. Relevant techniques include PDF3 reading/tab order, PDF9 headings, PDF21 lists, PDF6 tables, PDF11 links, PDF16 default language, PDF19 language changes, PDF18 title, PDF4 artifacts and PDF1 alternative text where needed. [W]
PDF3 explicitly distinguishes tag order from content order within each tag and asks for actual screen-reader/accessibility-API reading-order checks plus keyboard traversal of focusable content. A DOM axe pass does not validate the exported file.

1. **Reproducible fixture record:** pin generator/driver, browser, Node/container/base image, fonts, template and validation tool versions; retain synthetic DE/EN fixtures, expected semantic outline and snapshot IDs/hashes, actual output and sanitized findings.
2. **Structural inspection:** inspect Catalog Lang/title/viewer preferences, MarkInfo/StructTreeRoot, reachable ordered structure/MCIDs/ParentTree, meaningful content coverage/artifacts, H levels, lists, Link annotations/OBJR and tab order, table TH scope/headers/spans, language overrides, font embedding and ToUnicode/text recovery. Validate actual page breaks and absence of duplicated/missing text.
3. **Machine checks:** a pinned local veraPDF profile can catch relevant machine-verifiable PDF/UA defects; select/report the profile explicitly rather than relying only on metadata autodetection. A UA-profile failure may expose a readability defect or only an additional UA requirement: record that distinction without changing WCAG/FA-ERG-20 acceptance. [V]
4. **Human review:** test actual files with keyboard and screen readers on the acceptance OSs (Windows 11/current macOS), recording reader/viewer versions and pairing. Candidate pairings such as NVDA/Adobe Reader and VoiceOver/a compatible macOS viewer require demonstrated support, not assumed equivalence.
5. **Reading tasks:** find/navigate headings, read every Reference in expected order across pages, distinguish manual/system Verdict and Status, hear DE/EN changes, navigate links/tables and verify the correct row/column context, compare copied text with expected Unicode, and check zoom/reflow/contrast/non-color cues. Inspect structure when a viewer synthesizes reading order for untagged content.
6. **Hard cases:** all six Verdicts and four Statuses, same/different manual confirmations, mixed versions/revisions, absent evidence, removed slots, empty/one/1,000 References, long unbroken URLs, mixed scripts/combining marks, malformed/control strings, page-spanning rows/paragraphs, stale/revoked/deleted snapshots, failed fonts, timeout and concurrent generation.

veraPDF **1.30.3** is the observed [released Maven artifact][VM]; [upstream][VR] identifies GPLv3+/MPLv2+ licensing and Java execution. Its documentation explicitly limits PDF/UA validation to **machine-verifiable checks**, referring human checkpoints to the Matterhorn protocol. [V]
It cannot decide whether a heading is meaningful, language/alternative text is correct, table associations express the intended meaning or the report is usable with a real screen reader.
Use a separately qualified local/offline acceptance tool with synthetic fixtures; this is not approval to add a Java production service, send customer PDFs to a web checker or claim certification from a green report. Tool/binary/license qualification remains necessary.
No PDF/UA conformance identifier, certificate or “accessible” marketing claim is justified until its actual claimed scope and supporting evidence exist; mandatory screen-reader/WCAG evidence cannot be deferred merely because PDF/UA is not mandated.

## Concrete choices and blockers for the client

| Decision route | What it preserves / changes | Evidence still blocking selection or launch |
| --- | --- | --- |
| Own TypeScript report/tagging layer on a qualified stable low-level substrate | Can retain Node-only runtime; pdf-lib is an investigated substrate, not a cleared engine | Missing semantic engine/layout; old-release maintenance; bundled fontkit 0.x; complete permitted font/dependency path; actual readable output, resource and deployment evidence |
| Qualify Chromium as a new production runtime with an owned/permitted driver | Real semantic HTML → PDF implementation; no other-language conversion service implied | Explicit runtime/topology decision; Puppeteer's modern-tar blocker or replacement; Scalingo sandbox incompatibility/unknown supported isolation; browser/font/license inventory; output/load evidence |
| Request a narrowly scoped dependency/native/commercial exception | Could allow researching PDFKit or another tagged SDK instead of owning PDF internals | Client-approved ADR change with named components/versions, maintenance/security/legal rationale and any budget; still needs all output/privacy/hosting proofs |

If neither a compliant owned route nor an explicitly approved exception is acceptable, FA-ERG-20 remains a launch blocker. An untagged PDF, HTML-only replacement, conversion SaaS or unsupported sandbox is not an implicit fallback.

## Primary sources and reproducibility limits

All sources below were retrieved on **2026-10-25**. Release-source links use resolved commit IDs where available; npm version records fix a named version but metadata/dist-tags can change. No dependency installation/lockfile or full binary provenance audit was performed.
W3C, pptr.dev and veraPDF documentation are moving pages; GitHub tags/branches are mutable unless resolved to a commit. Browser source/API support does not prove that the deployed binary contains the same behavior. Reverify actual artifacts before qualification.
Some rendered PDFKit/react-pdf/W3C index pages refused retrieval; official release source and individual W3C technique pages supplied the cited evidence. No commercial engine is added to the shortlist: none was established here to change feasibility within the existing boundaries.

Additional package records: [react-pdf/font 4.1.2](https://registry.npmjs.org/@react-pdf/font/4.1.2), [render 4.7.0](https://registry.npmjs.org/@react-pdf/render/4.7.0), [puppeteer-core 25.16.0](https://registry.npmjs.org/puppeteer-core/25.16.0), [browser manager 3.2.6](https://registry.npmjs.org/@puppeteer/browsers/3.2.6), [modern-tar 0.8.6](https://registry.npmjs.org/modern-tar/0.8.6), [Playwright-core 1.64.1](https://registry.npmjs.org/playwright-core/1.64.1).
Fontkit archive inspected: [1.1.1 tarball](https://registry.npmjs.org/@pdf-lib/fontkit/-/fontkit-1.1.1.tgz), `package/package.json` and `package/dist/fontkit.es.js`; published integrity `sha512-KjMd7grNapIWS/Dm0gvfHEilSyAmeLvrEGVcqLGi0VYebuqqzTbgF29efCx7tvx+IEbG3zQciRSWl3GkUSvjZg==`.
Detailed W3C procedures: [PDF3](https://www.w3.org/WAI/WCAG22/Techniques/pdf/PDF3), [PDF6](https://www.w3.org/WAI/WCAG22/Techniques/pdf/PDF6), [PDF16](https://www.w3.org/WAI/WCAG22/Techniques/pdf/PDF16), [PDF19](https://www.w3.org/WAI/WCAG22/Techniques/pdf/PDF19), [PDF21](https://www.w3.org/WAI/WCAG22/Techniques/pdf/PDF21); [veraPDF CLI profile selection](https://docs.verapdf.org/cli/validation/).
Browser details: Puppeteer release `common/PDFOptions.ts`, `cdp/Page.ts`, `revisions.ts`; browser-manager `src/fileUtil.ts`; [CDP printToPDF](https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-printToPDF). Protocol tip-of-tree is mutable and must be matched to the deployed browser.

[requirements]: https://github.com/jeffnawroth/source-taster/blob/89f02d53ffb68ecbadb5c36f046591fcbcdbf87b/docs/requirements-specification.md
[adr1]: ../adr/0001-open-core-boundary.md
[adr2]: ../adr/0002-tech-stack.md
[adr5]: ../adr/0005-check-reference-lifecycle.md
[adr11]: ../adr/0011-non-ai-structuring.md
[adr12]: ../adr/0012-hosting-operations.md
[adr13]: ../adr/0013-authentication-roles.md
[adr15]: ../adr/0015-security-abuse-protection.md
[adr16]: ../adr/0016-results-presentation-workflow.md
[NK]: https://registry.npmjs.org/pdfkit/0.20.2
[NM]: https://registry.npmjs.org/pdfmake/0.3.13
[NR]: https://registry.npmjs.org/@react-pdf/renderer/4.9.0
[NL]: https://registry.npmjs.org/pdf-lib/1.17.1
[NJ]: https://registry.npmjs.org/jspdf/4.2.1
[NP]: https://registry.npmjs.org/puppeteer/25.16.0
[K]: https://github.com/foliojs/pdfkit/blob/8d72a71c3e2b03f3253c221065e9efcc69ca5b7d/docs/accessibility.md
[KT]: https://github.com/foliojs/pdfkit/blob/8d72a71c3e2b03f3253c221065e9efcc69ca5b7d/lib/table/accessibility.js
[KL]: https://github.com/foliojs/pdfkit/blob/8d72a71c3e2b03f3253c221065e9efcc69ca5b7d/lib/mixins/annotations.js
[M]: https://github.com/bpampuch/pdfmake/blob/e412891dcb09516fc2536a0f02186bdfa2525784/src/Printer.js
[R]: https://github.com/diegomura/react-pdf/blob/2c0b6d4a5d9db397d8cf5de4215e43b08ad5a7ca/packages/renderer/index.d.ts
[L]: https://github.com/Hopding/pdf-lib/tree/4beebbef7a261ed0be089bb1d63a5b6e28cc488a
[F]: https://registry.npmjs.org/@pdf-lib/fontkit/1.1.1
[J]: https://github.com/parallax/jsPDF/tree/4562ce8aa35bd5ecd98cd5e262e3da2af96476f6/src
[P]: https://github.com/puppeteer/puppeteer/tree/a207faf527ce4305b33a6c0f9706b090c21c115e/packages/puppeteer-core/src
[PB]: https://github.com/puppeteer/puppeteer/blob/a207faf527ce4305b33a6c0f9706b090c21c115e/packages/browsers/package.json
[C]: https://github.com/chromium/chromium/blob/1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775/printing/common/metafile_utils.cc
[S]: https://github.com/google/skia/blob/87eb6de3ac825eda202896de2391ea45a5dc1d5d/include/docs/SkPDFDocument.h
[PW]: https://github.com/microsoft/playwright/blob/v1.64.1/docs/src/api/class-page.md
[H]: https://github.com/Scalingo/documentation/blob/339c008235f6afdfc998d798680ad2327e3286bd/src/_posts/languages/nodejs/2000-01-01-puppeteer.md
[PS]: https://pptr.dev/troubleshooting
[B]: https://github.com/chromium/chromium/blob/1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775/LICENSE
[W]: https://www.w3.org/WAI/WCAG22/Techniques/
[V]: https://docs.verapdf.org/validation/
[VR]: https://github.com/veraPDF/veraPDF-apps/blob/7d9b5c3f709846ab83f86ca1a538b24eac2d3f72/README.md
[VM]: https://repo.maven.apache.org/maven2/org/verapdf/verapdf-apps/maven-metadata.xml
