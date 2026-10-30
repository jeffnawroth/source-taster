# Issue #83 — field revisions and single-Reference Re-checks

Implements FA-STR-10/11/12 under ADR-0005 and ADR-0016. The confirmed seams from #70 are HTTP/SSE with real disposable PostgreSQL and fixture HTTP adapters, plus Playwright for client behavior. No private data, provider activation, scoring thresholds or qualification gates changed.

## Delivered behavior

- A stable slot retains its immutable original text and original structured snapshot, including source span. Every saved field draft appends a numbered user revision. The first revision and every earlier result remain readable in the v2 snapshot.
- Each immutable result has an ID, generation and field revision. A current running Status supersedes the historical Verdict; saving without a run shows not checked for the new fields. Results retain their original scoring/search configuration.
- `POST /v2/checks/{id}/references/{slot}/revisions` accepts `expectedRevision`, committed CSL `fields`, optional `authorsTruncated`, and `recheck`. Saving and requesting the run are one locked transaction.
- `POST /v2/checks/{id}/references/{slot}/recheck` runs only that slot without inventing a field revision. Queue admission allocates a fresh generation, including cancellation before worker claim. Worker generation/revision/claim fences reject late output.
- `quotaEffect: free-recheck` explicitly marks a slot with an earlier Verdict. A never-billed slot remains `new-work` until its first Verdict; failed/cancelled/not-checked Statuses do not turn it into a free billed slot. Existing durable settlement intents remain the #99 handoff: this ticket creates no balances or fictitious debits.
- `POST /v2/checks/{id}/references` applies a previewed add/remove request with `expectedEventSeq`. Structural editing is rejected while any slot runs. Removal is a tombstone, never slot reuse or a refund. Added References get increasing slot IDs and start as new work. Snapshots and bibliography projection omit removed slots.
- Ended Checks stay ended while slots run. Renewal, cancellation, authority invalidation, worker recovery and SSE track active slots independently. Re-check completion never rewrites the original end time/reason. An ended event closes each completed batch of current slot work.
- v2 content access/mutation rejects the fixed temporary deadline with `check-expired` (410). `SOURCE_TASTER_CONTENT_RETENTION_MS` defaults to 24 hours from the original end, or creation for a never-ended Check. Re-checks do not extend it. Retention deletion/History remain #86's work.
- Owner/current `check:create` authority guards every mutation and publication; reads/streams retain current `check:read` authority. A stale revision, stale list cursor or disallowed active run returns 409 rather than silently applying a draft.
- The shared web/extension workspace separates teal field corrections and Re-check controls from the amber Reference-list editor. Edits stay local until Save; list membership requires a count/consumption preview. Both clients show original input, field provenance/revisions, historical results and applicable Quota semantics in DE/EN. All Check content remains in memory.

## Integration handoff

The frozen v1 schemas and numeric SSE protocol remain readable. v2 adds snapshot metadata and full slot metadata to Reference events; `removed: true` removes a slot, and a new slot event appends it in input order. Consumers must use `reference.fields` for current committed fields, not the newest historical result's `reference.csl`. `reference.results` is newest-generation first; `reference.revisions` is oldest-revision first. Results can belong to an earlier revision while the current slot is not checked/running. This is especially relevant to concurrent export work #87 and later Manual override/report work.

Transport source and generated JavaScript/declarations/OpenAPI retain the dual-license headers. Migration `20261030010000_reference_revisions` adds removal tombstones and append-only field snapshots and backfills existing structured slots. Queue/settlement identity stays Check + slot + generation; #99 must enforce its once-per-slot journal debit.

## Validation

Actual red/green logs are retained locally under `/tmp/source-taster-70/83-*.log`. The API slices first failed for missing revision/list routes (404), then a non-running requested Re-check, the missing fixed expiry (200 instead of 410), and cancellation of a queued Re-check (500 from reusing the prior result generation). Each was implemented and rerun green. The first browser launch was blocked by missing controlled website build inputs; after the repository's pinned fetch/build, the pre-change UI was replayed to verify the missing Edit fields action fails, then the new UI ran against real HTTP/SSE.

Final check counts and integration ancestry are recorded below after validation completes.

## Limits retained

Quota journal enforcement belongs to #99. History consent/retention/deletion belongs to #86; this ticket enforces the current temporary expiry for the new workflow. Manual overrides belong to #84. Native Firefox/ESR, Safari, Q01/Q02 accessibility qualification, real provider permissions and Quality gates remain outstanding; automated Chromium/axe checks do not claim those gates passed. No release configuration is activated.
