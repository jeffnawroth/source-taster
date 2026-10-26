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
