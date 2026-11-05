# Correction suggestions and formatted bibliography (#86)

Implements [#86](https://github.com/jeffnawroth/source-taster/issues/86), part of
[#70](https://github.com/jeffnawroth/source-taster/issues/70), against ADR-0011,
ADR-0016 and ADR-0023. Started at `3855cc64906e3f7e47097e906739a94067ce23d7`.

## Boundary and behavior

`POST /v2/checks/{checkId}/bibliography` reads the Owner-authorized snapshot
under the existing `check:read` permission and current-authority guards,
including the response write. Pure rendering holds no Owner lock between the
authorized snapshot read and the re-authorized response write. Responses are `no-store`. The request is a
closed citation-style identifier and optional `applySlots`. A malformed style
or nonexistent slot is rejected; requesting an ineligible suggestion never
makes it eligible. Rendering does not write fields/results, create source
requests or consume Quota. The published schemas, OpenAPI document and typed
client are in the dual-licensed transport package; all rendering policy,
citeproc-js and separately licensed CSL assets stay in the AGPL server.

Only Correct, Exists, with deviations, or DOI conflict with an established
identity can have a suggestion. The renderer selects the identity's Candidate,
not an arbitrary highest Score. It uses that Candidate's proven fields and
retains the Reference's page location only when the existing page comparison
confirms full containment. Article numbers stay distinct from page ranges;
the facade projects them to citeproc's `number` variable. ISO partial dates
become CSL date-parts only inside the rendering adapter. For old Candidates
without a CSL type, known attested provider types are mapped for rendering.

The eleven styles and their three fixed locales are exact upstream snapshots
with SHA-256 checks, attribution and a renderer version. The renderer worker checks asset
integrity on loading; builds copy the assets beside emitted server code. One batch engine renders independent suggestions with numeric labels,
year-suffix/name disambiguation and repeated-author substitution disabled.
The multi-entry bibliography retains style-specific ordering, numbering and
disambiguation. Missing/uncompleted structured data falls back to the immutable
original text rather than a fabricated replacement.

Both clients use the shared detail view for one-click text copy and transient
"Apply for export only" choices. A style change re-renders on the server;
an interface-language change leaves the style and locale alone. Export choices
and Check content stay in memory. Slow obsolete responses cannot overwrite
a newer selection, and export controls wait for its matching render.

The bibliography has an RTF download and rich clipboard copy. Browsers accept
plain text and safe formatting-only HTML; `text/rtf` is additionally included
when the browser advertises support. The RTF download is available regardless
of clipboard MIME support. Clipboard HTML has no links, images or untrusted attributes; only controlled
paragraph and typography styles are retained. It is never inserted into the application DOM. Clipboard failures are
localized; a failed render has an explicit retry action.

## Evidence and qualification

Tests use the API and browser seams pre-agreed in #70: real PostgreSQL and
web/worker processes, recorded Data source responses and explicitly synthetic
protocol witnesses. They cover the eleven styles, eligibility, cited pages,
article numbers, an independently established Source despite a foreign DOI,
invalid requests, Check immutability, one-click copy, rich clipboard data, RTF
downloads, style/locale switching and a native Chromium side panel. Browser
checks include axe in DE/EN.

Rendering runs in one reusable worker thread per web process, with at most
eight queued requests and a 30-second active-job deadline. Saturation/failure
returns a retryable formatting-unavailable response, never a changed Verdict.
There is no server-side Check/render cache. Automatic client requests ask only
for the visible and selected suggestion slots; full bibliographies are rendered
on explicit copy/download. APA paragraph spacing/hanging indents and IEEE
inline labels are retained in both RTF and safe clipboard HTML. The export
section previews the format, localized style name and all selected corrections.

The two review axes identified API event-loop blocking, lost rich paragraph
layout and the missing selected-correction preview; these were corrected and
covered at the existing API/browser seams. Repeated bibliography requests in
tests were consolidated into a public-HTTP helper.

Validation:

- Full `pnpm test`: 275 passed, one failure in the existing maximum-size Check
  cancellation test (276 total). Its isolated rerun passed. No cancellation or
  lifecycle code was changed for that failure.
- Final `corrections.test.ts`: 11 passed, including the review regressions.
- Targeted two-slot export-preview browser case: passed.
- Native Chromium extension suite: 5/5, including DE/EN web/panel parity and axe.
- Workspace type checks, ESLint, Prettier, DE/EN completeness and dependency
  license inventory passed. Server, web, Chromium and Firefox builds passed;
  a compiled-JavaScript worker smoke check passed. Client bundles contain no
  citeproc engine.
- The full offline `audit:dependencies` cannot run without the local OSV npm
  and crates.io database cache. A direct public OSV query for the newly added
  `citeproc@2.4.63` returned no advisories on 2026-10-30. This is not a complete
  workspace advisory scan.
- Full web suites: 55/55 primary cases and 18/18 bibliographic cases passed.

See [the two-axis review and corrections](#review-and-corrections) below.

The quality gate, private Reference test set, native Word/LibreOffice RTF
qualification, Safari and full browser release matrix remain the qualification
work excluded by #70. No quality-gate or release-compliance claim is made.
CSL-JSON/BibTeX export is #87; it can consume the same eligible CSL projection
and transient slot selections. Account-backed Preferences and History retain
their own tickets.

## Parallel implementation

No verification/scoring/search module or lifecycle store is changed. Integration
with #78 is limited to additive contract exports, two message catalogs and
small UI insertions outside its evidence renderer. The provider type fallback
also accepts already structured Candidates from future adapters.

## Review and corrections

The `code-review` skill ran two independent agents against
`git diff 3855cc64906e3f7e47097e906739a94067ce23d7...28ec12a`. This records their
separate findings and the subsequent corrections.

### Standards

1. **Concrete correctness finding: synchronous rendering blocks the API.** Each
   eligible Reference constructed a separate citeproc engine and rendered three
   formats inside the Hono request. The automatic UI request repeated this
   whole-Check operation on each completed slot. The reviewer measured 100
   single-entry APA renders at 28,579 ms during concurrent tests; this was evidence
   of event-loop blocking, not a production capacity measurement. ADR-0003 and
   ADR-0016 require responsive SSE, lease renewal and cancellation.
2. **Judgment call: possible Duplicated Code.** The API tests repeated the
   bibliography POST, headers and schema parsing in several tests.

**Resolution:** One reusable worker thread per web process handles rendering, with
eight queued requests and a 30-second active deadline. It does not retain a Check
cache or hold an Owner authorization lock while computing; snapshot read and
publication remain separately guarded. One batch engine produces independent
suggestion entries with numbering, disambiguation and repeated author substitution
disabled. The client requests only visible/selected suggestions automatically and
renders the full bibliography on explicit export. API coverage renders a
twelve-Reference Check while `/health` remains responsive and checks that
repeated-author substitutions/year suffixes do not leak into independent
suggestions. Public-HTTP test helpers remove repetition.

### Spec

1. **P2: selected-style paragraph layout was lost in rich exports.** #86 asks for a
   bibliography copied as rich text; ADR-0023 requires RTF in the selected style.
   Discarding citeproc layout parameters omitted APA hanging indents and double
   spacing; stripping alignment classes placed IEEE labels on separate blocks.
2. **P2: selected-correction preview was missing.** ADR-0016 says, “Before download
   show format, selected citation style and the selected suggested corrections.”
   Only the currently open Reference showed its selection.

**Resolution:** RTF paragraph controls and safe, generated clipboard HTML now retain
hanging indents, line/entry spacing and inline number labels. Untrusted HTML
attributes, links and images are discarded. API tests check APA indentation and
double spacing and IEEE inline labels. The export section shows RTF, the localized
style name and every selected correction. A two-slot browser case selects both
corrections, checks the complete preview and downloads RTF while original fields and
Verdicts remain unchanged.

Original findings: **Standards 2** (one correctness issue, one judgment call),
**Spec 2** (both P2). All four were addressed. The most significant Standards issue
was API blocking; the most significant Spec issue was rich-export layout. No review
issue remains intentionally deferred.
