# Correction suggestions and formatted bibliography (#86)

Implements [#86](https://github.com/jeffnawroth/source-taster/issues/86), part of
[#70](https://github.com/jeffnawroth/source-taster/issues/70), against ADR-0011,
ADR-0016 and ADR-0023. Started at `3855cc64906e3f7e47097e906739a94067ce23d7`.

## Boundary and behavior

`POST /v2/checks/{checkId}/bibliography` reads the Owner-authorized snapshot
under the existing `check:read` permission and current-authority guards,
including the response write. Responses are `no-store`. The request is a
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
with SHA-256 checks, attribution and a renderer version. Startup checks asset
integrity; builds copy the assets beside emitted server code. A fresh one-item
engine renders standalone suggestions without numeric labels or year suffixes.
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
of clipboard MIME support. Clipboard HTML has no links, images or attributes
and is never inserted into the application DOM. Clipboard failures are
localized; a failed render has an explicit retry action.

## Evidence and qualification

Tests use the API and browser seams pre-agreed in #70: real PostgreSQL and
web/worker processes, recorded Data source responses and explicitly synthetic
protocol witnesses. They cover the eleven styles, eligibility, cited pages,
article numbers, an independently established Source despite a foreign DOI,
invalid requests, Check immutability, one-click copy, rich clipboard data, RTF
downloads, style/locale switching and a native Chromium side panel. Browser
checks include axe in DE/EN.

Exact command results are recorded after the final checks below.

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
