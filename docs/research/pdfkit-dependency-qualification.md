# PDFKit dependency qualification — decision #48

Primary sources retrieved **2026-10-25**; supplementary to [the prior findings][prior] and [accepted F1–F3][accepted].
**Candidate only, not approved:** PDFKit **0.20.2**, directly from an owned TypeScript semantic Verification report adapter in the open verification program; no pdfmake/react-pdf wrapper, Chromium runtime or paid provider.
ADR-0002's maturity/license boundary still applies; ADR-0005/0016's authorized snapshot, result/revision, Status, manual/system Verdict and version semantics remain mandatory, as do ADR-0015's security gates.
No application/dependency installation, third-party script execution, generated PDF, accessibility test, benchmark, legal signoff or clean-scan claim occurred. Published archives were downloaded and read as data; no further agents or predecessor repository were used.

## Concrete candidate and effort shape

Use the package's **Node ESM export `js/pdfkit.node.mjs`**, embedded locally pinned/licensed TTF/OTF fonts through baseline **fontkit 2.0.4**, and explicitly authored structure; do not import browser/standalone builds. [PK][FK]
The adapter consumes one authorized immutable snapshot and emits Document → H1/overview → numbered H2 Reference sections with paragraphs/lists; DE/EN labels follow the selected report language, retaining bibliographic text and known language changes.
It explicitly distinguishes unfinished Statuses, historical results, effective manual and unchanged system Verdicts, actual checked revisions, applicable suggestions and per-Reference Scoring rules versions. Unsaved drafts/export-only choices are excluded.
Authors own tag membership/order, word separators, pagination, continuation, artifact furniture, meaningful Link labels and any simple table/header relationships; the accepted heading-led layout does not require a giant table.
This is **owned semantic report adapter** work over existing PDF serialization, layout, font subsetting and structure primitives. An **owned PDF engine** route additionally owns those mechanisms or missing tagging/font machinery. Neither effort nor cost was measured; existing primitives do not establish a small implementation or readable output.

## Exact resolver evidence, not a deployed lockfile

A throwaway manifest contained only `private:true`, `name:pdfkit-qualification`, `version:1.0.0`, `packageManager:pnpm@12.5.1`, `dependencies:{pdfkit:"0.20.2"}`; no overrides or hooks.
Under **Node 24.14.0 / pnpm 12.5.1**, ran `pnpm install --lockfile-only --prod --ignore-scripts --registry=https://registry.npmjs.org` in an empty temporary directory. No `node_modules` was created.
The actual pnpm-12-produced `pnpm-lock.yaml` uses lockfileVersion **9.0**, with a package-manager metadata document and a separate application document; the latter resolves **20 package/version entries**, including both base64-js versions.
Whole-file SHA-256: `0ea4eeefc71494bfb3f55b8da70f026af4fa82d4d7f3f89ceb89699658b228b8`.
This is an **ephemeral production-only candidate resolution**, not Source Taster's production workspace/deployment lockfile, Node 26 acceptance, or an installed/executed graph. Only this findings file is committed; the temporary manifest/lock/archive inventory is not a durable repository artifact.
The following is its complete declared application graph; repeated leaves are shared, and Node built-ins are outside npm inventory. Every selected version's registry record and published archive were retrieved; all 20 archives matched their registry SHA-512 integrity values.

```text
pdfkit 0.20.2 → @noble/ciphers 1.3.0, @noble/hashes 1.8.0,
               fflate 0.8.3, png-js 2.0.0, fontkit 2.0.4, linebreak 1.1.0
png-js 2.0.0 → fflate 0.8.3
fontkit 2.0.4 → @swc/helpers 0.5.23, brotli 1.3.3, clone 2.1.2,
                dfa 1.2.0, fast-deep-equal 3.1.3, restructure 3.0.2,
                tiny-inflate 1.0.3, unicode-properties 1.4.1, unicode-trie 2.0.0
@swc/helpers 0.5.23 → tslib 2.8.1
brotli 1.3.3 → base64-js 1.5.1
linebreak 1.1.0 → base64-js 0.0.8, unicode-trie 2.0.0
unicode-properties 1.4.1 → base64-js 1.5.1, unicode-trie 2.0.0
unicode-trie 2.0.0 → pako 0.2.9, tiny-inflate 1.0.3
All other listed nodes have no declared runtime dependencies; no declared peers/optionals.
```

