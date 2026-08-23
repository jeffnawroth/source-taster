# ADR-0019: Ship from the Release Commit — Adopt release-please

> Status: accepted
> Date: 2026-08-23

## Context

On 2026-08-23 three surfaces reported three different versions:

| Surface | Version |
|---|---|
| GitHub repository and tags | 3.0.0 |
| docs.sourcetaster.com | 2.3.2 |
| Chrome Web Store | 2.1.34 |

These are three independent defects. All three were concealed by the same
structure: the version bump, the artifact build and the publishing steps were
decoupled, and every publishing failure was swallowed by `continue-on-error`.

### Defect 1 — every deployment shipped the pre-bump tree

The `release` job bumped versions inside its own runner workspace and pushed
them to a release PR. `publish-images` then checked out `github.sha` again — the
feature merge commit, i.e. the state *before* the bump — built the images from
it and tagged the result with the *new* version.

Measured: the `v3.0.0` docs image was built from commit `2b90046e`, where
`package.json` reads `"version": "2.3.2"`.

When the release PR was subsequently squash-merged, the job guard
`!startsWith(github.event.head_commit.message, 'chore(release):')` skipped the
`release` job, and through `needs:` also `publish-images` and `deploy`. The
bumped tree was therefore never built at all. Every deployment surface was
permanently exactly one release behind.

**This corrects a claim in ADR-0015.** That ADR considered building from the
pre-bump commit and declared it safe:

> no application reads its own version — every `version` occurrence under
> `apps/*/src` belongs to an external API type definition (Crossref, Europe PMC).

The search space was wrong. `apps/docs/.vitepress/config.mts:4` sits outside
`src/`, imports `apps/extension/package.json`, and renders `v${pkg.version}` in
the navigation (lines 137 EN, 158 DE). It is baked into the static output at
build time. Verified against production: `curl https://docs.sourcetaster.com/`
returned `v2.3.2` while `v3.0.0` was the released version.

### Defect 2 — Chrome Web Store uploads failed silently for ten days

Both Chrome steps carried `continue-on-error: true`, so GitHub reported the job
— and the whole run — as successful while the log read:

```
Uploading extension.zip
❌ Invalid grant: The authentication keys are probably invalid or expired
```

Timeline: `CHROME_REFRESH_TOKEN` was set 2026-08-10, the last successful upload
was `v2.1.34` on 2026-08-13, the first failure was `v2.1.35` on 2026-08-20 —
exactly seven days.

Cause, established from Google's OAuth2 documentation via upstream issue
`fregante/chrome-webstore-upload#48`: a Google Cloud OAuth client with an
*External* user type and a publishing status of *Testing* is issued a refresh
token that expires after seven days. Regenerating the token alone therefore buys
another seven days and nothing more.

### Defect 3 — Firefox publishing never worked

`AMO_JWT_ISSUER` and `AMO_JWT_SECRET` do not exist as repository secrets.
The step logged both env vars as empty and failed with
`Unknown JWT iss (issuer)`, likewise hidden by `continue-on-error: true`.

### Why the version number ran ahead

39 patch releases in `2.1.x`, then `2.2.0 → 3.0.0` within about four hours on
2026-08-22, as a consequence of ADR-0012 and ADR-0013 repairing the bump
selector and the commit range. Not a defect any more, but it widened the gap to
the frozen store listing considerably.

## Decision

### 1. Ship from the release commit, using release-please

`googleapis/release-please-action` v5.0.0 (SHA-pinned per ADR-0016) replaces the
hand-rolled bump detection, range computation, changelog generation, release-PR
creation and tag force-push.

The action runs on every push to `main` and does one of two things: it opens or
updates the release PR, or — when the push *is* the merged release PR — it
creates the tag and the GitHub release and sets `release_created=true`. Every
shipping job gates on that output and runs in the same workflow run, so
`actions/checkout` without a `ref:` lands on the release commit by construction.

This also resolves the limitation ADR-0013 recorded rather than fixed: tags are
now created on `main` after the merge, so `git describe` and
`git log <tag>..main` become meaningful again.

### 2. Job topology

