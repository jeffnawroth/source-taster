---
status: accepted
---

# Present one stable Check workspace with explicit editing, export and History actions

The client accepted this design on 25 October 2026 in [Results presentation and correction workflow](https://github.com/jeffnawroth/source-taster/issues/46), through [F1–F3](https://github.com/jeffnawroth/source-taster/issues/46#issuecomment-6396447595), [F4–F6](https://github.com/jeffnawroth/source-taster/issues/46#issuecomment-6396465746), [F7–F9](https://github.com/jeffnawroth/source-taster/issues/46#issuecomment-6396487276) and [F10–F12](https://github.com/jeffnawroth/source-taster/issues/46#issuecomment-6396516277). Use a shared responsive workspace in the web app and extension, keeping results stable while work progresses and separating field corrections, manual judgments, export-only suggestions and new billed Checks. This makes the append-only lifecycle understandable without turning every user interaction into a new run or silently overwriting evidence.

The approved baseline remains [requirements v3.3](../requirements-specification.md). The lifecycle, Quota, scoring, structuring, authentication and security constraints remain [ADR-0004](0004-owner-plan-quota.md), [ADR-0005](0005-check-reference-lifecycle.md), [ADR-0008](0008-scoring-verdict-rules.md), [ADR-0011](0011-non-ai-structuring.md), [ADR-0013](0013-authentication-roles.md) and [ADR-0015](0015-security-abuse-protection.md). This is an accepted presentation/interaction design, not a requirements amendment, implemented interface, tested prototype or passed accessibility/browser assessment. Example action labels below are English; product text remains DE/EN.

## Entry and automatic progression

After paste, PDF/DOCX selection, BibTeX/RIS import or context-menu selection intake, the user invokes one initial **Check** action. The context menu opens the side panel and takes over selected text; it does not silently spend Quota. Disable the initial action on empty input. Preserve the existing format/size/resource checks and structured error messages.

Structuring is free. Show the recognized Reference count and expected Quota consumption **before search starts**. With sufficient Quota, search starts automatically under FA-STR-05; there is no extra mandatory review/confirmation stage. With insufficient Quota, show the existing partial-Check/upgrade offer first. A partial Check takes the first N slots in list order, with removal before starting as the existing selection mechanism; do not introduce arbitrary selection checkboxes.

Show available Quota in total and provide the existing grant/expiry breakdown and consumption warnings. Counts, reserved amounts and actual debits must remain distinguishable. Adding/removing References does not rewrite the Quota journal or promise a refund. No subscription or registration is required merely to reach the Guest Check.

Keep [ADR-0011's](0011-non-ai-structuring.md) Bibliography selection: all detected regions initially selected, each movable/deselectable; no detection permits manual selection with no invented References or charge. Rejected entries appear separately under **Not recognized as a Reference**, with adoption creating a new slot under the list-edit workflow. They are neither a seventh Verdict nor a technical Status. Show no-recognition/input guidance, the parser/AI reason and applicable AI-result/provenance notices without hiding them behind an upgrade.

## Responsive workspace and stable overview

At sufficient width, the web workspace shows the Reference list and selected detail alongside each other. In the narrow side panel, detail replaces the list; **Back** restores the filter and list position. The underlying Check and functionality are the same. Existing web-only purchase/account/Operator paths and extension-only selection/panel exceptions remain FA-GLE-02; narrow width does not remove a required Check action.

References initially stay in input order. Streaming events update their existing rows without automatic reordering or moving keyboard focus. Show overall/per-Reference progress and the current step in understandable text. Summary counts update with the list and the six Verdict counts act as filters. Make filter state clear and retain it across list/detail navigation.

Use the exact six system Verdict concepts: **Correct; Exists, with deviations; Mixed citation; DOI conflict; Not found; Not verifiable**. Rows show title, Verdict text, icon/color and a short explanation; color alone is insufficient. Technical **running, cancelled, failed, not checked** Statuses remain distinct from Verdicts and are accounted for separately. A running Re-check has its current Status; an older result is historical information, not a second current Verdict to count.

For a finished result with a Manual override, list, summary/filter and Verification report use the effective Verdict **with an explicit manual indication**. Keep the system Verdict accessible and unchanged. Confirmation with the same Verdict is manual too. Summary totals cover the current non-removed list, while actual consumption can include already billed removed slots; explain the difference rather than changing either count.

Provide **How the check works** directly from the list with the required explanation that a Verdict is not proof of deception and a human makes the decision. Unknown evidence must remain unknown. Existing retraction support remains independent of Verdict, without promoting the should UI feature or introducing post-match enrichment.

## Detail and action availability

Present Verdict and plain-language explanation first, followed by immutable original input and the editable-field/Best match comparison. Keep Reference and Best match values directly side by side, field by field, with readable wrapping at narrow widths. Mark actual deviations and name both values; distinguish absent/unknown values from agreement. If identity is unresolved or no Candidate exists, show that limitation instead of inventing a proven Source.

Additional Candidates are expandable in descending **internal Score** order, with Data source, Score and field values. Rounded display values do not reorder Candidates or prove identity. Make source links and eligible Correction suggestions directly reachable. The current evidence/revision, AI-added/changed fields and relevant provenance must be understandable without exposing service secrets or interpreting external HTML as trusted content.

| Action | Availability / effect |
| --- | --- |
| Edit fields | A slot that is not running; other idle slots remain editable while another slot runs |
| Save and re-check | Commit the field revision and request only that slot's run; no request on each keystroke |
| Confirm Verdict / Judge manually | A finished Verdict; bind the manual layer to exactly that immutable result |
| Copy / Use for export | An eligible Correction suggestion from the selected result; no automatic input mutation |
| Edit Reference list | No active Check/Reference run; preview structural changes before applying |
| Stop Check / Reset | Follow the existing whole-Check cancellation/reset semantics and confirmed operation state |

Collect field changes as a draft in the edit mode, then save as one user-provenance revision. Do not display an earlier result as if it verified unsaved/new fields. While the slot runs, its fields are disabled and the old result remains clearly historical; on completion present the newest result. Preserve immutable input, prior revisions/results and Scoring rules versions. A stale/concurrent operation must not silently attach a response or override to a different result/revision.

Already debited slots are not charged again. A previously unbilled slot is charged once on its first Verdict under ADR-0005; a technical failure/cancellation does not become billed by being labelled a retry. Communicate the applicable consumption instead of promising that every first successful retry is free.

Manual judgment selects an effective Verdict without modifying fields, Score, system evidence or source identity. It cannot manufacture an eligible Correction suggestion. A Re-check appends a new result and visibly resets the prior result-bound override; the historical override stays with its old result. No persistent override carries to a new result or restarted Check.

## Suggestions, exports and Verification reports

Eligible suggestions offer **Copy** and **Use for export**. The latter marks a transient choice for the current export, not a stored field revision. A user who wants to change fields uses Edit fields/Save and re-check. Before download show format, selected citation style and the selected suggested corrections. Citation style changes rendering, not the Verdict; preserve ADR-0011's pinned style/locale manifest and existing Account/browser settings rules.

Launch citation export remains CSL-JSON and traditional BibTeX under FA-ERG-30. Export uses the current committed fields, including user corrections, omits removed slots and replaces only selected eligible suggestions in that export. Do not apply a stale selection to a different result or create a suggestion for unresolved identity. Never modify the original document automatically. Keep the transient export selection out of persistent browser storage and do not present it as a durable saved correction.

The PDF Verification report is a separate evidence action under FA-ERG-20. It reflects the authorized snapshot at generation: date, document name, current non-removed References, results/explanations/suggestions and manual markings with system Verdicts. Preserve each result's actual field revision and Scoring rules version; mixed versions need per-Reference reporting. A running/uncompleted slot cannot be represented by a completed historical Verdict as if the latest work succeeded. Unsaved drafts and transient citation-export choices are not new verified results.

Screen-reader-readable PDF generation and its library are a separate design decision. This ADR defines the user-facing action/content boundary but selects no PDF engine and claims no tagged-PDF output. RIS, table export, shared links and projects retain their existing should/deferred obligations; no new format or sharing feature is promoted here.

## List membership, Bibliography edits and cancellation

**Edit Reference list** groups manual addition/removal and detected-region correction. Gate structural editing until no Check/Reference run is active; the user can explicitly stop the whole running Check first. This is a presentation choice for membership changes, not a restriction on F5's editing of other idle slots and not a per-Reference cancel operation. Still enforce current server-side state when applying the change.

Preview the added/dropped entries and expected additional consumption before applying structural changes. Keep ADR-0011's difference handling: unchanged spans retain slots/fields/results, dropped spans are removed, newly included spans receive new slots, and cutting an entry removes the old slot and creates a new one. Show the actual resulting count/cost before automatic search or the existing insufficient-Quota offer; do not add a second mandatory confirmation after Structuring. Already consumed Quota is never refunded by removal. Removed slots disappear from list/report/export while their journal effects remain.

**Stop Check** preserves completed Verdicts/debits, ends unfinished work and releases remaining reservations. **Reset** additionally clears current input/results and requests confirmation when input exists; it never deletes a stored History entry. A cancelled Reference is not silently resumed by resetting/reopening the UI. Later accepted same-slot work follows the existing lifecycle and billing rules; no whole-Check restart is hidden in a retry button.

Show connection/reconnect state. Losing the network or closing the panel alone is not immediate cancellation; reconnect within the lease resumes the same current-authorized Check snapshot/event replay. Lease expiry can cancel unfinished work. Do not promise background execution, unlimited reconnect time or persistent device recovery. A reconnect must not create a second Check, duplicate debit or revive expired/deleted content; late results after cancellation are discarded. Distinguish pending/unknown cancellation from confirmed server completion when the connection is unavailable.

## History, consent and expiry

Separate **Open result** from **Start as a new Check**. Open result accesses the same retained, permitted Check, with its existing results and free same-slot Re-checks of already debited References. Start as a new Check creates a new billed Check and clearly warns about consumption beforehand. Copy current non-removed fields/original provenance but no old results or overrides; the original entry remains unchanged. Preserve the initial count/Quota/automatic-start protocol.

History shows retention/deletion and any Plan lock. Locked entries remain deletable; ordinary content access stays locked until permitted under ADR-0004. An upgrade does not extend an existing deletion date. Free's five usable entries/30-day retention and paid's 90-day retention, overflow/locking and consent revocation remain existing policies, not new UI-controlled exceptions.

The Account-level **Save History** setting requires explicit informed consent. Show the actual storage state in the workspace and the server-established deletion date once known; do not invent a fixed timestamp before the lifecycle establishes it. Without History, explain temporary storage briefly: deletion is at most 24 hours after the Check ends, or 24 hours after creation for a Check that never starts. Re-checks do not extend the fixed deadline. Withdrawal explains the effects and requires confirmation before existing History is deleted; do not confuse it with simply clearing a workspace.

A Guest who signs in receives a clear notice that the current Guest Check remains Guest-owned; later Account Checks use the Owner context. Do not migrate Guest content/Quota or restore it from browser storage. Content remains in memory only while the page/panel is open, with authorized server retention under ADR-0005. Language/style and authentication settings do not authorize persistent device storage of Check content.

## Errors, accessibility and security

Every error says what happened and the next available action: sign in, wait until the stated time, correct input or retry the affected Reference. Cover offline, rate-limited, exhausted Quota, expired sign-in, unavailable Data sources, invalid/broken/encrypted/oversized input, no References, technical scoring failure and expired Check cases. Distinguish parser/AI fallback and incomplete evidence from a completed successful search. Other References continue where current authority and lifecycle permit.

**Not verifiable** is a billed Verdict with a concrete reason, relevant Candidates and failed/incomplete steps; unknown evidence is labelled unknown. Internal technical **failed** is an unbilled Status. Do not downgrade a service/authentication outage into Guest mode or convert safety limits/timeouts into Not found. Offer an applicable existing-slot retry without silently starting a new paid Check. Existing upstream retry policy remains; this is not a new automatic retry budget.

All product messages/actions are DE/EN and must satisfy WCAG 2.2 AA. Maintain keyboard operation, semantic labels, visible focus and meaningful field/table relationships; Back returns to the relevant list context. Announce progress/status changes understandably without stealing focus or flooding the screen reader for each raw event. Filters, counts, manual indicators, errors and confirmed destructive actions need accessible state. Prove narrow side-panel field comparison with wrapping/reflow/zoom, not only a wide desktop screenshot. Smartphone usability retains its separate should obligation.

Render all document/Candidate/AI text safely. Current session/Owner/permission checks remain mandatory for reads, streams, downloads, edits and restored History. No UI button, origin claim or cached content grants authority; preserve ADR-0013/0015 revocation, privacy and deletion rules. The ordinary Operator interface/private backend receives no verification content through this workflow.

## Acceptance evidence and handoffs

Before launch demonstrate both clients against the same API and shared workflow, with the existing native browser/parity gates:

- Initial intake, empty input, no recognition, parser/AI notices, count/consumption before automatic start and first-N partial selection without forced signup or another confirmation stage.
- Stable streaming order, matching effective-Verdict counts/filters, separate Statuses, manual indicators and readable side-by-side detail in narrow/wide layouts with restored navigation context.
- Draft field edits, concurrent/stale saves, Re-check completion/failure, historical result labels, immutable originals, override reset and one-debit-per-slot behavior.
- Eligible suggestion copy/export selection, style changes, formats/provenance, removed slots, stale-result selections and the distinction from persistent field changes/report snapshots.
- Structural edit preview, manual/rejected-entry adoption, multiple/no Bibliography regions, cut/dropped/unchanged spans, cancellation/reconnect/reset and no duplicate charge or invented negative evidence.
- History open versus new billed Check, consent/withdrawal, locks/deletion dates, Guest sign-in, expiry and absence of persistent device content; test actual authority/revocation during display and downloads.
- DE/EN coverage, greyscale/non-color cues, keyboard/focus, screen-reader updates, live errors and required WCAG/browser acceptance. Documentation alone does not pass these checks.

**Handoffs:** accessible PDF generation must realize the report snapshot/content and screen-reader requirement; transactional messages/documentation must cover the UI errors, consent/retention notices and How the check works explanation. Final requirements traceability must retain these UI evidence cases alongside ADR-0005/0008/0011/0013/0015. No PDF library, legal/privacy review, analytics tool, full message catalog or implementation backlog is created by this decision.

## Rejected alternatives

- A mandatory post-Structuring review screen before every sufficiently funded Check, or silent search merely because a selection was imported.
- Reordering References on each arriving Verdict or using Candidate order/Score as proof of identity.
- A Re-check on every keystroke, a manual Verdict that replaces system evidence, or an override surviving into an unseen new result.
- Treating Use for export as a stored field correction or silently restarting a paid Check on reconnect/retry.
- Hiding required Check capabilities in the narrow extension layout, persistent browser content caches, or reset deleting History.
