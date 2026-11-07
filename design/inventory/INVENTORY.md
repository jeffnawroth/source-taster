# UI baseline inventory (issue #187)

Snapshot of today's UI. Documentation only: no redesign, no fixes, no production code changed.

- Captured 2026-11-07 against the local fake stack (`pnpm dev:local`, standalone, all service data is fixture data) at repo HEAD `5c7d140`.
- Light theme only. DE and EN for every state. DPR 2, desktop viewport 1280x900 unless a name says `narrow390` (390 px); extension shots are 360 px wide.
- Images are WebP (`cwebp -q 82`), resized to 1600 px wide when the source was wider. Full-page captures are tall (up to ~14,600 px high); open them, don't judge them from a thumbnail.
- This branch is never merged and has no PR.

## Public / private split

Written once here and once in the private inventory.

- **Public (this file):** standalone web app, browser extension side panel, website, docs.
- **Private (not in this repo):** everything served by the private service app, any hosted Account / Plan / Quota / History data, the hosted sign-in, and the transactional emails. Rule used: anything served from the service ports, or showing hosted Account data, goes private; when unsure, private.
- The `AccountControls` / `WebAccountWorkspace` / `HistoryPanel` / `DpaControls` / `InvoiceControls` components live in `packages/ui` and are listed below, but their hosted states are only in the private inventory.

## Method and capture limits

- **Fixtures decide the verdicts.** In the fake stack every DOI resolves to the same record, books are "Not checked", and parallel requests hit a fixture rate limit. The 8 example references therefore mostly come back **Not verifiable** (`08-results`, `09-detail-ref*`). `docs/local-preview/demo.bib` (3 records) gives **Correct**, **DOI conflict** and **Not verifiable** side by side (`20-results-bib-three-verdicts`, `21-detail-bib-ref*`). No other verdict (Exists with deviations, Mixed citation, Not found, Technical error) could be produced locally.
- **Extension:** the unpacked extension was built per target and loaded in Chromium with Playwright (`launchPersistentContext`, `--load-extension`). The real browser side panel is not screenshottable by automation. The panel page (`panel.html`) was therefore opened as a tab at a **360 px wide viewport** and captured there. Panel chrome (title bar, close button) is not in the images.
- **PDF / DOCX upload** fails closed in the fake stack ("Document reading is temporarily unavailable"; `17-error-pdf-unavailable`). The extracted-text review step after a successful upload could not be reached.
- **AI extraction** is off in the fake stack, so AI provenance labels and the AI-extraction branch of Structuring were not reachable.
- `06-error-reference-limit` is a viewport-only capture (1280x900). The error message renders below the buttons, outside the frame, so the image shows the 1000-line input but not the message. Not recaptured.
- `13-header-preferences-din-iso-690` is a header crop (language and citation-style selects after choosing DIN ISO 690). Preferences have no screen of their own; see "Preferences" below.
- A "Quota" box (grey bar, "1000 of 1000 checks left · 0 used") appears in the standalone web app and panel from the first Check onward (verified against the standalone stack), so it shows in running, results, error and cancelled states but not in the empty, intake and structured states. It is fixture data. Its bar stays solid grey at 0 used.
- Error states were produced by network interception in the browser (network failure on start, HTTP 500) and by real fixture behaviour (rate limit, PDF unavailable, wrong import format). No server or app code was altered.
- Website: statically built preview (`dist-preview`) served from the local web port. "version-draft" pages are the draft legal texts the site ships.

## Screens and states

Counts: **web app 36 per language (72)**, **extension 7 per language (14)**, **website + docs 24 per language (48)**. Total 134 images.

### 1. Web app (standalone) — `packages/ui` `CheckWorkspace` in `apps/web`

One page, no routing. Language and citation style are two selects in the header; there is no separate Preferences page.

