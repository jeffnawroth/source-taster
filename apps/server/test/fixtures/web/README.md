# Web adapter protocol fixtures (#80)

These files and the other responses authored in `web-pages.test.ts` and the
browser harness are **synthetic**, under this repository's AGPL-3.0-or-later
license. They are not recordings, sanitized provider payloads, the Development
set or the Reference test set. The timestamp and page are invented.

- `synthetic-page.html`: matching HTML title, for live and archived-page retrieval.
- `synthetic-available.json`: availability response naming the cited original
  URL. Availability alone is never identity: the adapter must retrieve the
  capture and verify its original URL, timestamp and title.

Tests replay HTTP at the external adapter edge, against real PostgreSQL and
web/worker processes. They do not contact a live website or Internet Archive.
The explicit loopback fixture replacement is available only in the uncalibrated
bibliographic development preview, and only replaces `example.com`,
`archive.org` and `web.archive.org`. Redirect destinations still undergo safety
validation. Production cannot use this replacement.

## Recorded fixtures required before source activation

On 31 October 2026 the client accepted synthetic tests for #80 implementation
and required approved recordings before source activation. The activation
prerequisite remains **unfulfilled**: no rights-cleared private recordings or
dataset checkout were supplied. ADR-0006 requires recordings to remain private; ADR-0007
requires source-specific fixture-storage rights. No Internet Archive service,
archive-content storage or redistribution clearance is asserted. Archive
availability does not grant rights to the archived page.

Read-only acquisition probes on 2026-10-30 could retrieve Example Domain, the
Internet Archive availability endpoint and a capture. Network access was not the
blocker. The transient bodies were not adopted as fixtures or committed. A
recording suitable for this ticket needs an approved storage basis for both the
original page and archived content, plus an availability response and capture
whose original URL and title can be verified together, retained in the private
ADR-0006 dataset with provenance. No provider was contacted for approval.

The approved implementation/activation split is recorded in #80.
[Issue #140](https://github.com/jeffnawroth/source-taster/issues/140) tracks the
required approved recordings and successful private replay, and natively blocks
#114. Synthetic regression evidence does not satisfy that prerequisite. Existing
production activation and Quality gates remain closed.