Semver ranges are **conditional registry evidence**, not pins: PDFKit declares `fflate ^0.8.3`, `fontkit ^2.0.4`; fontkit declares helpers `^0.5.12`; linebreak pins base64-js `0.0.8`; unicode-trie declares pako `^0.2.5`. [PK][FK][LB][UT]
The resolver selected **fflate 0.8.3**, not 0.8.2 or a guessed latest; PNG's `^0.8.2` also converged on 0.8.3. Future resolution/workspace overrides may differ.
No graph-only reading can establish shipped-code provenance: archive export targets, imports, source maps and embedded utilities were inspected separately below.

## Every resolved pre-1.0 component and its necessity

Dates below are **npm publication dates for the exact selected version**, not repository activity or support commitments. Registry package roots supply the `time`/`dist-tags` evidence. [times]

| Exact component | Purpose and inspected Node reachability | License and retrieved maintenance/release evidence |
| --- | --- | --- |
| **pdfkit 0.20.2** | Runtime PDF serialization/layout/tagging engine; necessary to this candidate. | MIT, archive LICENSE; npm **2026-08-30**, current latest. Official v0.20.2 release fixes packaging, attachment and linked-text bugs; nonarchived repo pushed **2026-10-23**. [PK][KR] |
| **@swc/helpers 0.5.23** | fontkit's published Node ESM imports `_define_property` and `_ts_decorate`; the latter reexports tslib `__decorate`. Real runtime helpers, not the SWC compiler or type declarations; necessary unchanged. | Apache-2.0, archive LICENSE; npm **2026-05-27**, current latest. Nonarchived SWC repo pushed **2026-10-22**, release v1.16.20 that day; this does not prove helpers-branch support. [SH][SW] |
| **base64-js 0.0.8** | linebreak's Node bundle calls `toByteArray` on its embedded Unicode line-break trie at module initialization. Necessary unchanged even for DE/EN wrapping; fontkit's properties separately resolve **1.5.1**. | MIT, archive LICENSE/LICENSE.MIT; npm **2014-12-31**. Latest **1.5.1**, published **2020-11-11**; nonarchived repo last push **2024-07-25**. No maintained 0.0.x line/support commitment established. [B0][B1][BR] |
| **fflate 0.8.3** | Declared production dependency of PDFKit/PNG; browser compression implementation. Inspected Node ESM/CJS exports instead use built-in **zlib** for PDF streams/PNG: not necessary executable code in this bounded Node path. Still present in the production resolution. | MIT, archive LICENSE; npm **2026-05-16**, current latest. Official v0.8.3 release includes Zip64 buffer-overread fix and other fixes; nonarchived repo pushed **2026-05-16**. No clean-security inference. [FF][FR] |
| **pako 0.2.9** | Installed-graph dependency of unicode-trie; its **builder.js** uses pako for trie construction. Actual trie **index.js** imports tiny-inflate, not pako. Released fontkit/linebreak/properties consume prebuilt data; no builder imported by inspected Node entry paths. Not necessary report-runtime code here. | MIT package label/archive LICENSE; npm **2016-07-21**. Latest **3.0.2**, published **2026-09-12**; nonarchived pako repo pushed **2026-10-24**. No evidence of maintained 0.2.x/security backports. [PA][UT][PR] |

A 0.x number alone proves neither immaturity nor safety. Recent project activity is evidence of activity, not a supported old release, security assurance or satisfaction of ADR-0002.
**Only three are established runtime structural 0.x components in this Node path**; five occur in the declared production graph. Do not describe all five as executed, or silently remove fflate/pako from inventories/policy review.

## Published-code and Unicode inspection