| State | What it shows | Images |
|---|---|---|
| `01-empty` | Landing: header, preview notice, intake card (PDF/DOCX, BibTeX/RIS, text), footer links | [EN](shots/web/en/01-empty.webp) · [DE](shots/web/de/01-empty.webp) |
| `02-intake-filled` | 8 example references pasted | [EN](shots/web/en/02-intake-filled.webp) · [DE](shots/web/de/02-intake-filled.webp) |
| `03-structured` | After Structure References: 8 recognized references | [EN](shots/web/en/03-structured.webp) · [DE](shots/web/de/03-structured.webp) |
| `04-structured-with-rejected-text` | Structuring with text that was not recognized as a reference | [EN](shots/web/en/04-structured-with-rejected-text.webp) · [DE](shots/web/de/04-structured-with-rejected-text.webp) |
| `05-structure-no-references` | Structuring finds nothing | [EN](shots/web/en/05-structure-no-references.webp) · [DE](shots/web/de/05-structure-no-references.webp) |
| `06-error-reference-limit` | 1000-line input over the per-check reference limit (viewport only, message not in frame) | [EN](shots/web/en/06-error-reference-limit.webp) · [DE](shots/web/de/06-error-reference-limit.webp) |
| `07-running` | Check running, 0 of 8 finished, Cancel Check available | [EN](shots/web/en/07-running.webp) · [DE](shots/web/de/07-running.webp) |
| `08-results` | Check finished: summary, export panels, reference list + detail | [EN](shots/web/en/08-results.webp) · [DE](shots/web/de/08-results.webp) |
| `08b-results-viewport-check-summary` | Viewport crop of the finished check summary | [EN](shots/web/en/08b-results-viewport-check-summary.webp) · [DE](shots/web/de/08b-results-viewport-check-summary.webp) |
| `09-detail-ref1` | Reference detail 1 (book, Not checked / Not verifiable) | [EN](shots/web/en/09-detail-ref1.webp) · [DE](shots/web/de/09-detail-ref1.webp) |
| `09-detail-ref2` | Reference detail 2 (DOI present) | [EN](shots/web/en/09-detail-ref2.webp) · [DE](shots/web/de/09-detail-ref2.webp) |
| `09-detail-ref3` | Reference detail 3 | [EN](shots/web/en/09-detail-ref3.webp) · [DE](shots/web/de/09-detail-ref3.webp) |
| `09-detail-ref4` | Reference detail 4 | [EN](shots/web/en/09-detail-ref4.webp) · [DE](shots/web/de/09-detail-ref4.webp) |
| `09-detail-ref5` | Reference detail 5 | [EN](shots/web/en/09-detail-ref5.webp) · [DE](shots/web/de/09-detail-ref5.webp) |
| `09-detail-ref6` | Reference detail 6 | [EN](shots/web/en/09-detail-ref6.webp) · [DE](shots/web/de/09-detail-ref6.webp) |
| `09-detail-ref7` | Reference detail 7 | [EN](shots/web/en/09-detail-ref7.webp) · [DE](shots/web/de/09-detail-ref7.webp) |
| `09-detail-ref8` | Reference detail 8 | [EN](shots/web/en/09-detail-ref8.webp) · [DE](shots/web/de/09-detail-ref8.webp) |
| `10-detail-edit-fields` | Edit fields form in the detail pane | [EN](shots/web/en/10-detail-edit-fields.webp) · [DE](shots/web/de/10-detail-edit-fields.webp) |
| `11-detail-judge-manually` | Judge manually form (manual Verdict) | [EN](shots/web/en/11-detail-judge-manually.webp) · [DE](shots/web/de/11-detail-judge-manually.webp) |
| `12-results-after-report-created` | After Create report (accessible PDF) | [EN](shots/web/en/12-results-after-report-created.webp) · [DE](shots/web/de/12-results-after-report-created.webp) |
| `13-header-preferences-din-iso-690` | Header crop with citation style DIN ISO 690 | [EN](shots/web/en/13-header-preferences-din-iso-690.webp) · [DE](shots/web/de/13-header-preferences-din-iso-690.webp) |
| `14-check-cancelled` | After Cancel Check | [EN](shots/web/en/14-check-cancelled.webp) · [DE](shots/web/de/14-check-cancelled.webp) |
| `15-error-network-on-start` | Error: network failure when starting a check | [EN](shots/web/en/15-error-network-on-start.webp) · [DE](shots/web/de/15-error-network-on-start.webp) |
| `16-error-server-500` | Error: server 500 | [EN](shots/web/en/16-error-server-500.webp) · [DE](shots/web/de/16-error-server-500.webp) |
| `17-error-pdf-unavailable` | Error: document reading unavailable | [EN](shots/web/en/17-error-pdf-unavailable.webp) · [DE](shots/web/de/17-error-pdf-unavailable.webp) |
| `18-error-import-wrong-format` | Error: BibTeX/RIS import with a wrong file | [EN](shots/web/en/18-error-import-wrong-format.webp) · [DE](shots/web/de/18-error-import-wrong-format.webp) |
| `19-import-bib-preview` | BibTeX import preview (`demo.bib`) | [EN](shots/web/en/19-import-bib-preview.webp) · [DE](shots/web/de/19-import-bib-preview.webp) |
| `20-results-bib-three-verdicts` | Results for `demo.bib`: Correct, DOI conflict, Not verifiable | [EN](shots/web/en/20-results-bib-three-verdicts.webp) · [DE](shots/web/de/20-results-bib-three-verdicts.webp) |
| `21-detail-bib-ref1` | Detail: Correct | [EN](shots/web/en/21-detail-bib-ref1.webp) · [DE](shots/web/de/21-detail-bib-ref1.webp) |
| `21-detail-bib-ref2` | Detail: DOI conflict | [EN](shots/web/en/21-detail-bib-ref2.webp) · [DE](shots/web/de/21-detail-bib-ref2.webp) |
| `21-detail-bib-ref3` | Detail: Not verifiable | [EN](shots/web/en/21-detail-bib-ref3.webp) · [DE](shots/web/de/21-detail-bib-ref3.webp) |
| `30-narrow390-empty` | 390 px wide: landing | [EN](shots/web/en/30-narrow390-empty.webp) · [DE](shots/web/de/30-narrow390-empty.webp) |
| `31-narrow390-structured` | 390 px wide: structured | [EN](shots/web/en/31-narrow390-structured.webp) · [DE](shots/web/de/31-narrow390-structured.webp) |
| `32-narrow390-running` | 390 px wide: running | [EN](shots/web/en/32-narrow390-running.webp) · [DE](shots/web/de/32-narrow390-running.webp) |
| `33-narrow390-results` | 390 px wide: results | [EN](shots/web/en/33-narrow390-results.webp) · [DE](shots/web/de/33-narrow390-results.webp) |
| `34-narrow390-detail` | 390 px wide: reference detail (single-pane view with back button) | [EN](shots/web/en/34-narrow390-detail.webp) · [DE](shots/web/de/34-narrow390-detail.webp) |

