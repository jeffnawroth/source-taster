# Email and Verification report design

Accepted by the owner on 10 November 2026 for #197, part of design-system map #181: **email layout A (App-like) and PDF layout C (Record sheet)**. The prototype branch is `prototype/197-email-report` in both repositories. The layouts retain one product identity while adapting to the medium.

## Shared medium mapping

Continue the calm identity and semantic roles from #193/#195. Use opaque surfaces and six-digit sRGB constants. Glass, blur, ambient fields, animation and runtime CSS variables do not carry into email or PDF. Do not replace glass with a decorative gradient or reintroduce Verdict background tints.

Named backdrops are white paper/message surface (`#ffffff`) and the light mail canvas (`#f5f8fd`). Alpha roles must be flattened on the backdrop where they are actually used. The prototype's `apps/server/prototype/report/mapping.json` records each published sRGB alpha source and its opaque result on both backdrops. Existing text, secondary-text, accent and Verdict-mark roles remain the source of colour values.

The Source Taster wordmark remains real text. The report's bibliographic content, Verdicts and Statuses stay within the open verification program. Transactional messages carry only the existing account/contract metadata in the private service. This decision introduces no shared component or new cross-repository licence exception.

## Transactional email — layout A

Use the app-like, single-column hierarchy: wordmark, calm bounded white surface, event/action heading, short explanation, relevant code or factual record, one primary action when needed, supplementary information/attachments, and a quiet help/legal footer. Do not turn a transactional message into a marketing layout.

Use real text, inline styles and presentation tables for layout, with an explicit document language and an HTML/plain-text pair. Arial/Helvetica sans-serif is the dependable mail fallback; codes use Consolas/Courier monospace. Mail does not require an external font or image to remain readable. Existing accent/text roles, spacing and control shapes provide the brand continuity.

The existing seven launch message types and their triggers remain governed by ADR-0019/0021. No new email type is approved here. No Reference, document name or Check content enters these messages. A sign-in code appears only in the body, never the subject or preheader. Links use the product's domain; DPA packet access still requires authentication, without bearer download credentials in the email.

The accepted private specimens cover DE/EN, HTML/plain text, desktop/360 px and immediate/deferred order start. Complete reviewed legal texts, actual attachments, delivery rules and language selection remain governed by the existing ADRs. This layout acceptance does not replace them.

## Verification report — layout C

Use the Record sheet structure: a clear overview first, followed by numbered Reference sections. Within a section, align the stable field labels on the left and their content on the right. Horizontal separators group the records. Density comes from alignment and spacing; keep readable body text rather than shrinking it to fit more rows.

The overview names the document, capture time and Check state, then presents the six labelled Verdict counts. Status counts form a separate textual group. An unfinished Check is explicitly an intermediate snapshot, not a final report.

Each Reference keeps the checked original text, effective Verdict or current Status, explanation and eligible Correction suggestion preview. Manual changes appear alongside the unchanged system Verdict and change time. Each completed result states its own Scoring rules version. Running/rechecking slots do not reuse an older result as the current result; unsaved field drafts and transient export-only choices do not become report evidence.

Use local **static Atkinson Hyperlegible Next** Regular/Bold/Italic TTFs, **IBM Plex Mono** for metadata and **Noto Sans** for supported glyphs absent from the main face. The captured font assets retain their upstream licences and provenance. The specimens use a 10.7 pt body, 14 pt Reference headings and smaller metadata, with layout measurements and controlled page breaks. Production qualification must exercise long text, links, fallback runs and page boundaries at the supported report sizes.

Draw the six established Verdict glyph silhouettes as vectors, adjacent to neutral readable labels. They are not font characters. Glyph colour is supplementary: shape and text preserve meaning in greyscale. The PDF uses opaque light paper colours; it does not inherit a dark application background.

The report must retain a logical structure tree, heading order, document/element language, Unicode mapping and associated links. Repeated page furniture and redundant decorative glyphs are Artifacts. Existing PDFKit-adapter ownership, snapshot timing, authority, expiry and resource rules remain under ADR-0017.

## Evidence and implementation handoff

The captured prototypes include six tagged five-page PDF specimens in DE/EN, rendered page previews, and a private set of 48 email HTML/plain-text pairs. Thirty PDF pages were rendered independently; heading/link structure and original Cyrillic text were inspected. The 96 mail specimen/width combinations had no horizontal overflow. The galleries support language/layout comparison; the PDF gallery displays pixels from the actual PDFs and downloads those files.

This is acceptance of the visual direction. Actual mail-client and forced-dark-mode checks, human screen-reader review, legal packet/attachment evidence and the remaining production gates remain implementation work. No PDF/UA conformance or delivery claim is made. The prototype code stays out of production; the final design-system ADR/styleguide and implementation issues must carry these choices and the existing acceptance requirements forward.
