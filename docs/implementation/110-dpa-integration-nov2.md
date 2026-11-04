# #110 public integration and publication — 2 November 2026

The public integration branch fast-forwards published integration
`c0cb0baf99302b759440524b9d0deb47751d43a6` to the exact validated staging tip
`2b493f8f7963f2e8081aaf9be0fc07266ec3b946`. This commit adds only this handoff.
The private integration independently fast-forwards
`63952462cb70bc2c8ce17fdcc464d7c17fd564b1` to exact staging tip
`f3bd71dd0f4752d06e2c4e48900ab30f80fa2331`; no source-workspace overrides are
copied. Both original histories and the stream-fence regression fix are retained.

## Publication checks

Run in the public integration root, with durable ignored logs under
`.tmp/spec-70-orchestration/nov2-110-integrated-`:

```sh
pnpm install --frozen-lockfile
pnpm --filter @source-taster/contract-internal build
pnpm --filter @source-taster/contract-service build
pnpm --filter @source-taster/contract-verification build
pnpm --filter @source-taster/i18n generate
pnpm --filter @source-taster/server generate
pnpm pagefind:fetch
pnpm pagefind:build
pnpm pagefind:verify
pnpm typecheck
pnpm lint
pnpm i18n:check
pnpm build
git diff --exit-code -- packages/contract-common/dist packages/contract-internal/dist packages/contract-service/dist packages/contract-verification/dist packages/contract-internal/openapi.json packages/contract-service/openapi.json packages/contract-verification/openapi.json
node apps/server/scripts/release-check.ts
```

Frozen installation, contract/catalog/Prisma generation and the normal controlled
Pagefind fetch/build/verify flow pass. Contract regeneration changes no tracked
artifacts. Aggregate typecheck, lint including whole-tree formatting, DE/EN
completeness and build pass. These are local checks, not GitHub CI evidence.
The clean-tree release guard refuses with exit **78**: no load report,
uncalibrated scoring, no measured configuration and no measurement location.
No gate, receipt or assertion was bypassed. The initial Pagefind verification
refused a stale source-recipe receipt; normal fetching and rebuilding resolved it.
The durable `public-checks.json` records each command's actual exit status.

## Published-pin acceptance handoff

The publication commit containing this handoff is the public transport pin for
all five private locations: three server contract dependencies, the web service
contract dependency and `scripts/evidence.ts`. Publish it on
[public draft PR #139](https://github.com/jeffnawroth/source-taster/pull/139)
before installing it in private integration. The final exact commit, installed
package byte evidence and both-program results are recorded in
`docs/validation-110-integration-nov2.md` on
[private draft PR #9](https://github.com/jeffnawroth/source-taster-service/pull/9).
Staging's local links are not final published-pin evidence.

The integrated acceptance uses only the integration pair, PostgreSQL 18 container
`st110-integrated-nov2-pg` (owner label `nov2-110-integrated-root`, loopback
55711), verification/service ports 5701/5702, private-only port 5703 and the
existing exact document image. Run DPA API/captured-mail/web/native tests,
Account/extension/Quota regressions including the deterministic surviving stream
and actual private dump/restore, selected History and lifecycle checks serially.
The private handoff owns their final results and cleanup receipt; this public
publication does not predeclare those results.

## Preserved limits

Retain [staging evidence](110-dpa-staging-nov2.md), [source limits](110-dpa.md)
and ADR-0021. Legal fixtures are placeholder packets; no legally qualified packet
is activated. Packet retention/expiry, blocked/deleted-account legal retrieval,
contractual return/deletion, actual supplier prerequisites and queued/running/
restore operating procedures still need their owning implementation and human
qualification. Legal records cannot extend verification retention or restore
Check content. The pending authoritative Account Preferences integration and
native Firefox/ESR/Safari/assistive-technology coverage remain open.

The private minimatch advisory **GHSA-g3hv-75wg-m249 / CVE-2026-118764** remains
reported, without exception. The first patched release is 11.0.1; the installed
ESLint/config-array/TypeScript-ESLint selectors require 10.x, and available latest
stable parents still require 10.x. No semver-compatible patched 10.x exists.
A forced major override or a tooling-family migration needs a separate concrete
compatibility decision; neither is smuggled into this transport repin. Exact
Better Auth 1.7.14 and its pre-1.0 transitive Selected release gate remain intact.

No full product suite, dependency qualification, source activation, legal,
calibration, security, load, deployment or release acceptance is claimed.
The historical full public run stays 676 passed / 1 failed; later focused
success does not rewrite it. Issues remain open, PRs remain drafts, no nested
agents or predecessor inspection occurs, and the user-enabled five-hour retry
job is untouched. Only the public root and private integration are owned here;
source workspaces and other tasks' ports/resources are untouched.