**Problems — web app**

*Landing / intake (`01`, `02`, `30`)*
- Header: title sits left; Language and citation-style selects are pushed to the far right with their labels above, so title baseline and select baselines don't line up. The selects are the only "Preferences" and read as page chrome, not as settings.
- The amber "Development preview…" notice is the first block under the header, full width, 2 lines (4 at 360–390 px). It sits above the task and stays visible in every state, including results.
- Three intake routes (PDF/Word, BibTeX/RIS, text) are stacked in one card with no visual grouping. They are styled differently: the PDF file input sits in a bordered box, the BibTeX input is bare text; the PDF helper text is small grey, the BibTeX helper text is larger and black; the heading sizes differ.
- Native file inputs show "Choose File No file chosen" in English in the DE UI (also at 390 px).
- Action buttons: when disabled, "Upload and structure", "Structure References" and "Check Reference" are grey-on-grey (low contrast, `01`). Reset is white with a dark outline and bold text, so it looks more active than the disabled primaries. When enabled (`02`, `13`) Structure and Check are the same teal; nothing says which one is the main action. "Check Reference" is singular although the field takes a list.
- The empty state has only a faint placeholder ("Darwin, C. (1859)…"); no example, no explanation of what a Check returns.
- Footer links are small and sit directly under the card with no separation.
- At 390 px: the buttons wrap into two rows (Structure alone, then Check + Reset); footer links wrap onto two lines.

