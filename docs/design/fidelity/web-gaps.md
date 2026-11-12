# Web and side-panel fidelity gaps against #194 D

Scope: #211 (feed, compact strip, checking shell) and #212 (Reference detail).
Visual spec: `prototype-194.html` at `f6db1f5`, `?variant=D&calm=1&strip=a&still=1`.
Behavioural spec: `components.md` (3.1–3.7), `reconciliations.md`, ADR-0003, ADR-0016, ADR-0023 and ADR-0027.
Oracle: `pnpm --filter @source-taster/web fidelity --only app-` against `pnpm dev:local`.

Each row gives the current state, the D target and the files to change. "Moves to" names the new place of every function that leaves the main column. The last section lists the differences that remain on purpose.

## 1. Primitives

| Element | Current | Target | Files |
|---|---|---|---|
| Button icon slot | Every Button renders an empty 20 px `.st-loading-slot`. Buttons without an icon show a blank gap before the label. | Button takes an optional `icon`. The slot holds that icon and the Spinner replaces it while pending. Without an icon there is no idle slot; while pending, the Spinner overlays the label, so the width stays stable. | `packages/ui/src/primitives/actions.tsx`, `primitives.css` |
| Disabled reason | `.st-disabled-control` stacks the button and its reason. Two disabled controls on one row print two reasons with no spacing. The intake prints "Enter references…" under both Structure and Check. | The reason renders once, beside its control. Button accepts `reasonPlacement="external"` with a `reasonId` so a view can render the single reason itself (the intake action row). | `primitives/actions.tsx`, `primitives.css` |
| Progress | Native `<progress>` without `role`, so assistive tech and the harness see no `progressbar`. | RAC `ProgressBar` (role `progressbar`, `aria-valuenow`/`aria-valuemax` in References), drawn as D's 6 px bar (wide) or 2 px edge bar (compact). It never takes a verdict colour (1.7). | `check-summary.tsx`, `workspace.css` |
| Icons | Lucide is mixed with empty slots. | Lucide at 16 px (`sm`) and 20 px (`md`). Every icon button has a name and a Tooltip. | all touched components |

## 2. Shell (TopBar)

