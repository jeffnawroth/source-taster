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
| Structuring preview | Secondary button "Structure references" beside Check; the preview renders inline under the form. | **Moves to** the launcher command "Structure references" (D shows no structuring control in the intake). The result opens in a "Recognized references" Dialog; after structuring, the card's action row shows "n References recognised". Nothing structures while typing. | `intake-card.tsx`, `structuring-results.tsx`, `check-workspace.tsx` |
| Source segment | "Files and selection" toggle plus a source Tag. | D `seg` (Text / File, plus Selection in the panel when selection intake exists). File shows the document upload ("PDF or Word document" + "Upload and structure") and the library import ("Import BibTeX or RIS") in a card below. Selection shows the selection help and the undo action. The native inputs keep their labels and ids (`#document-file`). | `intake-card.tsx` |
| Insert example | None. | Ghost button "Insert example" fills the textarea with `input_example` and focuses it. | `intake-card.tsx`, i18n |
| Info lines | Hint above the field; Quota meter, notices and selects above. | `hint` line under the source row ("One Reference per paragraph. Or drop …"), then `nrow` info lines: the development-preview notice; in hosted also the storage/temporary-content line and the Quota line. | `intake-card.tsx` |
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
| EvidenceTrack | Current step text only while running. | `ol.track` of 24 px nodes. Finished: one node per `outcome.evidence` entry, mapped ✓ (exists/redirect), ≠ (candidate whose fields differ), × (nonexistent/no-record), dashed (disabled/skipped/unsupported) and warn (unavailable). Running: a spinner node plus "Checking with X" from the progress events, which name only the current source. No invented step counts. | `evidence-track.tsx` (new) |
| Footer | Information links under the results. | D `foot`: the same `nrow` lines as under the intake (the development-preview notice; in hosted also the Quota line), the disclaimer with "How the check works", then the Legal notice / Terms / Privacy / Withdrawal links as a quiet row. D's storage line is hosted only (section 13). The legal links stay visible on every screen (they are not only in the launcher). | `check-feed.tsx`, `information.tsx` |

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

A selection that arrives while a Check exists keeps the Check, its stream and its original input untouched (`receiveSelection`). Results replace the intake, so the selection waits as the next draft, and a Banner says so (`shell_selection_after_check`: "The page selection is waiting for your next check. Choose New check to use it."). "New check" (launcher or ⋯ Menu) then opens the intake with the latest waiting selection as its draft. The selection is never discarded silently. An empty selection also shows the copy-and-paste help (`selection_intake_help`) next to its notice.

## 11. Test paths that change

| Function | Old path | New path |
|---|---|---|
| Language / citation style | `combobox "Language"` on the page | `e2e/support/workspace.ts` → `choosePreferences(page, …)`: opens Preferences, selects, closes. |
| Export, report, bibliography, edit list | Inline regions | ⋯ "More actions" → menuitem → dialog (same region names inside the dialog). |
| Reset, Cancel check | Inline buttons | ⋯ Menu, strip head or launcher. |
| Structure references | Secondary button beside Check | Launcher command "Structure references" → preview Dialog (`structureReferences`, `Panel.structure`). |
| Files | "Files and selection" toggle | Segment "File". |
| Detail heading | `heading "Reference detail"` | `region "Reference detail"` (unchanged) and the title `h2`. |
| Detail order | Edit fields after the suggestion | Edit fields in the table header, before the suggestion. |

## 12. Mixed citation and Technical failure

The fixtures cannot reach Mixed citation or Technical failure. Both render through the same FeedCard, VerdictBadge, counter and detail components. They are covered by route-mocked e2e tests that inject a Check snapshot with those outcomes, not by the fidelity sheets.

## 13. Differences that remain on purpose

Result of the last full `fidelity --only app-` run: 28 sheets (intake, counted, running, done, detail, menu and export at web and 360 width, light/en and dark/de). Every sheet matches D in layout, order, controls, type and colour. Only the differences below remain. After the intake-field fix, the counted sheets were rendered again and are pixel-identical to the previous run.

