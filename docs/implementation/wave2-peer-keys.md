# Wave 2 peer-key canonicalization

The second Standards review confirmed fairness, numeric `/v1` SSE compatibility,
DE/EN evidence messages and the extracted attempt fence. It found one remaining
P2 in key separation: Ed25519 JWK coordinates with different unused base64url bits
can identify the same public key. Comparing their encoded strings alone can admit
an own signing key as a peer key.

Both independently owned program adapters now require canonical, 32-byte
base64url coordinates before comparing peer keys with their own public identities.
Each adapter uses the same local validation on initial configuration and every
trust-file reload. Empty trust sets and duplicate key IDs are rejected too.
Private implementation remains in its own repository. No cryptographic helper or
implementation is shared through the transport packages.

## Boundary evidence

Three actual both-program HTTP/configuration cases cover verification's own
internal key, the service access key and the service internal key. Each first
accepts a correctly signed request from the legitimate distinct peer. It then
installs the receiver's own key under a peer ID with equivalent noncanonical JWK
encoding and sends a correctly signed program assertion using that key.

- **Red:** all three receivers incorrectly returned 200 after trust-file reload.
- **Green:** all three return 401, and restarting with the same invalid trust file
  refuses startup. These are actual signature/HTTP/process observations, not
  assertions on the cryptographic adapter's internal functions.
- The private process suite additionally checks alias refusal in source and
  compiled execution alongside the existing equivalent-PEM refusal.

The focused three-case rerun and all 28 authority cases pass. Private source and
compiled suites each pass 15 cases, including the new alias refusal. Public server
build/typecheck and changed-file lint/format pass; private root build, typecheck
and lint/format pass.
Tests use ephemeral keys, disposable per-run databases/roles and real program
processes, with only external HTTP/transport fixtures. No verification content,
keys or tokens are printed, and no application-table/queue-state/internal-call
assertions were added.

```sh
SOURCE_TASTER_SERVICE_WORKTREE=/Users/jeffnawroth/Developer/Repositories/source-taster-service pnpm --filter @source-taster/server test:authority
```

Private commands are `pnpm test` and `SERVICE_TEST_COMPILED=1 pnpm test` after
`pnpm build`. Transcripts are parent-owned `/tmp/st-wave2-peer-*.log`. The root
private checkout was prepared with a frozen install and Prisma generation before
these runs. Neither contracts nor private implementation were copied into public
transport artifacts.

Contracts, all three full-SHA MIT dependency pins
(`bfd3edeb79866e26f7e6057712322031bc692fbc`) and dependency graphs are unchanged.
Prior dated advisory/license evidence remains applicable to that unchanged graph;
no fresh scan or legal approval is claimed. The retry-evidence correction and
its `doi-crossref-public-tracer-3-uncalibrated` version remain in place.

This is a narrow review correction. Source-only development composition,
measured-release refusal, legal/publication gates and the outstanding native
extension, calibration, Quota, abuse and human qualification work are unchanged.
Fresh independent review and exact-head CI are still required.
