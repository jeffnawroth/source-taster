# @source-taster/contract-verification

Public transport contracts of the verification API (`/v1` and `/v2`).

| Subpath    | Contents                                                       |
| ---------- | -------------------------------------------------------------- |
| `.`        | Zod schemas and types of requests, responses and Check events  |
| `./routes` | OpenAPI route definitions (`@hono/zod-openapi`); pulls in Hono |
| `./client` | Fetch-based client for the Check event stream with resume      |

The event stream sends every Check event as one SSE frame: `id` is the event's
sequence number, `event` its type and `data` the event as JSON. Reconnect with
`Last-Event-ID` to receive only the events after that sequence. The server
closes the stream after the event that ends the Check.

## License

`AGPL-3.0-or-later OR MIT`, at your option (see `LICENSE-AGPL` and
`LICENSE-MIT`). This package must never import code from an AGPL-only
workspace package.

## Consume from another repository

Use pnpm's git-subdirectory dependency and pin the **full reviewed commit SHA**:

```json
{
  "dependencies": {
    "@source-taster/contract-verification": "github:jeffnawroth/source-taster#<full-reviewed-sha>&path:/packages/contract-verification"
  }
}
```

There is no registry publishing or service-side vendored copy. The package ships
committed JavaScript and declarations in `dist`, plus `openapi.json`. It has no
workspace-protocol dependencies: the build includes the dual-licensed common
transport module from its one shared source. The package never includes AGPL-only
server, UI or domain implementation. `./openapi.json` exports the document.

After editing schemas or the client, run the contract build and commit the updated
artifacts. CI rejects stale committed artifacts. The service may select MIT for
this transport package; that choice does not license the implementation under MIT.

## Structuring preview

`POST /v1/structurings` accepts `StructureRequest` and returns `StructuringResponse`
without creating a Check. It is stateless: repeated requests do not reserve or
consume Quota and do not need an idempotency key. It requires `structuring:create`.
Each Reference includes original text, CSL fields, `fieldSources` indexed by CSL
field path, and parser path/version. Every source span is a half-open UTF-16 range
in the exact submitted text; use `text.slice(start, end)`. Scalar CSL values and
name components are as written. `issued.literal` preserves the supplied date
(including a suffix, partial date or no-date marker); no date or source type is
inferred. Normalized identifiers, when available, accompany their raw evidence.

Rejected text has no Reference slot. `guidance: "no-references"` asks clients to
show input hints. `quotaConsumed` is always zero. The configured `referenceLimit`
is initially 1,000 and counts recognized References after Structuring. Exceeding
it returns HTTP 400 Problem Details (`reference-limit`, `problem_reference_limit`,
`limit`), never a truncated success. The existing Check and SSE contracts remain
unchanged; later Check execution must explicitly adopt the canonical fields.

`verificationClient({ baseUrl?, client?, fetch? })` from `./client` provides
`createCheck(text)` and `structureReferences(text)`. Both validate success envelopes
and throw `ApiError` for HTTP failures, with the status and an optional validated
Problem. Non-JSON error bodies never leak into user-facing copy. Network errors
remain distinguishable from HTTP Problems. Check creation enforces the configured
Reference limit before storing or enqueueing; it uses the same parser or accepts explicit structured References.

## Version 2 bibliographic-search contract

New clients use `./v2` schemas, `./client-v2` and `./routes-v2`, with
`./openapi-v2.json`. The web app and later extension share this same intended
contract. Structuring remains the compatible `/v1/structurings` operation.

`/v2/checks` and its snapshot, events, cancel and lease routes reuse the existing
Owner/current-authority, lifecycle and cursor protocol. Version 2 adds OpenAlex,
Europe PMC, Semantic Scholar, arXiv, Open Library and Google Books, supported
identifier provenance, per-source slots, query evidence, additional reasons and
up to 25 scored Candidates (at most five per source, for the five article
sources). Supplied PMID, PMCID, arXiv and ISBN proof uses
`identity.kind: supplied-identifier`, separately from DOI proof and independent
bibliography. Similarity alone is never identity proof.

Book routes expose `isbn` origin/operation, catalog progress, optional
`identityAmbiguous` and `identifierAmbiguity` evidence, and the
`sources-unavailable` reason. Optional field `agreement` explains normalized
unweighted ISBN/edition deviations without changing weighted Scores. Fields,
source observations and immutable results retain their raw evidence.

Version 1 schemas and routes keep their Crossref literal, five-Candidate result
cap and existing reason/progress enums. Creating through `/v1` keeps the prior
DOI-tracer execution even when bibliographic development search is enabled.
Checks persist their creation major (existing rows default to 1). `/v2` can read
legacy snapshots/results/events unchanged; `/v1` returns 404 for Version 2 Checks,
including streams and mutations, so a frozen client never receives an incompatible
result. Old immutable results retain their own versions and evidence.

Both majors accept legacy numeric replay cursors and emit numeric SSE IDs for
those requests. Check-bound cursors opt into `{checkId}:{seq}` IDs; clients check
identity, sequence continuity and duplicates. The shared transport implementation
handles credentials, errors, lease calls and reconnects for both schema versions.
No scoring, authority policy, adapter, secret or AGPL implementation enters this
package. Production/hosted activation remains subject to the separate measured
configuration gate; these transport additions grant no activation permission.

## Citation downloads (Version 2)

`POST /v2/checks/{checkId}/export` accepts `ExportRequest` from `./export`.
Choose `format: "csl-json" | "bibtex"` and `mode: "original" | "selected-corrections"`.
Original mode exports current committed fields, including saved user edits; it
requires an empty `corrections` array (the default). Selected-corrections mode
accepts `{ slot, resultToken }` choices obtained from the authorized bibliography
preview. Tokens bind the immutable result as well as its evidence. Unknown,
ineligible, duplicate or stale choices return 400; they never silently select a
different result. A Re-check requires a new explicit selection.

The response is a UTF-8 attachment with `Cache-Control: no-store` and current
`check:read` authority checked through publication. Missing/foreign Checks return 404. CSL-JSON uses `application/vnd.citationstyles.csl+json`, standard date-parts
for ISO dates and `custom.originalText` for immutable provenance. BibTeX uses
`application/x-bibtex`, traditional entry/field names, unchanged imported citation
keys and UTF-8 with TeX-special-character escaping. Unsupported imported fields
remain in the original record, never in regenerated BibTeX fields.

`exportClient(options)` from `./export-client` forwards current credentials and
client identity and returns a Blob and filename. It accepts an AbortSignal and
throws the same validated ApiError as the other clients. No export is cached on
the server or in browser storage. Style selection affects rendered suggestions;
these machine-readable formats retain bibliographic fields. The server-owned
export port can accept a RIS adapter later; RIS has no launch route or control.
