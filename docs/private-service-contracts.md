# Private service skeleton contracts (#95)

Only transport schemas, OpenAPI routes and their built JS/declarations live here.
`contract-service` exposes infrastructure status without granting identity, permissions
or Quota. `contract-internal` describes an explicitly enabled, loopback-only SMTP
rehearsal. The diagnostic accepts only DE/EN and an idempotency key: never recipients,
mail bodies or verification content. It is unavailable by default. Its receipt is
not an Account, sign-in challenge or entitlement.

The independently implemented proprietary program lives in the private repository
`jeffnawroth/source-taster-service`. No server, worker, UI, persistence, mail template
or catalog implementation belongs in this open checkout. Authentication and signed
internal entitlement/Quota endpoints remain for their subsequent tickets.

## Distribution

Consumers choose MIT under ADR-0001's narrow exception. Install each contract using
`github:jeffnawroth/source-taster#<full-commit-sha>&path:packages/contract-service`
(and `contract-internal` / `contract-verification` respectively). No registry, local
path, workspace sharing or vendored transport copy is used. Packages export only
committed built JS/declarations and OpenAPI. As in contract-verification, the build
includes the dual-licensed common transport conventions through relative imports;
no implementation code is included. The SHA is recorded by the private lockfile.

Build and check these artifacts before pushing the contract branch. The private
service can consume that reviewed commit before the parent merges integration.
Legal qualification of the overall boundary remains a human gate (FA-UEB-23).

## Guest authority (#96)

The transport additions describe five-minute Guest issuance, public Ed25519 JWKS,
current Guest binding/permission decisions, and signed versioned Owner invalidation
with a drained acknowledgement. Implementations and cryptographic policy remain
owned independently by each program. Access tokens never authenticate internal
calls. Internal assertions bind the method, path and exact body digest to a short
expiry and a separately purposed audience. No verification content crosses these
contracts. The `not-implemented` Quota slot explicitly records that authentication
supplies no Guest allowance; #99 owns the journal. `null` remains standalone/no
Quota, not hosted authorization evidence.

The service client is transport only. The verification client accepts a credential
supplier for each request and SSE reconnect; identity storage and renewal policy
remain outside the narrow license exception. The implementation handoff records
the exact reachable public contract SHA consumed by the private lockfile.
