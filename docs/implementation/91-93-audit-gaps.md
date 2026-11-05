# Audit gaps: #91 AC3 and #93 AC3

The requirements audit of 2026-11-04 (main at `0ff6751`) left two acceptance
criteria PARTIAL. This note records what was added and the reasoning, so the
verdicts do not rest on a reading of the code alone.

## #91 AC3: the raw upload is never persisted

AC3 reads: "The raw upload is deleted in the same transaction that stores its
References." That wording assumes a staging copy exists. It does not, and it must
not: the document upload path (`apps/server/src/documents/upload.ts`, the
`structureDocument` route in `src/http/app.ts`) is stateless. The request body is
read into memory with a byte bound, handed to the isolated extractor over stdin
(no host mount, no network, read-only filesystem; the isolation boundary of
[ADR-0015](../adr/0015-security-abuse-protection.md)),
and only the extracted text and its structuring are returned. A Check later
stores those References, never the upload.

### Why "never stored" satisfies the intent of AC3

The point of AC3 is that, once References exist, no copy of the raw upload
remains that could outlive the Check deadline or escape the retention and
encryption rules of ADR-0005, ADR-0012 and AC4. Deleting a staging copy in the
same transaction is one way to guarantee that: it closes the window in which the
upload and the References could both exist, or in which only a crashed half of
the pair survives. Never creating the copy closes the same window completely.
There is no staging row to delete transactionally, no failed-deletion state, no
orphan after a crash between the two steps, and nothing in the owned database
for a backup to capture.
A request that fails at any stage has the same property. The strongest reading of
the criterion, "after the References are stored, no raw upload exists", holds
trivially for the upload route, and the test below guards it against a future
staging copy. Scope of the proof: the owned database and the service's private
`TMPDIR`; writers that bypass `TMPDIR` (a hard-coded `/tmp`, a reverse proxy
buffering request bodies) and the AI structuring path (#103) are not covered.

The ticket text should be amended to say so (see the verdict below). This note
does not change the ticket.

### Test

`apps/server/test/document-never-stored.test.ts` (real PostgreSQL, real web and
worker processes, the real extractor container). For every upload it asserts:

- **Storage growth.** Every upload except the small encrypted PDF carries at
  least 3 MB of random bytes, stored byte-for-byte inside the DOCX or appended
  to the file for the rejected cases. (The encrypted PDF case relies on the
  scans below.) Random bytes cannot shrink under TOAST compression, and an encrypted
  copy would be at least as large, so a stored copy of a large upload in any shape grows the sum of
  `pg_column_size` over every table of every non-system schema, and the sum of
  `pg_total_relation_size`, by about the payload. Both must grow by less than a
  quarter of it. This witness is independent of how a copy might be encoded or
  encrypted, which matters because AC4 encrypts transient content and a text
  search alone would miss an encrypted copy.
- **Row-text scan.** No row of any table (UNLOGGED tables and pg-boss included)
  contains a marker present in the raw upload but not in the extracted text, as
  text, hex (how `bytea` prints) or base64 at all three alignments.
  `pg_largeobject_metadata` stays empty.
- **Files.** The service runs with a private `TMPDIR`. After each request that
  directory is unchanged and no file below it holds the marker.
- **Containers.** No extractor container created during the test remains.
- **Response.** The response does not echo the marker.

Cases: a successful upload, then a Check created from its References (the
transaction that stores them) and run to the end against the local DOI fixtures;
a 21 MB upload rejected up front from its `Content-Length` (413); a 22 MB chunked
upload without `Content-Length`, rejected while it streams (413); an unsupported
file rejected at the format check (415); an unreadable PDF and an encrypted PDF
rejected after extraction (422).

A first test gives both scanners positive controls: a table holding the marker
as text, as bytea and as base64, and a file holding it in a nested directory,
must each be found, and the growth witness must trip. Without these the scans
could pass blind.

Test-first evidence: the code already complied, so the new tests were green on
their first run. To show they are not vacuous, throwaway mutations were run and
reverted; none is committed.

- Spooling the bytes to `os.tmpdir()` after the size check failed 5 of the 6
  cases then present, including the 415 case. (The 413 failure in that run was a
  knock-on: `spool.bin` was left in the shared temp directory by an earlier case.
  The 413 request never reached the mutation.)
- Inserting the bytes into a table at the same point failed 4 of 6, including the
  415 case, on the growth and row-scan checks.
- Both mutations sit after the size checks, so neither reaches a 413. A first
  version of the 413 case only exercised the `Content-Length` early rejection,
  and a spool added inside `readUpload` did not fail it. That exposed the gap, and
  the chunked case was added. With the same spool inside `readUpload`, that case
  fails on the temp-file check, and it passes on the unmodified code.

Support changes: `startTestService` now also returns `adminUrl` and `appUrl`
(additive), and `docx()` accepts `stored` parts written without compression.

### Not covered here

AC4's "daily keys excluded from backups" stays at the operator-export level
(`retention.test.ts`); real backup exclusion belongs to #116.

## #93 AC3: the Chromium built-in PDF viewer

AC3 asks that the entry work wherever the browser offers its context menu,
including the built-in PDF viewer. Firefox's viewer is asserted end to end in
`apps/extension/e2e-selection/intake.spec.ts`. The question was whether the same
can be done for Chromium. It cannot, so no Chromium PDF test was added.

### What is and is not automatable

A short spike ran the extension build in the harness's Chromium (Playwright
1.64.1, `Chrome/156.0.8078.4`, headless):

