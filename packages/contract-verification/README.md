# @source-taster/contract-verification

Public transport contract of the verification API (`/v1`).

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