PDFKit's Node export source map includes five bundled `@noble/hashes` ESM files (`utils`, `_md`, `legacy`, `_u64`, `sha2`); their source contents exactly matched the separately retrieved **1.8.0** archive. These are shipped MIT runtime code despite bundling. [PK][NH]
Fontkit's Node map contains its own parser/shaper/subsetter sources; its imports remain external for the dependencies above. Its `src/utils.js` also embeds a decoder **“Based on … base64-arraybuffer. MIT license.”** The copied upstream version/commit is **not attributed**. [FK][FU]
Therefore an exact upstream-version inventory of **all bundled ancestry is not proven**; do not invent a base64-arraybuffer 0.x pin or clear the entire graph from package.json. That attribution/notice provenance is missing proof, bounded to the inspected fontkit artifact.
Linebreak's map includes Parcel's `_empty.js` containing only `"use strict";`, plus generated interop helpers; unicode-properties also contains generated interop code. No full Parcel/SWC build toolchain is imported merely because those tools built the bundles. [LB][UP]
Other archives were inspected for entry imports, distributions and notices: brotli ships its decoder implementation with **Google Apache-2.0 headers**, despite its MIT package label; its encoder build is not fontkit's `brotli/decompress.js` entry. [BT]
The remaining ≥1 nodes serve encryption/hashing (noble), PNG decoding, font binary schemas (restructure), font tables/shaping/state machines (fontkit/dfa), copying/equality, trie inflation/lookups, Base64 and helper support. Their exact metadata/licenses are linked below; majors ≥1 are not a maintenance/security clearance. [other]

Baseline **fontkit 2.0.4**, not `@pdf-lib/fontkit`, supplies character→glyph mapping, OpenType GSUB/GPOS/AAT layout and TrueType/CFF subsetting. PDFKit calls `fontkit.create`, `font.layout(text, features)`, `createSubset/includeGlyph/encode`; no alternative font engine is assumed. [FK][KF]
Actual Unicode path: fontkit `Script.js`/glyph/shaper code → **unicode-properties 1.4.1** → **unicode-trie 2.0.0** → **tiny-inflate 1.0.3**; properties decodes packaged data with **base64-js 1.5.1**. Arabic/Indic/universal shapers also load prebuilt tries; line wrapping separately needs **base64-js 0.0.8**. [FK][UP][UT][LB]
PDFKit's embedded-font code writes subset bytes into **FontFile2/FontFile3**, creates a Type0 Identity-H font, and writes **ToUnicode** from glyph `codePoints`, including multi-code-point ligatures and UTF-16 surrogate pairs. These are real mechanisms, not a universal-glyph or correct-extraction result. [KF]
Pin approved fonts, embedding/redistribution rights and fallback coverage later; no font is selected here. Standard-14 metrics-only fonts do not meet embedding needs. Mixed scripts, missing glyphs, combining marks, bidi, reused glyph mappings and long URLs remain actual-output tests. [KA][KF]
Document `lang` writes Catalog Lang; structure-element and marked-content `lang` write Lang; ActualText/Alt are supported. This is PDF language metadata. PDFKit's font call passes text/features, **not** fontkit's separate shaping-language/direction parameters, so metadata does not prove language-specific shaping/bidi. [KF][KS]
Fontkit npm latest is **2.0.4 (2024-08-09)**; nonarchived repository pushed **2026-10-25**. GitHub's latest Release endpoint returned **v2.0.0 (2022-06-18)**, so that release page alone does not date 2.0.4 or establish its support. [FK][FM]

## Real structure, links and tables — source evidence only

