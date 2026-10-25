---
status: accepted
---

# Generate tagged Verification reports with PDFKit behind an owned adapter, under a narrow pre-1.0 exception

The client accepted this design on 25 October 2026 in [Accessible PDF verification reports](https://github.com/jeffnawroth/source-taster/issues/48), through [F1–F3](https://github.com/jeffnawroth/source-taster/issues/48#issuecomment-6396767268), [F4–F6](https://github.com/jeffnawroth/source-taster/issues/48#issuecomment-6396806618), [F7–F9](https://github.com/jeffnawroth/source-taster/issues/48#issuecomment-6396942093) and [F10–F12](https://github.com/jeffnawroth/source-taster/issues/48#issuecomment-6397018503). The evidence is the [accessible PDF generation research](https://github.com/jeffnawroth/source-taster/blob/0465992aac84cec0bf28b09b52171fab460754ee/docs/research/accessible-pdf-reports.md) and the [PDFKit dependency qualification](https://github.com/jeffnawroth/source-taster/blob/d7a433c5d7f10a302417b1c79a1df3f3dd0cde05/docs/research/pdfkit-dependency-qualification.md).

FA-ERG-20 requires a PDF Verification report that a screen reader can read. No researched generator meets the [ADR-0002](0002-tech-stack.md) bar without an exception. The client therefore chose the smallest exception that gives a real tagged-PDF route. The alternatives were a much larger owned PDF engine, which would still need fontkit's 0.x runtime helpers, and a production browser, which needs `--no-sandbox` on Scalingo and adds more operations and attack surface.

The approved baseline remains [requirements v3.3](../requirements-specification.md). The report content and snapshot rules of [ADR-0005](0005-check-reference-lifecycle.md) and [ADR-0016](0016-results-presentation-workflow.md), and the authority, privacy and deletion rules of [ADR-0013](0013-authentication-roles.md) and [ADR-0015](0015-security-abuse-protection.md), still apply. This is an accepted design. It is not a requirements amendment, a PDF/UA mandate, a generated or tested report, or a certification claim.

## Generation route

- **Engine:** PDFKit 0.20.2 through its Node ESM export, with fontkit 2.0.4 for character mapping, shaping and subsetting. No browser or standalone build is used, and there is no wrapper such as pdfmake or react-pdf.
- **Owned adapter:** an owned TypeScript semantic report adapter in the open verification program builds the report from a typed report model and explicitly authors structure elements, reading order, document and element language, link association, table header association and ActualText where needed. PDFKit stays behind this adapter so that the engine can be replaced without touching the report model.
- **Placement:** generation runs as a worker job inside the open verification program and its qualified execution and storage boundary. The private service, an external conversion or scanning service and a paid provider receive no report content.

## Narrow exception to the maturity rule

This amends ADR-0002's "no pre-1.0 core" rule for one purpose only:

- **Executed pre-1.0 packages:** `pdfkit@0.20.2`, `@swc/helpers@0.5.23` and `base64-js@0.0.8`, pinned exactly.
- **Installed but not executed:** `fflate@0.8.3` and `pako@0.2.9` stay in the production graph, pinned exactly and disclosed. They are not reached on the inspected Node path. No overrides, patches or packaging workarounds remove them. If either becomes reachable, the exception is reassessed.
- **Scope:** only the Verification report adapter. The exception allows no version ranges, no other pre-1.0 engine and no general maturity waiver.
- **Gates before it takes effect:**
  - an actual Source Taster production lockfile reproduces the qualified graph;
  - a full advisory scan under ADR-0015 passes for the whole graph;
  - license notices are reconciled, including brotli's Apache headers, the missing standalone license files and the provenance of the decoder copied into fontkit;
  - the accessibility, font and resource evidence below passes.
- **Review:** every PDFKit or fontkit update triggers a fresh review of the graph and the evidence. The exception ends when stable ≥1.0 releases cover the route.
- **Failure:** if a gate fails, nothing silently switches to Chromium, another engine or an untagged PDF. The matter returns to the client as a change request.

## Report structure

- **Overview first:** document name, capture date and time, Check state and summary counts.
- **One numbered section per current non-removed Reference:** the checked Reference, Verdict and explanation, any eligible Correction suggestion, and manual changes together with the unchanged system Verdict. Each section keeps the Scoring rules version of its result; mixed versions are reported per Reference.
- **Navigation:** clear headings and a logical reading order let a screen reader move between References.
- **Intermediate snapshots:** a report of an unfinished Check is labelled as an intermediate snapshot with its timestamp. Running, not checked, cancelled and failed slots keep their Statuses. An older completed result is never shown as the result of a running Re-check.
- **Language:** the interface language is preselected, and the user can choose DE or EN before generation. Headings, explanations and Status texts use that choice. Bibliographic content and original input keep their own language and are not translated. Suggestions use the selected citation style and its pinned locale.
- **Not evidence:** unsaved field drafts and transient export-only suggestion choices never appear as verified results.

## Generation, delivery and expiry

- **Separate job:** **Create PDF report** starts its own job with visible status while the workspace stays usable. Cancelling the job does not affect the Check. The report consumes no Quota; report entitlement and the request, rate and resource limits still apply.
- **Snapshot timing:** one consistent authorized state is frozen when generation actually begins, not at the queue request. The report shows that capture time. A finished file never changes.
- **Short-lived file:** the file stays in the verification program for at most 15 minutes and never beyond the Check's deletion deadline. Authority, blocks and deletion are rechecked before publication and on every download. There is no archive, shared link or retention extension. After expiry, a still-retained, authorized Check can generate a new report.

## Fonts and resources

- **Fonts:** only local, license-checked fonts are embedded, with defined fallbacks. Diacritics, non-Latin scripts and special characters are tested against actual output. No character becomes a placeholder box or is dropped silently. If a correct report cannot be produced, the job fails with a clear error instead of delivering a defective file.
- **Resources:** PDF jobs have limits on concurrency, time, memory and output size, and they cannot crowd out Checks. The route is qualified up to 1,000 References. A job that exceeds a limit stops in a controlled way, and a truncated report is never presented as complete. The limits are measured and fixed before launch.

## Acceptance evidence

A tagged flag or a green validator alone does not prove readability. Before launch:

- Every build runs automated structure checks on generated reports: tags, reading order, headings, language, links, table headers and Unicode mapping.
- Actual generated reports pass manual screen-reader and keyboard reviews on Windows 11 and current macOS, in DE and EN. The reports cover long References and URLs, page breaks, links, manual Verdicts, every Status and intermediate snapshots.
- Font tests on actual output show no missing or substituted characters, and an impossible report produces a clear error.
- Load tests measure the limits up to 1,000 References and prove controlled stopping without a truncated report.
- Download tests prove expiry, the deletion deadline and current-authority checks, including revocation during a pending job.

Any change to the generator, template or fonts requires fresh evidence.

## Considered options

- **PDFKit behind an owned adapter (chosen):** real tagging mechanisms in TypeScript on Node, with no extra runtime or provider. It needs the narrow exception and the gates above.
- **Owned PDF engine:** far more work to own serialization, layout, tagging and fonts. It would still depend on fontkit and therefore on `@swc/helpers` 0.x.
- **Chromium through Puppeteer:** strong tagging support, but its driver graph has pre-1.0 dependencies, Scalingo requires `--no-sandbox`, and a production browser adds memory, operations and attack surface.
- **pdfmake, react-pdf or jsPDF:** each has pre-1.0 structural blockers, adds wrapper layers, or both.
- **Untagged PDF, HTML-only output or a conversion SaaS:** these fail the screen-reader requirement or the privacy boundary.

## Consequences

- ADR-0002's maturity rule now has one documented exception for the report adapter. Any further exception needs its own client decision.
- The report adapter, its fonts and its exact dependency graph become a maintained component with a re-review on every engine or font update.
- Launch depends on the gates and evidence above. If they fail, the client decides on a change request before any other route is used.
- Legal and license qualification and final requirements traceability keep their existing scope. They must include the reconciled notices and the report evidence cases.