- The PDF opens in the built-in viewer, not as a download, with the extension
  loaded. The viewer appears as a `chrome-extension://…/index.html` frame with
  the document in a nested frame. So the page itself is reachable.
- A right-click on the PDF through the DevTools protocol (`Input.dispatchMouseEvent`
  or `page.mouse.click({ button: "right" })`) creates no new target of any type.
  The context menu of Chromium is native browser UI, not a page, and not a
  protocol target.
- Chromium offers no `contextMenus.onShown` and no protocol command to choose a
  menu entry. The extension's `onClicked` handler can therefore only be reached
  by a real menu click.

Firefox is different: its page context menu is `contentAreaContextMenu`, an
element of the browser chrome that the harness reaches through the remote
protocol with system access. `firefox.selectFromPage` makes a real right-click
and a real click on the entry, which is why the Firefox viewer case is genuine.

Driving the native Chromium menu would need OS accessibility automation on a
headed browser. That is outside the existing Playwright setup and does not fit a
Linux CI runner.

What remains automated for Chromium, unchanged:

- The registration equals `{ id, title, contexts: ["selection"] }` for
  `check-selected-text`, with no `documentUrlPatterns` (`toContainEqual` in
  `intake.spec.ts`; the title is the localized label). This is
  the part that decides whether Chromium may show the entry in the viewer, and
  an added URL pattern or context would fail it.
- The delivered `selectionText` opens the native side panel inside the user
  gesture and fills the input without starting a Check, for ordinary pages,
  frames, cross-origin frames, form fields and editable content.

A synthetic "PDF" variant of that event was deliberately not added. It would feed
the handler a `selectionText` and a PDF `pageUrl`, which the existing cases
already prove the handler ignores. It would not show that Chromium offers the
entry in its viewer or supplies the selection from it, so it would only look like
coverage of the criterion.

### Manual acceptance step

Required for AC3 on Chromium until a driveable menu exists. Record it in the
release issue next to the other manual checklist items of
[ADR-0003](../adr/0003-system-architecture.md), and in the §16 acceptance log with
date and browser version ([ADR-0026](../adr/0026-browser-selection-coverage.md)
already names both built-in PDF viewers as a release case).

1. Load the unpacked Chromium build in the current stable Chrome (repeat in Edge
   or Brave for the panel-opening case, if they are in scope for the release).
2. Open a text PDF in the built-in viewer. Use a file with a line break in the
   selection.
3. Select text, right-click, choose "Check selected text".
4. The side panel opens, and the Reference input holds exactly the selection.
5. No request to `/v2/checks` is made and no Check starts (DevTools network tab of
   the panel).
6. Record the browser version, OS, date and result.

### Status

The Playwright suites are not run by CI (audit finding P-0), so even the existing
Chromium cases are a local check until a job runs them.