*Structured / running / results (`03`, `07`, `08`, `12`, `14`, `31`–`33`)*
- One continuous page. With 8 references the finished page is ~7,700 CSS px tall. The intake card (including the dev notice and quota) stays at the top, so the verdicts are several screens below the fold.
- Order is: quota, notice, intake, structuring cards, then "Your Check". The result the user came for is last.
- Structuring cards repeat an "Original text" label eight times and render fields as label/value rows with no emphasis; reference title, authors and year have the same weight. Dense, no scan path.
- Check summary: seven status chips (`All References: 8`, `Correct: 0`, …) have equal weight, with most at zero. The progress bar is solid green with 8 of 8 Not verifiable, so colour reads as success.
- Three tool panels (Export References, Accessible PDF report, Formatted bibliography) plus an amber "Edit Reference list" box sit between the summary and the list. Each has its own bordered box, selects and heading; they are all above the reference list.
- Reference list is a fixed-height pane; in `08` only four of eight items show and the fourth is cut at the pane edge. The list items are grey cards with an underlined link as title.
- Verdict marker for "Not verifiable" is a "?" glyph in plain text; there is no colour or icon treatment visible next to it in the list. The docs page `how-the-check-works` says a Verdict is shown "with icon, color and text", which doesn't match this state.
- At 390 px (`33`) the results page is ~6,500 CSS px tall; all of the above stacks in one column.

*Reference detail (`09`, `10`, `11`, `21`, `34`)*
- The Reference/Best match table has ~25 fields. Each field takes two rows: a label line ("Source type (CSL): Excluded from Score · Unknown; not compared.") and a value row ("Unknown / not supplied" in both columns). Most rows are identical placeholders, producing ~2,000 px of near-duplicate rows.
- Label, score state and comparison state are merged into one sentence per field; the table header (Reference / Best match) does not apply to the label line.
- Wording is internal: "Excluded from Score", "Field revision 1", "Same slot: Re-check is free of Quota", "Unreviewed" / "Ungeklärt" with no explanation.
- The development-preview line is repeated in bold inside each detail.
- Button hierarchy: "Confirm Verdict" and "Judge manually" are outline buttons inside a blue-tinted box; "Edit fields" is an outline teal button; "Re-check this Reference" is solid teal. Three styles in one block.
- DE: "Zeitschrift oder Sammelband: Vom Score ausgeschlossen · Unbekannt; nicht verglichen." wraps to two lines; fine at desktop, long at 390 px.
- At 390 px (`34`): a "Back to References" button appears (single-pane), the two-column table stays at two columns and the DOI wraps mid-token ("10.1038/sdata.2016.1 / 8").

*Errors (`06`, `15`, `16`, `17`, `18`)*
- Alerts render below the intake buttons. On a 900 px viewport they are outside the frame after a long input (`06`), so feedback for an action can be off-screen.
- Error and notice blocks use the same card + amber/red treatment as the permanent preview notice, so a failure doesn't stand out from always-on text.

*Import (`19`, `20`)*
- Import preview and results reuse the structuring card layout, so a 3-record `.bib` looks like the 8-reference text flow, with no marker that the source was a file.

### 2. Extension side panel — `apps/extension` `panel.tsx` (reuses `CheckWorkspace` and `AccountWorkspace`)

Captured as the panel page in a tab at 360 px (see Method). Standalone API target, so no account area.

| State | What it shows | Images |
|---|---|---|
| `01-panel-empty` | Empty panel | [EN](shots/extension/en/01-panel-empty.webp) · [DE](shots/extension/de/01-panel-empty.webp) |
| `02-panel-intake` | Reference text entered | [EN](shots/extension/en/02-panel-intake.webp) · [DE](shots/extension/de/02-panel-intake.webp) |
| `03-panel-structured` | Structured references | [EN](shots/extension/en/03-panel-structured.webp) · [DE](shots/extension/de/03-panel-structured.webp) |
| `04-panel-running` | Check running | [EN](shots/extension/en/04-panel-running.webp) · [DE](shots/extension/de/04-panel-running.webp) |
| `05-panel-results` | Finished check | [EN](shots/extension/en/05-panel-results.webp) · [DE](shots/extension/de/05-panel-results.webp) |
| `06-panel-detail` | Reference detail | [EN](shots/extension/en/06-panel-detail.webp) · [DE](shots/extension/de/06-panel-detail.webp) |
| `07-panel-error-network` | Network error | [EN](shots/extension/en/07-panel-error-network.webp) · [DE](shots/extension/de/07-panel-error-network.webp) |