| Element | Current | Target | Files |
|---|---|---|---|
| Bar | Glass bar with History, an `h1` title, a "Commands" button and the Account popover. | D `top`: History (hosted only) on the left, logo mark + "Source Taster", a centred launcher pill "Search or command …" with `⌘K`, and the AccountChip on the right. 60 px web, 54 px below 700 px; the brand text, History label and `⌘K` hint hide below 700 px. | `checking-top-bar.tsx`, `workspace.css` |
| Launcher | Button "Commands" opening the palette. | The pill opens the same `CommandPalette` (Autocomplete + Menu). Commands: Enter references, New check, Preferences, Stop (while running), Export, PDF report, How the check works, Edit list (when a Check exists). Accessible name "Search or command …" / "Suchen oder Befehl …". | `checking-top-bar.tsx`, i18n |
| AccountChip | Popover trigger in hosted. | Unchanged in function (#229). Restyled as D's chip. Standalone has no AccountChip, Guest, Plan or purchase UI (ADR-0003). | `checking-top-bar.tsx` |
| Preferences | Native Language and Citation-style selects float above the intake (`.workspace-preferences`). | **Moves to** a Preferences Dialog (Dialog/Card recipe). It is reached from the launcher command "Preferences", from the AccountPopover's Preferences button (hosted), and in standalone from a Preferences IconButton at the TopBar end, where the AccountChip would sit. The citation-style reset notice moves into the dialog and into SessionNotices. | new `preferences-dialog.tsx`, `check-workspace.tsx`, `checking-top-bar.tsx` |
| Maintenance notice | Above the TopBar content. | Unchanged in place (it is a service-wide banner, not a session notice). It renders only while a maintenance window is announced. | `maintenance.tsx` |

## 3. Intake (no Check yet)

| Element | Current | Target | Files |
|---|---|---|---|
| Heading and lead | None; the field is labelled "Reference". | Centred column (max 720 px). `h1` "Paste your reference list" and a one-sentence lead. The textarea keeps its accessible name "Reference" / "Referenz", because many tests and the extension selection flow use it. | `intake-card.tsx` (new), i18n |
| Field | RAC TextField with a visible label and hint above, and a separate DropZone below. | D `cmdbar`: glass card, search glyph, auto-growing textarea, focus ring on the card. The DropZone covers the card while a file is dragged over it. | `intake-card.tsx`, `workspace.css` |
| Primary action | Structure (secondary), Check (primary) and Reset sit in a row, each with its own disabled reason. | One inline primary Check at the card's bottom right. The disabled reason sits once to its left ("Paste References first."); when enabled, the slot shows `⌘↵ to check`. Reset leaves the intake: it lives in the ⋯ Menu and the launcher once a Check exists. | `intake-card.tsx` |
| Structuring preview | Secondary button "Structure references" beside Check; the preview renders inline under the form. | **Moves to** a ghost action "Structure references" in the source row. The result opens in a "Recognized references" Dialog; after structuring, the card's action row shows "n References recognised". Nothing structures while typing. | `intake-card.tsx`, `structuring-results.tsx`, `check-workspace.tsx` |
| Source segment | "Files and selection" toggle plus a source Tag. | D `seg` (Text / File, plus Selection in the panel when selection intake exists). File shows the document upload ("PDF or Word document" + "Upload and structure") and the library import ("Import BibTeX or RIS") in a card below. Selection shows the selection help and the undo action. The native inputs keep their labels and ids (`#document-file`). | `intake-card.tsx` |
| Insert example | None. | Ghost button "Insert example" fills the textarea with `input_example` and focuses it. | `intake-card.tsx`, i18n |
| Info lines | Hint above the field; Quota meter, notices and selects above. | `hint` line under the source row ("One Reference per paragraph. Or drop …"), then `nrow` info lines: storage/temporary content, and in hosted only the Quota line. | `intake-card.tsx` |
| Bibliography selection / RegionPicker | Inline under the field after a document upload. | Unchanged in function, inside the File card under the field. | `bibliography-selection.tsx` |
| Errors before a Check | Alerts between the form and the results. | One alert directly under the intake card (request errors, document notices, Quota denials). | `check-workspace.tsx` |

## 4. Counted state

D's counted stage is post-structuring: the strip head "n References recognised", the Quota preview, and cards with empty tracks.

| Element | Current | Target | Files |
|---|---|---|---|
| Counted strip | No counted phase; Check jumps from the form to the results. | While a Check is being created after structuring (`pending === "create"` with a known count), and while the first-N choice is open, the workspace shows the strip head "n References recognised" with the Quota sentence. `QuotaChoice` (Check first N / Cancel) **moves to** that strip head; it no longer sits under the form. The cards show empty, dashed tracks. | `check-workspace.tsx`, `summary-strip.tsx` |
| Harness pairing | The harness pairs the prototype's `counted` with the built `filled` state (text typed, nothing structured). | **Driver mismatch, not fixture data.** Built `filled` shows the intake with text and an enabled inline Check. The prototype counted strip has no stable built twin, because a standalone Check starts right after structuring. The counted strip is covered by an e2e test instead. | — |

## 5. Strip (running and done)

| Element | Current | Target | Files |
|---|---|---|---|
| Wide head (≥ 700 px) | Glass strip with a sentence, counters, a "Summary options" ⋯ and a native progress. | Running: spinner "Check running", "x of n checked", the 6 px `progressbar`, Stop (secondary, sm), ⋯. Done: check icon "Check complete", the summary sentence "x of n References check out.", spacer, ⋯. | `summary-strip.tsx` (renamed from `check-summary.tsx`) |
| Counters | ToggleButtons with glyph, label and count in one row. | D `cnt` tiles in a 3/6 grid: glyph + large count + short label. Zero is disabled. Pressed shows an accent outline and dot. | `summary-strip.tsx`, `workspace.css` |
| Status group | Status menu and buttons. | Separate dashed "Technical status" ToggleButton group listing each present Status with icon and count; it filters to Statuses. It is absent when no Status is present (so no "Running" leaf remains when done). | `summary-strip.tsx` |
| ⋯ Menu | "Summary options" with Show labels / All. | IconButton "More actions" / "Weitere Aktionen" (Menu): Stop (disabled with "Only while a Check is running." when idle), Reset, Export, PDF report, Formatted bibliography, How the check works, Edit list (disabled while busy), and Show/Hide labels in compact. It is the first "More actions" in DOM order. | `summary-strip.tsx`, `check-workspace.tsx` |
| Filter row | Chip. | Wide: "Filter on: x" + "Clear filter". Compact: `fchip` with glyph, full label and ×. | `summary-strip.tsx` |
| Compact (< 700 px, strip "a") | Wraps the wide strip with smaller counters. | One row: six glyph + count counters (name = full label + count, Tooltip = label), one dashed Status counter when Statuses exist, ⋯; a 2 px progress edge while running. "Show all labels" in the ⋯ Menu switches to the wide layout. | `summary-strip.tsx`, `workspace.css` |
| Lede (compact) | None. | Above the feed: running "Check running · x of n done" + Stop; done the summary sentence. | `check-feed.tsx` |

## 6. Feed

| Element | Current | Target | Files |
|---|---|---|---|
| Echo line | None. | "Text · n References recognised" (or the file name / page selection) with the source icon. While running: "The order stays as in your list." | `check-feed.tsx` |
| SessionNotices | Notices sit above the intake and between form and results. | **Move to** one Banner stack between the echo line and the cards: the development-preview notice, the AI-extraction notice, the document notice, the citation-style reset, the lease-expired note, cleanup-pending, stream errors with Reconnect, and the partial-start note. Connection text stays in the polite live region. | `session-notices.tsx` (new), `check-workspace.tsx` |
| FeedCard | Card with number, title, verdict and reason. | D `card`: mono number; title (2-line clamp) + "Author · Year"; VerdictBadge/StatusBadge right (below the meta under 540 px); EvidenceTrack + step text; one-line reason; "Unsaved draft" tag; Retry for Technical error. Selected: accent outline. Border takes the verdict border token. | `check-results.tsx` → `feed-card.tsx` |
| EvidenceTrack | Current step text only while running. | `ol.track` of 24 px nodes. Finished: one node per `outcome.evidence` entry, mapped ✓ (exists/redirect), ≠ (candidate whose fields differ), × (nonexistent/no-record), dashed (disabled/skipped/unsupported) and warn (unavailable). Running: a spinner node plus "Step k of n · searching X" from the progress events. No invented step counts. | `evidence-track.tsx` (new) |
| Footer | Information links under the results. | D `foot`: the disclaimer with "How the check works", the storage line, then the Legal notice / Terms / Privacy / Withdrawal links as a quiet row. The legal links stay visible on every screen (they are not only in the launcher). | `check-feed.tsx`, `information.tsx` |

## 7. Dialogs reached from the ⋯ Menu and the launcher

| Function | Current place | Moves to | Files |
|---|---|---|---|
| Export references | Inline region "Export references" under "Your check". | ExportDialog (menuitem "Export …" / "Exportieren …"), same region content and download. | `reference-exports.tsx`, `check-results.tsx` |
| PDF report | Inline region. | ReportDialog (menuitem "PDF report"). In standalone without entitlement, it shows the disabled reason, never an upgrade offer. | `report-download.tsx` |
| Formatted bibliography | Inline region. | Dialog (menuitem "Formatted bibliography"). | `correction-suggestions.tsx` |
| How the check works | Inline toggle. | Dialog (menuitem and footer link). | `check-results.tsx` |
| Edit list | Inline region. | Dialog (menuitem "Edit Reference list", disabled while busy with "Only possible while no Check is running."). | `reference-list-actions.tsx` |
| Structuring preview | Inline. | Dialog from the intake (section 3). | `structuring-results.tsx` |
| Preferences | Floating selects. | Dialog (section 2). | `preferences-dialog.tsx` |
| Reset | Inline button. | Menuitem "Reset" plus the launcher's "New check". | `summary-strip.tsx` |
| Stop / Cancel check | Inline button in the results status box. | Strip head (running, wide), lede (compact), menuitem and launcher command. | `summary-strip.tsx`, `check-feed.tsx` |

## 8. Detail (#212)

| Element | Current | Target | Files |
|---|---|---|---|
| Layout | Inline pane inside `.check-panes`; at 360 px a stacked view. | Web: push drawer (`clamp(380px, 38cqw, 520px)`) beside the feed column, opaque `surface`, left border, own scroll. Below 700 px: full view over the feed with Back. It keeps `section#reference-detail` named "Reference detail" (stable role and name). | `reference-detail.tsx` (new), `check-results.tsx`, `workspace.css` |
| Header | Back button and `h2` "Reference detail" in a glass header. | Glass sticky `dhead`: "Close" (×) on web / "Back" (←) below 700 px, centred "Reference n of N". The prev/next Pager is dropped (reconciliations.md). Esc closes and returns focus to the card's row. | `reference-detail.tsx` |
| Title | None. | `h2` with the reference title (tabindex −1, focused on open) + "Author · Year". | `reference-detail.tsx` |
| Verdict header card | `h3` badge and reasons. | `vblock` card on the verdict tint/border: `h3` with the large VerdictBadge, ManualTag and system verdict when overridden, the plain-language reason; Status variant with StatusBadge and Retry. | `reference-outcome.tsx` |
| Original input | Sunken box with heading. | Section "Original text" with the mono `orig` block. | `reference-outcome.tsx` |
| Field table | Paired rows table "Reference and best match". | D `cmp`: Field / Your Reference / Best match columns with ✓ or "≠ deviates", unknown in italics, "Backed by: source" under the best value. Below 470 px the header hides and cells stack with labels. Table name stays "Reference and best match". The section header carries "Edit fields" and "Re-check"; the field editor opens directly under the table. | `reference-outcome.tsx`, `reference-actions.tsx` |
| Correction suggestion, Apply to fields | TrackedChange + actions. | Unchanged behaviour (ADR-0027). It follows the table and fills the editor above. | `correction-suggestions.tsx` |
| Manual judgment | Section. | Restyled `dsec`. | `manual-verdict.tsx` |
| Sources, candidates, evidence trail | `details` "Explanation and source evidence". | Kept as one Disclosure after Manual judgment, with the EvidenceTrack trail at its top. | `reference-outcome.tsx` |
| Revision history | `details`. | Kept at the end. | `reference-actions.tsx` |

The documented section order in `reference-detail.spec.ts` changes accordingly: verdict, Original text, table, Edit fields, Correction suggestion, Manual judgment, then the evidence Disclosure.

## 9. Standalone versus hosted

| Item | Current | Target |
|---|---|---|
| Quota meter, Quota note, upgrade copy | Rendered whenever `quota` is readable. `dev:local` grants a fake 1000 Quota, so standalone shows a meter. | Shown only when `hostedQuota` (credentials present). Standalone keeps reading Quota internally for planStart and report entitlement, but shows no meter, Plan or upgrade text. |
| "Upgrade to a paid plan" (AI notice, structuring) | Shown in standalone. | Standalone shows only the parser fallback sentence; the upgrade clause is hosted-only. |
| History, AccountChip | Hosted only. | Unchanged (#229). |

## 10. Extension side panel

`apps/extension/src/panel.tsx` renders the same `CheckWorkspace`. The panel width is below 700 px, so it uses the compact strip, the lede and the full-view detail. The Selection segment appears only when `selectionIntake` is passed.

A selection that arrives while a Check exists keeps the Check and its stream alive (`receiveSelection`). Because the intake is hidden while a Check exists, the arriving selection now shows a SessionNotice: "Selection received" with "Start new check from selection" (Reset, then fill) and Undo. The draft text is stored, never discarded silently.

## 11. Test paths that change

| Function | Old path | New path |
|---|---|---|
| Language / citation style | `combobox "Language"` on the page | `e2e/support/preferences.ts` → `choosePreferences(page, …)`: opens Preferences, selects, closes. |
| Export, report, bibliography, edit list | Inline regions | ⋯ "More actions" → menuitem → dialog (same region names inside the dialog). |
| Reset, Cancel check | Inline buttons | ⋯ Menu, strip head or launcher. |
| Structure references | Secondary button beside Check | Ghost button in the source row → Dialog. |
| Files | "Files and selection" toggle | Segment "File". |
| Detail heading | `heading "Reference detail"` | `region "Reference detail"` (unchanged) and the title `h2`. |
| Detail order | Edit fields after the suggestion | Edit fields in the table header, before the suggestion. |

## 12. Mixed citation and Technical failure

The fixtures cannot reach Mixed citation or Technical failure. Both render through the same FeedCard, VerdictBadge, counter and detail components. They are covered by route-mocked e2e tests that inject a Check snapshot with those outcomes, not by the fidelity sheets.

## 13. Differences that remain on purpose

Filled in after the fidelity loop: each remaining difference with its reason (mode absence, fixture data or driver mismatch).