`tagged:true`, `struct`/`addStructure`, MCIDs/ParentTree and ordered children implement real structure; authors choose H1/H2/P/L/LI etc., include meaningful content and mark decoration as Artifact. A tagged flag alone is insufficient. [KA][KS]
Link path: `annotations.js` adds a PDFAnnotationReference through `structParent`; `structure_element.js` assigns annotation **StructParent**, adds its ParentTree entry, and emits **OBJR** children. For `text({link})`, automatic association occurs only while the current structure element is **Link**. Plain visual links are insufficient. [KL][KS][KX]
Table path: `table/accessibility.js` under `structParent` creates **Table/TR/TH/TD**, cell IDs, **Scope**, **Headers**, RowSpan/ColSpan and content callbacks. These are actual associations; page-spanning correctness/order/header repetition remain untested. [KT]
The v0.20.2 accessibility prose still says annotations are unsupported; the released implementation above is more specific. This discrepancy requires actual link/keyboard/output checks, not dismissal of the implementation or assumed conformance. [KA][KL]

## Narrow exception candidate and unresolved gates

**Reviewable runtime allowlist candidate only:** `pdfkit@0.20.2` (MIT), `@swc/helpers@0.5.23` (Apache-2.0), `base64-js@0.0.8` (MIT), solely for this direct Node semantic Verification report adapter and inspected fontkit path. No ranges, wrappers, other 0.x engines, browser runtime or general maturity waiver.
**Not ready for approval:** fflate@0.8.3 and pako@0.2.9 remain in the production graph, although not in the inspected Node execution path. They are disclosed exact pins, **not added to the necessary-runtime exception**. ADR-0002 does not explicitly exempt installed-but-unreached dependencies; policy disposition or a separately qualified packaging change is still required. No change is authorized here.
Full exact shipped ancestry also needs fontkit's copied-decoder provenance; an actual Source Taster pnpm-12 production lockfile/build inventory must reproduce the graph, identify bundled code and preserve exact hashes/notice evidence. The temporary resolution alone cannot close those gaps.
License gaps: fontkit/dfa/brotli archives lack a standalone license file (README/package labels exist); PNG lacks a package `license` field but includes MIT LICENSE; brotli's Apache headers and copied decoder attribution require notice reconciliation. These are review inputs, not a finding of infringement or AGPL compatibility/legal signoff.
Advisory gap: bounded GitHub Advisory API queries for the five exact 0.x versions returned no records at retrieval; this was **not a complete advisory scan**, offline database qualification, bundled-code match or safety finding. Maintain ADR-0015's current full inventory, failed-scan handling and critical/exploitable-high release blocks. [advisories]
Old base64/pako line maintenance, missing attribution, compiler/Node acceptance, actual deployment constraints/resource bounds and packaged-font rights remain unresolved. No exception waives these or a security finding.
After any client decision, qualify synthetic DE/EN output with structural/ToUnicode/font inspection, reading order, keyboard links and actual screen readers, long/mixed-state/page-break cases, authorization/deletion races and bounded generation/load. None has been performed; no PDF/UA certification is asserted.

## Primary sources and retrieval limits

All following URLs were retrieved **2026-10-25**. npm root metadata is mutable; version endpoints/archives fix selected artifacts, and GitHub source links use release gitHeads. Repository push timestamps are not reviewed commits or support promises.
Version records below supply each `dist.tarball`/integrity; archive URL form is `https://registry.npmjs.org/<name>/-/<basename>-<version>.tgz` (scoped helpers: [archive][SHA]). Source-map claims refer to the published archives, not only repository source.

