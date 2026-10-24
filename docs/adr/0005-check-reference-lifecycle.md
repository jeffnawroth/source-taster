# Model each Reference as a stable slot with immutable input, field revisions and append-only results

The client accepted this decision on 24 October 2026 in [Check and Reference model and lifecycle](https://github.com/jeffnawroth/source-taster/issues/14). It fills the meaning of cancellation, failure, lease expiry and billing that [ADR-0003](0003-system-architecture.md) left open. It also defines the Reference slot that [ADR-0004](0004-owner-plan-quota.md) keys its debits on.

Within its Check, every Reference is a stable slot:

- its original input never changes;
- each correction adds a field revision;
- each run of the Reference appends an immutable result.

Content without consented History is deleted on a fixed deadline. This keeps free Re-checks, the original verdict, manual overrides and the verification report consistent with each other, and with the Quota journal. The cost is more stored versions per Reference while a Check lives.

This ADR fixes the conceptual model only, not the storage schema. These belong to other tickets:

- the search flow and search-log detail: [Search strategy and latency budget](https://github.com/jeffnawroth/source-taster/issues/16);
- thresholds, verdict derivation, and which Verdicts carry a Correction suggestion: [Scoring and verdict rules](https://github.com/jeffnawroth/source-taster/issues/17);
- the round trip of raw BibTeX and RIS: [Non-AI structuring approach](https://github.com/jeffnawroth/source-taster/issues/20). This ADR fixes only the policy that the original input is never replaced;
- presentation: the "Results presentation" fog item on the map;
- backup lifetime: [Hosting and operations](https://github.com/jeffnawroth/source-taster/issues/22).

## Reference slot

- **Identity.** Each Reference has a fixed slot within its Check. Quota debits are keyed on Check and slot (ADR-0004).
- **Correction (FA-STR-10).** Editing fields adds a new field revision to the **same** slot, so the Re-check stays free (FA-STR-11).
  - Fields can be edited only while the slot has a Verdict or Status, not while it is running.
  - There is no cancellation of a single Reference; only the whole Check is cancelled.
- **Adding (FA-STR-12).** A Reference added by hand gets a new slot and is billed on its first Verdict.
- **Removing (FA-STR-12).** A removed slot is marked as removed, not deleted. It is missing from the result, the verification report and the export.
  - A removed slot that already had a Verdict stays billed. This includes References dropped by moving the bibliography boundary (FA-ERF-05) after the automatic start (FA-STR-05).
- **Example.** A Check of 40 References debits 40. Then:
  - 3 References are corrected and checked again: +0;
  - 1 Reference is added: +1;
  - 2 References are removed.

  The Check has debited 41 in total and shows 39.

## Provenance

- **Immutable original input.** Each slot keeps:
  - the raw text or the imported record, including fields the system does not support;
  - for documents, the source span in the text.
- **Fields.** On top of the original input sits the canonical CSL projection. Each field records whether it came from the parser, AI extraction or the user. Fields that AI extraction changed are marked (FA-STR-08).
- **Corrections never replace the original.** A correction only adds a field revision whose provenance is "user".

## Results

- **One immutable result per run.** Each run of a slot produces a result containing:
  - the field revision that was checked;
  - the Candidates as retrieved, the search log, the Field scores and Scores, and the Best match;
  - exactly one Verdict **or** one Status (FA-ABG-10);
  - the failed Data sources (FA-SUC-05);
  - the Scoring rules version.
- **Re-checks append.** A Re-check adds a new result, and the newest result is shown. A Re-check always uses the current Scoring rules version, while older results keep theirs.
- **Retraction marker (FA-SUC-09, FA-ABG-17).** The marker is a flag on the result, independent of the Verdict, so a result can be Correct and retracted. The search sets it.
- **Content, not logs.** The search log and the Candidates are content of the Check and are deleted with it. Operational logs stay content-free (ADR-0003).

### Manual override (FA-ABG-16)

- An override is a separate layer bound to exactly one result.
- Confirming a Verdict is an override with the same Verdict, and is also marked as manual.
- A Re-check creates a new result to which the override no longer applies. The user sees a notice that the manual verdict was reset by the Re-check. The old override stays attached to the old result.

## Status, Verdict and billing

- **Statuses.**

  | Status | When |
  |---|---|
  | running | the slot is being checked |
  | cancelled | the Check ended before the slot finished |
  | failed | an internal technical error occurred |
  | not checked | a partial Check left the slot out |

- **Billing.** A slot is debited at most once, on its first Verdict. Statuses are never billed.
- **Data source outage (FA-SUC-05).** If all responsible Data sources fail, the result is the **Verdict** Not verifiable, and it is billed like any other Verdict (FA-KTO-11). This keeps the amount shown before the start equal to the amount deducted (FA-ERF-08). A later Re-check of that slot, once the sources respond again, is free.
- **Internal technical error.** The slot gets the Status failed, is not billed, and does not block the other slots (§9.5). A later retry is billed once, when it produces a Verdict.
- **Partial Check (FA-KTO-13).** When Quota is insufficient, the Check takes the **first N slots in list order**, where N is the amount ADR-0004 offers. Users can remove References before the start to choose. The other slots get the Status not checked and can be checked later, billed normally, once Quota is available.

## Check lifecycle

- **States.** A Check moves through these states:
  1. **structuring**: nothing is debited (FA-STR-05);
  2. **awaiting start**: the partial-Check or upgrade offer of FA-KTO-13 is shown;
  3. **running**;
  4. **ended**: completed, cancelled or lease expired.

  After that, the Check can only expire or be deleted.
- **Re-checks after the end** do not make the Check running again. Only the affected slot runs, using the same lease and event mechanism.
- **End of the Check.** The Check ends at the moment its last slot holds a Verdict or Status. Later Re-checks never move this moment.

### Cancellation

Three triggers cancel a running Check, all with the same effect:

- the explicit cancellation `POST /v1/checks/{id}/cancel` (FA-SUC-08);
- reset (FA-ERF-11), which also clears the input but never deletes a History entry;
- lease expiry, the system-side cancellation.

The effect is:

- Verdicts finished before the cancellation stay and are billed;
- running and unstarted slots get the Status cancelled, and their reservations are released;
- results arriving after the cancellation are discarded.

This keeps the deduction equal to the Verdicts the user sees (FA-ERF-08).

### Lease expiry

- Closing the panel or losing the connection is not a cancellation by itself (ADR-0003).
  - A client that reopens within the lease reconnects and receives the missed events by replay.
  - When the lease expires, the Check is cancelled as above.
- The lease grace period is a configured technical timeout, not an initial value of the specification.
- **FA-ERF-09 trigger (§19).** A metric counts cancelled Checks of 100 References or more, split into explicit cancellation and lease expiry. Background checks remain deferred.

## Storage, History and deletion

- **Without History (FA-UEB-10).** This applies to Guests and to signed-in users without History consent.
  - The server deletes the content at the latest 24 hours after the end of the Check. The deadline is fixed and Re-checks do not extend it.
  - A Check that never started, for example one abandoned at the partial-Check offer, is deleted 24 hours after it was created.
  - After deletion, a Re-check answers "Check expired".
  - The client holds content only while the panel or page is open, and never stores it persistently on the device.
- **Guest who signs in.** A Guest Check stays with the Guest and is deleted under FA-UEB-10; it never moves to the Owner. Only Checks started after sign-in belong to the Owner.
- **History consent (FA-UEB-11).**
  - Consent is a revocable setting per Account.
  - A Check is stored at its end, and its retention period runs from then. The deletion date is fixed at storage (ADR-0004), so an upgrade does not extend existing entries from 30 to 90 days.
  - On Free, storing a new entry when five usable entries exist deletes the oldest usable entry (FA-KTO-15). Entries locked under ADR-0004 are not affected.
  - Revoking consent stops new entries and, after a warning, deletes all existing entries.
- **Opening and restarting History (FA-ERG-22).**
  - **Opening:** a History entry is the same Check. Within its retention period, and unless it is locked, it can be corrected and checked again for free.
  - **Restarting:** this creates a **new** Check, billed in full. For each slot that was not removed, it copies the current field revision with its original input and provenance, but no results and no overrides. The old entry stays unchanged.
- **Deletion.** Deleting a History entry, a Check or an Owner takes effect immediately in the live data, temporary files and job queues. An ID-only tombstone is written.
- **Restore.** After a restore, the tombstones and the FA-UEB-10 and FA-UEB-11 expiry sweeps run **before** the system serves traffic again.

## Verification report and export

- **Verification report (FA-ERG-20).** The report reflects the state at the time it is generated:
  - the newest result of every slot that was not removed;
  - overrides with their marking and the original Verdict.

  The Scoring rules version appears once in the header, or per Reference when the slots of the Check differ.
- **Export (FA-ERG-30).**
  - The export always contains the current fields, including the user's own corrections, and leaves out removed slots.
  - "With applied corrections" replaces the fields of each Reference that has a Correction suggestion with the data of the Source found. This happens **only in the export**: nothing is stored, and the original input and revisions stay unchanged.

## Reported wrong Verdict (FA-ERG-15, hook only)

- A report with consent creates an immutable copy in the verification program. The copy contains:
  - the original input and the fields;
  - the result and its Verdict;
  - the Scoring rules version;
  - the opaque Owner and acting Account IDs.
- The copy is exempt from the 24-hour rule and has its own configured retention period. The concrete period is left open for privacy and legal review.
- The Operator area (FA-BTR-08) reads the copy in the browser directly from an Operator-only endpoint of the verification API. The service backend therefore never receives the content (ADR-0003).

## Considered options

- **A new slot per correction**, rejected because it would turn free Re-checks into billed ones.
- **Overwriting the result on a Re-check**, rejected because the original Verdict and its Scoring rules version would be lost.
- **Not billing Not verifiable after a total Data source outage**, rejected because the deduction would differ from the amount shown before the start (FA-ERF-08). It would need a requirements change.
- **Lease expiry keeps the Check running**, rejected because that is half of the deferred FA-ERF-09.
- **Free choice of References for a partial Check by checkbox**, rejected in favor of list order plus removal before the start.
- **Refunding References dropped by a boundary correction**, rejected for one uniform removal rule.
- **Carrying an override over to a new result**, rejected because it would vouch for a result the user never saw.
- **Re-checks extending the 24-hour deadline**, rejected because content could be kept indefinitely.
- **Moving a Guest Check to the Owner at sign-in**, rejected to keep Guest and Owner Quota apart.
- **Persistent device-local storage of results**, rejected because it would undermine FA-UEB-10.

## Consequences

- **Storage grows with Re-checks** while a Check lives. Deletion deadlines and History retention bound it.
- **Users pay for outage verdicts.** A total Data source outage costs Quota. The free Re-check limits the harm.
- **Retention of reported copies** needs privacy and legal review (FA-UEB-23).
- **Handed-off interfaces:**
  - [Search strategy and latency budget](https://github.com/jeffnawroth/source-taster/issues/16):
    - the content of the search log and of Candidates as retrieved;
    - setting the retraction flag;
    - naming failed Data sources.
  - [Scoring and verdict rules](https://github.com/jeffnawroth/source-taster/issues/17):
    - which Verdicts carry a Correction suggestion;
    - versioning of the Scoring rules version.
  - [Reference test set and release quality gate](https://github.com/jeffnawroth/source-taster/issues/15): the expected Verdict refers to the newest result of a slot.
  - [Non-AI structuring approach](https://github.com/jeffnawroth/source-taster/issues/20): keeping the raw imported record, including unsupported fields, and the source span.
  - [Hosting and operations](https://github.com/jeffnawroth/source-taster/issues/22):
    - the 24-hour and History expiry sweeps;
    - the tombstone replay before serving after a restore;
    - backup lifetime;
    - the FA-ERF-09 cancellation metric.
  - [Authentication and roles](https://github.com/jeffnawroth/source-taster/issues/23):
    - History consent as an Account setting;
    - the Operator permission for reported copies.
  - [Operator tools without a dedicated interface](https://github.com/jeffnawroth/source-taster/issues/24): reading reported copies.
