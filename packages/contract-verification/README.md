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