**Problems — extension panel**
- Same long single-column page as the web app, at 360 px: results (`05`) are ~7,200 CSS px tall; the verdict list is at the very bottom.
- The header keeps two selects side by side (Language, Preferred citation style) and a dev notice (4 lines at 360 px) before any input.
- Intake helper texts are 3–4 lines each at this width (PDF helper 4 lines, BibTeX helper 3, a 4-line paragraph under the text area about pages with their own menus / canvas editors). The BibTeX/RIS file input has no framing, unlike the PDF one.
- Buttons wrap into two rows: Structure References alone, then Check Reference + Reset. Disabled primaries are grey-on-grey as in the web app.
- Footer links wrap to two lines.
- All results panels (export, PDF report, bibliography) are full panel-width form blocks with selects; in a side panel they read as stacked forms.
- DE: long labels and helper texts wrap to more lines; nothing was seen clipped. The DE running state is ~14,600 px high at 2x.
- Panel chrome and real side-panel width behaviour are not captured (limit above).

### 3. Website and docs — `apps/website` (Astro: `Page.astro`, `Search.astro`, `[...route].astro`)

| State | What it shows | Images |
|---|---|---|
| `{l}` | Home | [EN](shots/website/en/en.webp) · [DE](shots/website/de/de.webp) |
| `{l}_faq` | FAQ | [EN](shots/website/en/en_faq.webp) · [DE](shots/website/de/de_faq.webp) |
| `{l}_contact` | Contact | [EN](shots/website/en/en_contact.webp) · [DE](shots/website/de/de_contact.webp) |
| `{l}_accessibility` | Accessibility statement | [EN](shots/website/en/en_accessibility.webp) · [DE](shots/website/de/de_accessibility.webp) |
| `{l}_legal-notice` | Legal notice | [EN](shots/website/en/en_legal-notice.webp) · [DE](shots/website/de/de_legal-notice.webp) |
| `{l}_legal-notice_version-draft` | Legal notice, draft version | [EN](shots/website/en/en_legal-notice_version-draft.webp) · [DE](shots/website/de/de_legal-notice_version-draft.webp) |
| `{l}_terms` | Terms | [EN](shots/website/en/en_terms.webp) · [DE](shots/website/de/de_terms.webp) |
| `{l}_terms_version-draft` | Terms, draft version | [EN](shots/website/en/en_terms_version-draft.webp) · [DE](shots/website/de/de_terms_version-draft.webp) |
| `{l}_privacy` | Privacy policy | [EN](shots/website/en/en_privacy.webp) · [DE](shots/website/de/de_privacy.webp) |
| `{l}_privacy_version-draft` | Privacy policy, draft version | [EN](shots/website/en/en_privacy_version-draft.webp) · [DE](shots/website/de/de_privacy_version-draft.webp) |
| `{l}_withdrawal` | Withdrawal instructions | [EN](shots/website/en/en_withdrawal.webp) · [DE](shots/website/de/de_withdrawal.webp) |
| `{l}_withdrawal_version-draft` | Withdrawal instructions, draft version | [EN](shots/website/en/en_withdrawal_version-draft.webp) · [DE](shots/website/de/de_withdrawal_version-draft.webp) |
| `docs_{l}` | Docs index | [EN](shots/website/en/docs_en.webp) · [DE](shots/website/de/docs_de.webp) |
| `docs_{l}_how-the-check-works` | Docs: how the check works | [EN](shots/website/en/docs_en_how-the-check-works.webp) · [DE](shots/website/de/docs_de_how-the-check-works.webp) |
| `docs_{l}_structuring` | Docs: structuring | [EN](shots/website/en/docs_en_structuring.webp) · [DE](shots/website/de/docs_de_structuring.webp) |
| `docs_{l}_preferences` | Docs: language and citation style (Preferences) | [EN](shots/website/en/docs_en_preferences.webp) · [DE](shots/website/de/docs_de_preferences.webp) |
| `docs_{l}_errors-and-retry` | Docs: errors and retrying | [EN](shots/website/en/docs_en_errors-and-retry.webp) · [DE](shots/website/de/docs_de_errors-and-retry.webp) |
| `docs_{l}_availability` | Docs: availability and limits | [EN](shots/website/en/docs_en_availability.webp) · [DE](shots/website/de/docs_de_availability.webp) |
| `docs_search-results` | Docs search with results | [EN](shots/website/en/docs_search-results.webp) · [DE](shots/website/de/docs_search-results.webp) |
| `docs_search-no-results` | Docs search without results | [EN](shots/website/en/docs_search-no-results.webp) · [DE](shots/website/de/docs_search-no-results.webp) |
| `narrow390-{l}` | 390 px: home | [EN](shots/website/en/narrow390-en.webp) · [DE](shots/website/de/narrow390-de.webp) |
| `narrow390-{l}_faq` | 390 px: FAQ (EN)/FAQ (DE) | [EN](shots/website/en/narrow390-en_faq.webp) · [DE](shots/website/de/narrow390-de_faq.webp) |
| `narrow390-docs_{l}` | 390 px: docs index | [EN](shots/website/en/narrow390-docs_en.webp) · [DE](shots/website/de/narrow390-docs_de.webp) |
| `narrow390-en_terms` / `narrow390-docs_de_how-the-check-works` | 390 px: Terms (EN) · docs article (DE) | [EN](shots/website/en/narrow390-en_terms.webp) · [DE](shots/website/de/narrow390-docs_de_how-the-check-works.webp) |