| Difference | Sheets | Reason |
|---|---|---|
| D shows History, the Guest AccountChip and the Guest notice above the feed. The built sheets show neither. | all | Mode absence: `dev:local` is standalone, and ADR-0003 forbids Guest, Account, Plan and purchase UI there. The hosted parts are unchanged (#229). |
| D's strip has a "Technical status" row, a Mixed citation count and 10 References. The built strip has 8 References and no Technical failure. | done, menu, detail, export | Fixture data: the local fixtures cannot reach Mixed citation or Technical failure (section 12). |
| D opens Reference 3 and shows both arrows. The built detail opens Reference 1, so Prev is hidden. | detail | Fixture data and driver: the harness opens the first card. At Reference 1 there is no previous Reference. |
| D's Stop item reads "Stop Check" / "Prüfung stoppen". The built item reads "Cancel check" / "Prüfung abbrechen". | running, menu | Settled voice: voice-and-tone.md says "use the same verb for the same action everywhere: … abbrechen / cancel", and the resulting Status is "Cancelled". The prototype predates that rule; the existing string `check_cancel` follows it. |
| A running FeedCard in D reads "Step 3 of 3 · Scoring …". The built card reads "Checking with OpenAlex" (the current Data source), without a step count. | running | Data: the progress events name only the current source, not a step index or total. Section 6 forbids invented step counts, so the unused `shell_step_of` string is removed. The spinner node and track layout follow D. |
| In the field table D puts "Backed by: DNB, OpenAlex" under each best value. The built table puts the field Score ("100.00 %", or "Excluded from score · …") there, and above the table a line "Best match by score; identity is assessed separately · Crossref", the Data source record id and "Open source". | detail | Data and feature inventory: a best match comes from one Candidate record, so per-field corroboration by several sources does not exist; the source is named once in the line above. Field Scores, the record id and the source link are existing features (SU-RE rows) that D does not draw; dropping them is not a D decision. |
| D's intake and `foot` show a storage line ("Not saved to History. Content is deleted at most 24 hours after the Check ends.", or "Saved to History · deleted on …"); the intake also shows the Guest and AI-extraction lines, and both show the Quota line. The built standalone intake and footer show the development-preview notice instead. | intake, footer | Mode absence: Guest, History retention and Quota exist only in hosted mode (#229). Standalone keeps no History and makes no retention promise, so there is no storage text to show. The hosted Quota line is built and shows when hosted Quota is on. |
| D's echo line reads "10 References recognised". The built line reads "8 references recognized". | done, running, detail, menu, export | Settled voice: voice-and-tone.md rule 5 keeps glossary terms lower-case in English UI copy, and the product writes US English. |
| The built ⋯ Menu has one more item, "Formatted bibliography". | menu | Feature inventory: the formatted bibliography (EX row) moves into the Menu. D has no slot for it, and removing it is not a D decision. |
| D's Export dialog has a "Citation style" select and a "0 Correction suggestions selected" line. The built dialog has an "Export content" select and a longer explanation. | export | Behaviour: the citation style lives in Preferences (`choosePreferences`). Export content (original or suggested fields) is an existing export choice D does not model. |
| The built sheets run to full page length and show the D footer (disclaimer, then the legal link row). The prototype sheets stop at the viewport height. | all | Driver mismatch: the built page scrolls, while the prototype captures one viewport. The footer order follows D `foot` (section 6). |
| The built detail shows more sections below the suggestion (field revision, manual judgment, revision history, failed data sources). | detail | Fixture data: Reference 1 carries a revision and a source failure. The section order follows section 8. |
| The built detail field column wraps long German labels ("Veröffentlichungsdatum", "Zeitschrift oder Sammelband"). | detail web | Content: D's fixture uses short labels ("Jahr", "Zeitschrift"). The field names are the Glossary's. |
| D's 360 sheets show a fake browser panel next to a page. The built 360 sheets show the panel width alone, at full page length. | all 360 | Driver mismatch: the prototype frames the side panel. The harness captures the built page at 360 px. |
| With entered text but without focus, the built intake field keeps at least 96 px. D sizes it to its content and grows to 96 px only on focus. | none (counted is captured focused) | Behaviour: if the field grew only on focus, pressing Check after typing would focus the field first and move Check under the pointer, and the click would be lost (found by the regression suite's retry path). Both builds size the field to its content beyond that. |
| D's counted stage comes after Check: the strip says "10 References recognised", previews the Quota ("… use 10 of your 47 remaining checks … The Check starts automatically.") and shows the feed with empty EvidenceTracks. The built counted sheet is the intake card with "8 references recognized", the ⌘↵ hint and an enabled Check. | counted | Mode absence and driver pairing: the harness pairs the built "filled" state with D's counted stage. The counted stage exists in D to show the Quota preview and the partial-Check offer before the Check starts (prototype stage list: "count + Quota shown; auto-start, or the partial-Check offer"). Standalone has no Quota (ADR-0003), so its Check starts at once and the count is shown where the text was entered. The hosted Quota choice is unchanged (SU-QU rows, #229). |
| D's running sheet shows 4 of 10 References done and the rest waiting. The built running sheet can show 0 of n done, with every card "Running". | running | Fixture timing: the local fixtures answer at their own pace, and the driver captures after a fixed 3 s. Done cards in the running layout use the same FeedCard as the done sheet. |
| Between sheets of one run, single fixture References can end with a different Verdict (for example "A title nobody has written anywhere" as Not found or Not verifiable). | done, menu, detail, export | Fixture data: that fixture depends on how far the local search got before its deadline. The counters and cards show whatever the Check returned. |
| At 360 px the built Export dialog's "Export content" select cuts off its option text ("Original references (current saved fie…"). | export 360 | Platform control: the closed native select shows one line. The full text is in the open list and in the explanation below it. The control is an existing export choice D does not model (row above). |


## 14. Feature inventory mapping

Every row of `feature-inventory.md` (web app, extension and shared UI) and where it lives after #211/#212. "Unchanged" means same function in the same component, at most restyled. No row is removed; SU-RE-09 drops only its pre-selection prompt.

| Rows | Mapping |
|---|---|
| WA-01 | Unchanged. Standalone has no sign-in, History, Quota meter or upgrade UI (section 9). |
| WA-02, WA-03, WA-04 | Unchanged (hosted, #229). |
| WA-05 | Unchanged. The links render in the D footer row (section 6). |
| WA-06 | Unchanged. |
| EX-01 … EX-02, EX-04 … EX-14 | Unchanged. The panel renders the compact strip, lede and full-view detail (section 10). |
| EX-03 | Unchanged while no Check exists: the selection fills the intake and the Selection segment. With an open Check the selection waits as the next draft, the panel says so (`shell_selection_after_check`), and New check (launcher or ⋯ Menu) opens it (section 10). |
| SU-SH-01 | Unchanged: brand and document name in the TopBar. |
| SU-SH-02, SU-SH-03 | Moved to the launcher pill "Search or command …" (same palette, ⌘K, Escape, close, filter, clear). |
| SU-SH-04, SU-SH-05 | Unchanged commands in the launcher ("Enter references", "New check"). |
| SU-SH-06 | Moved to the Preferences Dialog, which the command opens. |
| SU-SH-07 | Unchanged command, label "Cancel check" (section 13). Also in the strip head, the compact lede and the ⋯ Menu. |
| SU-SH-08, SU-SH-09 | Unchanged (hosted, #229). |
| SU-SH-10 | Unchanged. |
| SU-SH-11 | Moved to the D footer row under the disclaimer. |
| SU-PR-01, SU-PR-02, SU-PR-03 | Moved to the Preferences Dialog (TopBar Preferences button, launcher command, AccountPopover in hosted). The reset notice is in the Dialog and the notice stack. |
| SU-PR-04, SU-PR-05 | Unchanged (hosted), now inside the Preferences Dialog. |
| SU-IN-01 | Moved to the D intake card: label "Reference" kept, hint line under the source row, placeholder "Paste your reference list here …". |
| SU-IN-02, SU-IN-03 | Unchanged, inside the File segment card. |
| SU-IN-04 | Moved to the source segment (Text / File / Selection) and the feed echo line (text, file name or page selection). |
| SU-IN-05 | Moved to the File segment (formerly the files disclosure). |
| SU-IN-06, SU-IN-07, SU-IN-08, SU-IN-09, SU-IN-10 | Unchanged, inside the File segment card. |
| SU-ER-D-unsupported, SU-ER-D-no_text, SU-ER-D-encrypted, SU-ER-D-unreadable, SU-ER-D-page_limit, SU-ER-D-expansion_limit, SU-ER-D-time_limit, SU-ER-D-resource_limit, SU-ER-D-aborted, SU-ER-D-unavailable | Unchanged: the error alert under the intake card. |
| SU-IN-11, SU-IN-12 | Moved to the Selection segment and the notice stack. |
| SU-IN-13, SU-IN-14 | Unchanged, inside the File card under the field. |
| SU-ST-01 | Moved to the launcher command "Structure references"; the result opens in the "Recognized references" Dialog. D shows no structuring control in the intake. |
| SU-ST-02, SU-ST-05, SU-ST-06, SU-ST-07 | Moved to the "Recognized references" Dialog, which also has Check. |
| SU-ST-03, SU-ST-04 | Unchanged notices, in the structuring Dialog and the notice stack. |
| SU-QU-01 | Moved to one inline Check at the intake card's bottom right, with the disabled reason beside it. |
| SU-QU-02 | Moved to the ⋯ Menu ("Reset") and the launcher ("New check"). |
| SU-QU-03 | Moved to the info line under the intake and the feed footer. |
| SU-QU-04, SU-QU-05, SU-QU-06, SU-QU-08 | Unchanged in hosted. Standalone shows no meter, note or upgrade (section 9, ADR-0003). |
| SU-QU-07 | Moved to the notice stack above the feed. |
| SU-QU-09 | Unchanged (server). |
| SU-RU-01 | Moved to the strip head: "Check running", "x of n checked", progressbar; done "Check complete" with the summary sentence. |
| SU-RU-02, SU-RU-03 | Unchanged: polite live region, and the stream error with Reconnect in the notice stack. |
| SU-RU-04 | Moved to the strip head, compact lede, ⋯ Menu and launcher, label "Cancel check". |
| SU-RU-05, SU-RU-06 | Moved to the notice stack. |
| SU-RU-07 | Moved to the FeedCard EvidenceTrack: a spinner node and "Checking with {source}" (section 13). |
| SU-RU-08 | Unchanged: the done sentence in the strip and the compact lede. |
| SU-ER-01 … SU-ER-11 | Unchanged: the error alert under the intake card or in the notice stack. |
| SU-RE-01 | Moved to the "How the check works" Dialog (⋯ Menu, launcher and footer link). |
| SU-RE-02 | Moved to the feed echo line ("n references recognized"). |
| SU-RE-03 | Moved to the D counter tiles (wide) and glyph counters (compact). Names carry the full Verdict and the manual count. |
| SU-RE-04 | Moved to the dashed "Technical status" counter group in the strip. |
| SU-RE-05 | Moved to the compact ⋯ Menu ("Show all labels" / "Compact labels"). "Show all" is "Clear filter" and the empty-filter button. |
| SU-RE-06 | Moved to the filter row (wide) and the filter chip with × (compact). |
| SU-RE-07 | Moved to D FeedCards in the same GridList. |
| SU-RE-08 | Unchanged. |
| SU-RE-09 | Moved to the detail header: Close (web) / Back (narrow), Escape. Removed: the pre-selection prompt (`workspace_select`), D: "Detail: web = push drawer from the right (feed stays visible, narrowed); 360 px = full view with Back." The detail exists only for an opened card. |
| SU-RE-10, SU-RE-11, SU-RE-12 | Unchanged badges and glyphs, in the FeedCard and the verdict card. |
| SU-RE-13 … SU-RE-21, SU-RE-23 | Unchanged, inside the detail ("Explanation and source evidence" Disclosure and the field table). |
| SU-RE-22 | Moved to the D field table ("Field / Your reference / Best match"). |
| SU-RA-01, SU-RA-03 | Moved to the field-table header ("Edit fields", re-check) and the revision line. |
| SU-RA-02, SU-RA-04 | Unchanged editor, opened under the table. |
| SU-RA-05 … SU-RA-09 | Unchanged (ADR-0027), after the table. |
| SU-RA-10, SU-RA-11 | Unchanged, restyled sections. |
| SU-RL-01 … SU-RL-07 | Moved to the "Edit reference list" Dialog (⋯ Menu, launcher). |
| SU-OU-01, SU-OU-02 | Moved to the Export Dialog (⋯ Menu, launcher). |
| SU-OU-03, SU-OU-04, SU-OU-05 | Moved to the "Formatted bibliography" Dialog (⋯ Menu). |
| SU-OU-06 … SU-OU-11 | Moved to the PDF report Dialog (⋯ Menu, launcher). |
| SU-OU-12 | Unchanged (server). |
| SU-HI-01 … SU-HI-10 | Unchanged (hosted, #229). |
| SU-AC-01 … SU-AC-13 | Unchanged (hosted, #229). |
| SU-DP-01 … SU-DP-10 | Unchanged (hosted). |

### i18n keys removed

| Key | Reason |
|---|---|
| `workspace_select` | The pre-selection prompt is gone with the empty detail pane (SU-RE-09). |
| `shell_status_count` | The status menu became the "Technical status" counter group (SU-RE-04). |
| `shell_summary_options` | The "Summary options" menu became the ⋯ "More actions" Menu (SU-RE-05). |
| `shell_files` | The "Files and selection" toggle became the File segment (SU-IN-05). |
| `shell_file_source` | The echo line shows the file name itself (SU-IN-04). |

### i18n keys added

Each key has an English and a German message; `pnpm i18n:check` passes.

- Shell and strip: `shell_back`, `shell_cancel`, `shell_check_complete`, `shell_check_in_progress`, `shell_check_short`, `shell_checked`, `shell_command_hint`, `shell_edit_list_reason`, `shell_export`, `shell_kbd_submit`, `shell_keep`, `shell_more_actions`, `shell_outcome_filters`, `shell_report`, `shell_reset_confirm`, `shell_run_lede`, `shell_stop_reason`, `shell_structuring_preview`, `shell_verdicts`.
- Intake: `shell_intake_heading`, `shell_intake_lead`, `shell_intake_placeholder`, `shell_insert_example`, `shell_formats`, `shell_remove_file`, `shell_source`, `shell_source_text`, `shell_source_file`, `shell_source_selection`, `shell_selection_after_check`, `shell_order_note`.
- Feed: `shell_feed_disclaimer`, `verdict_short_correct`, `verdict_short_doi_conflict`, `verdict_short_exists`, `verdict_short_mixed`, `verdict_short_not_found`, `verdict_short_not_verifiable`.
- Detail: `shell_previous_reference`, `shell_next_reference`, `shell_reference_position`, `shell_your_reference`, `shell_field`, `shell_field_by_field`, `shell_original_input`, `shell_evidence_steps`, `shell_evidence_track`.
- Counts: `workspace_recognized_one` and `structuring_summary_one`, the singular forms ("1 reference recognized"); `ai_upgrade_hint`.

`ai_feature_unavailable`, `ai_guest`, `input_hint`, `shell_empty_input`, `shell_feed_done`, `workspace_recognized` and `workspace_statuses` keep their keys with new text.