```
quality ──▶ release-please ──┬──▶ publish-extension   (Chrome, Firefox, GH assets)
                             └──▶ publish-images ──▶ deploy ──▶ verify-release
```

`deploy` depends on `publish-images`, deliberately **not** on
`publish-extension`. A store rejection therefore fails the run visibly without
blocking the deployment — which is why no step needs `continue-on-error`.
All such flags are removed.

### 3. One version for all eight packages

`release-please-config.json` declares a single root component with
`release-type: node` plus `extra-files` JSON updaters for the other seven
`package.json` files. This reproduces `bumpp --recursive` semantics exactly: one
tag, one CHANGELOG, eight identical versions.

Manifest mode with eight components was rejected: nothing is released
independently and nothing is published to npm, so per-package changelogs and
component-prefixed tags would add cost without a consumer.

`bootstrap-sha` is pinned to `0afab560` (the current `main` HEAD). Without it,
release-please would re-collect the entire history, because the pre-existing
tags are not reachable from `main` — the same defect that produced the
`v2.1.2...v3.0.0` compare link in the current CHANGELOG. The value is ignored
once the first release PR is merged and can then be removed.

### 4. The release PR is not auto-merged

`gh pr merge --auto` is removed. Merging the release PR is a human action, which
is the release gate AGENTS.md already requires ("release is human-only") and
which the previous full automation contradicted. Side effect: commits are
batched into meaningful releases instead of one store submission per `fix:`.

### 5. `verify-release` guards the regression

A final job asserts that docs.sourcetaster.com actually serves the released
version, retrying for up to 2.5 minutes. The defect that motivated this ADR
would have been caught on its first occurrence.

## Alternatives

- **Surgically repair the existing workflow** (invert the guard into
  `prepare-release` / `ship`). Rejected: it fixes the topology but leaves the
  bump detection, range computation and changelog generation in local
  maintenance. ADR-0012 and ADR-0013 are both bug fixes in exactly that code —
  strong evidence it should not be self-maintained.
- **Changesets.** Rejected: the repository already uses Conventional Commits and
  publishes nothing to npm. Changesets would introduce manually written
  changeset files without addressing any of the three defects.
- **semantic-release.** Rejected: it releases on every qualifying merge with no
  human gate, which conflicts with the AGENTS.md release gate, and its monorepo
  version synchronization needs additional plugins to match current behaviour.
- **Keep `continue-on-error` and add a verification job that inspects step
  outcomes.** Rejected as unnecessary once `deploy` no longer depends on
  `publish-extension`: the failure can simply be a failure.
- **Only regenerate the Chrome refresh token.** Rejected: it treats the symptom.
  Under *Testing* publishing status the replacement expires after seven days and
  the outage recurs.
- **Re-point the dangling tags `v2.1.3`–`v3.0.0` at `main`.** Rejected,
  consistent with ADR-0013: force-pushing published tags breaks existing clones.
  From the first release-please release onward the problem does not recur.

## Consequences

- Deployed surfaces report the released version. The off-by-one is structural
  and cannot recur without `verify-release` failing.
- Tags become reachable from `main`; changelog compare links become correct for
  new entries. The existing 482 KB `CHANGELOG.md` keeps its historical, partly
  wrong compare links — history is not rewritten.
- Releases now require a human to merge the release PR. Nothing ships
  unattended. Release cadence drops and batch size grows.
- A failed store upload turns the run red. This is a visible behaviour change:
  runs that previously reported success while shipping nothing will now fail.
- `bumpp`, `conventional-changelog-cli` and
  `conventional-changelog-conventionalcommits` are removed from the root
  devDependencies, along with the unused `"release": "bumpp"` script in
  `apps/extension/package.json`. A `pnpm install` is required to update the
  lockfile.
- Two credential steps remain outside the repository and gate the first green
  release: the Chrome OAuth consent screen must be set to *In production* (or
  the audience to *Internal*) **before** a new refresh token is generated, and
  the AMO API keys must be created and stored as `AMO_JWT_ISSUER` /
  `AMO_JWT_SECRET`.
- `.github/workflows/debug-chrome-status.yml` is retained as a
  `workflow_dispatch` preflight for verifying Chrome credentials before a
  release.