[prior]: https://github.com/jeffnawroth/source-taster/blob/0465992aac84cec0bf28b09b52171fab460754ee/docs/research/accessible-pdf-reports.md
[accepted]: https://github.com/jeffnawroth/source-taster/issues/48#issuecomment-6396767268
[PK]: https://registry.npmjs.org/pdfkit/0.20.2
[FK]: https://registry.npmjs.org/fontkit/2.0.4
[LB]: https://registry.npmjs.org/linebreak/1.1.0
[UT]: https://registry.npmjs.org/unicode-trie/2.0.0
[SH]: https://registry.npmjs.org/@swc/helpers/0.5.23
[B0]: https://registry.npmjs.org/base64-js/0.0.8
[B1]: https://registry.npmjs.org/base64-js/1.5.1
[FF]: https://registry.npmjs.org/fflate/0.8.3
[PA]: https://registry.npmjs.org/pako/0.2.9
[UP]: https://registry.npmjs.org/unicode-properties/1.4.1
[NH]: https://registry.npmjs.org/@noble/hashes/1.8.0
[BT]: https://registry.npmjs.org/brotli/-/brotli-1.3.3.tgz
[SHA]: https://registry.npmjs.org/@swc/helpers/-/helpers-0.5.23.tgz
[FU]: https://github.com/foliojs/fontkit/blob/fbf3b9ef21eebd219eb73e666faed573af0fba09/src/utils.js
[KF]: https://github.com/foliojs/pdfkit/blob/8d72a71c3e2b03f3253c221065e9efcc69ca5b7d/lib/font/embedded.js
[KA]: https://github.com/foliojs/pdfkit/blob/8d72a71c3e2b03f3253c221065e9efcc69ca5b7d/docs/accessibility.md
[KS]: https://github.com/foliojs/pdfkit/blob/8d72a71c3e2b03f3253c221065e9efcc69ca5b7d/lib/structure_element.js
[KL]: https://github.com/foliojs/pdfkit/blob/8d72a71c3e2b03f3253c221065e9efcc69ca5b7d/lib/mixins/annotations.js
[KX]: https://github.com/foliojs/pdfkit/blob/8d72a71c3e2b03f3253c221065e9efcc69ca5b7d/lib/mixins/text.js
[KT]: https://github.com/foliojs/pdfkit/blob/8d72a71c3e2b03f3253c221065e9efcc69ca5b7d/lib/table/accessibility.js
[KR]: https://github.com/foliojs/pdfkit/releases/tag/v0.20.2
[FR]: https://github.com/101arrowz/fflate/releases/tag/v0.8.3
[SW]: https://api.github.com/repos/swc-project/swc/releases/latest
[BR]: https://api.github.com/repos/beatgammit/base64-js
[PR]: https://api.github.com/repos/nodeca/pako
[FM]: https://api.github.com/repos/foliojs/fontkit/releases/latest

Additional retrieved metadata: [PNG 2.0.0](https://registry.npmjs.org/png-js/2.0.0), [ciphers 1.3.0](https://registry.npmjs.org/@noble/ciphers/1.3.0), [brotli 1.3.3](https://registry.npmjs.org/brotli/1.3.3), [clone 2.1.2](https://registry.npmjs.org/clone/2.1.2), [dfa 1.2.0](https://registry.npmjs.org/dfa/1.2.0), [equality 3.1.3](https://registry.npmjs.org/fast-deep-equal/3.1.3), [restructure 3.0.2](https://registry.npmjs.org/restructure/3.0.2), [tiny-inflate 1.0.3](https://registry.npmjs.org/tiny-inflate/1.0.3), [tslib 2.8.1](https://registry.npmjs.org/tslib/2.8.1). <a id="other"></a>
Publication/latest evidence: https://registry.npmjs.org/pdfkit ; https://registry.npmjs.org/fflate ; https://registry.npmjs.org/@swc/helpers ; https://registry.npmjs.org/base64-js ; https://registry.npmjs.org/pako ; https://registry.npmjs.org/fontkit . <a id="times"></a>
Repository activity evidence: https://api.github.com/repos/foliojs/pdfkit ; https://api.github.com/repos/foliojs/fontkit ; https://api.github.com/repos/101arrowz/fflate ; https://api.github.com/repos/swc-project/swc .
Bounded advisory lookups: https://api.github.com/advisories?ecosystem=npm&affects=pdfkit%400.20.2 ; https://api.github.com/advisories?ecosystem=npm&affects=fflate%400.8.3 ; https://api.github.com/advisories?ecosystem=npm&affects=%40swc%2Fhelpers%400.5.23 ; https://api.github.com/advisories?ecosystem=npm&affects=base64-js%400.0.8 ; https://api.github.com/advisories?ecosystem=npm&affects=pako%400.2.9 . <a id="advisories"></a>