**Problems — website and docs**
- A pale-orange banner ("Local preview · Content draft v0.1 · Not approved for publication") sits above the header on every page; it is the strongest element on the home page.
- Home (`en`, `de`) is a headline, a one-sentence lead and two paragraphs; no call to action and no link to the app; the docs are reachable only through the nav. A blank band of ~200 px sits between the text and the footer.
- Heading scale is large (home H1 spans two lines at 1280 px, with the orphan word "look" on the second) against body text; the text column is narrower than the header and footer, so the left edges of logo and text don't align.
- Body text uses hyphenation (`Human re-view` on the home page; `Correction sug-gestions`, `refer-ence`, `un-derlying`, `fab-ricated` in docs); it breaks words in EN text at desktop width.
- Docs articles all show the same docs index list and the "Search documentation" block after the article body, so every page ends with the same ~600 px block (five-link index, search form). On `how-the-check-works` the article is three paragraphs and the index lists the article itself.
- Footer links (Legal notice, Terms, Privacy policy, Withdrawal instructions, Accessibility, Search licenses and source) are one row; the last item is the only one that isn't a legal page.
- "version-draft" legal pages carry the same chrome as final pages; the draft state is visible only in the global banner.
- The nav has four items; the language switch ("Deutsch") sits in the same row and style as the content links.
- Footer has no link to the app.
- Not reviewed page by page: the 390 px legal pages beyond the ones captured; FAQ content.

## Preferences

There is no Preferences screen in the standalone app. The two preference controls (language, preferred citation style) are the header selects (`01`, `13`). The hosted app adds a "Preference sync" control inside the Account area; it is only reachable when signed in and is covered in the private inventory. The docs page `docs_*_preferences` describes them.

## Component inventory

### `packages/ui` (components below plus helper modules `account-preferences`, `effective-verdict`, `guest-identity`, `preferences`, `quota`; consumed by `apps/web` and `apps/extension`)

`index.tsx` re-exports `Button`, `Label`, `Text`, `TextArea`, `TextField` from react-aria-components; there is no separate design-system layer. Styling lives in `workspace.css`.

| Component | What it is | Used in |
|---|---|---|
| `CheckWorkspace` | The whole standalone screen: header, selects, intake (document, BibTeX/RIS, text), Check/Structure/Reset, alerts, results | `apps/web/main.tsx`, `apps/extension/panel.tsx` |
| `WebAccountWorkspace` / `AccountWorkspace` | Wrapper that adds sign-in/account controls around `CheckWorkspace` (web / extension variants) | web `main.tsx`; extension `panel.tsx` |
| `AccountControls` | Sign-in, code step, signed-in header, sign-out | `web-account-workspace.tsx` |
| `PreferenceSyncControl` | Opt-in sync of language / citation style to the Account | `web-account-workspace.tsx` |
| `DpaControls` (+ `Packet`) | Data-processing agreement review and conclusion form | `web-account-workspace.tsx` |
| `InvoiceControls` | Load and list invoices | `web-account-workspace.tsx` |
| `AccountManagementLink` | Link out to the account/plan pages | `web-account-workspace.tsx` |
| `HistoryPanel` | Opt-in Check history: enable, search, open, restart, delete | `check-workspace.tsx` |
| `QuotaMeter` | Quota bar and "N of M checks left" | `check-workspace.tsx` |
| `QuotaPending` | Quota loading / unavailable placeholder | `check-workspace.tsx` |
| `QuotaChoice` | Choice shown when a check would exceed the remaining Quota | `check-workspace.tsx`, `history.tsx` |
| `UpgradeLink` | Link to upgrade | `quota-panel.tsx`, `report-download.tsx` |
| `MaintenanceNotice` | Service maintenance banner | `check-workspace.tsx` |
| `InformationLinks` | Footer links (Help, Contact, Legal notice, Terms, Privacy, Withdrawal) | `check-workspace.tsx` |
| `ContinuationTime` (`abuseMessage`) | Rate-limit / abuse message with continuation time | `check-workspace.tsx` |
| `BibliographyEditor` | Edit-list editor for the reference text (Edit Reference list) | `check-workspace.tsx` |
| `StructuringResults` (+ `ReactField`) | Cards of recognized references after structuring | `check-workspace.tsx` |
| `AiProvenance` | Label for AI-extracted fields | `structuring-results.tsx`, `reference-actions.tsx` |
| `CheckResults` (+ `RunningStep`) | The finished/running check: summary, export panels, list and detail | `check-workspace.tsx` |
| `CheckSummary` (+ `verdictLabels`) | Status chips and progress bar | `check-results.tsx` |
| `ReferenceOutcomeSummary` | Per-reference row in the list (verdict, title) | `check-results.tsx` |
| `ReferenceOutcomeView` (+ `OriginalInput`, `BestMatchComparison`, `ManualVerdictLabel`) | Reference detail: verdict, evidence, comparison table | `check-results.tsx`, `reference-actions.tsx` |
| `JournalAbbreviationExplanation` | Inline explanation of journal abbreviation matching | `reference-outcome.tsx` |
| `ReferenceActions` (+ `Fields`) | Detail actions: Edit fields, Re-check, Confirm Verdict | `check-results.tsx` |
| `ReferenceListActions` | List-level actions | `check-results.tsx` |
| `ManualVerdictActions` | Judge manually / confirm verdict | `reference-actions.tsx` |
| `CheckSelectionActions` | Select references for bibliography actions | `reference-actions.tsx` |
| `ReferenceExports` | Export References (format, content) | `check-results.tsx` |
| `ReportDownload` | Accessible PDF report form | `check-results.tsx` |
| `BibliographyActions` | Formatted bibliography: copy / download RTF | `check-results.tsx` |
| `CorrectionSuggestion` (+ `useBibliography`) | Correction suggestions with accept control | `check-results.tsx` |

### Other apps

| Component | What it is | Used in |
|---|---|---|
| `apps/web/src/main.tsx` | Web entry: picks `WebAccountWorkspace` or `CheckWorkspace` | web app |
| `apps/extension/src/panel.tsx` | Extension panel entry | extension |
| `Page.astro` | Website page shell: banner, header, nav, footer | website pages |
| `Search.astro` | Docs search form and results (runs in the browser) | docs pages |
| `[...route].astro` | Content route: renders every page and docs article | website |

## Five biggest cross-cutting problems

1. **No page-level structure.** Everything is one long column (standalone, extension, 390 px); the result is at the bottom and the intake and always-on notices stay at the top.
2. **No visual hierarchy in actions.** Disabled and enabled primaries are near-identical grey/teal; Reset looks stronger than the disabled primaries; detail actions use three styles.
3. **Density without scan path.** Structuring cards and the Reference/Best match table repeat the same label/placeholder rows (~25 per detail), with internal wording ("Excluded from Score").
4. **Status and error feedback blends in.** Preview notice, alerts and info use the same boxed treatment; errors render below the fold; the full-green progress bar contradicts "Not verifiable".
5. **Unstyled and untranslated native controls plus a separate visual language.** File inputs are English in DE; the website (cream background, dark-green links, sans-serif, very large headings) and the web app (blue-grey background, black underlined links, teal buttons) use different colour and link styles; the website banner is the strongest element on each page.
