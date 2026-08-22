# ADR-0012: Release Pipeline Correctness — Version Bump Semantics and Deploy Build Cache

> Status: accepted
> Date: 2026-08-22

## Context

Two defects in `.github/workflows/release.yml` surfaced while verifying the
AI-OS v1.0 hardening (ADR-0010). Neither was caused by that work; both predate
it and both were confirmed with evidence rather than inferred.

### Minor version bumps were structurally impossible

The bump selector reads:

```sh
elif git log "$LAST_TAG..HEAD" --oneline | grep -q "^feat"; then
```

`git log --oneline` prints `<abbrev-sha> <subject>`, so a line never begins with
`feat`. The anchored pattern could not match under any input. Measured against
real history: 14 commits between `v2.1.34` and `v2.1.39` have a `feat:` or
`feat(scope):` subject; the expression as written detects **0**. Every release
since the workflow was introduced was therefore a patch bump regardless of
content, which is why the version reads `2.1.39` rather than roughly `2.4.x`.

The major-version branch above it uses `--format="%B"` and is unaffected.

### The deploy destroyed the build cache it depends on

Every `apps/*/Dockerfile` installs dependencies through a BuildKit cache mount:

```dockerfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install ...
```

The deploy script ran `docker system prune -f` immediately before building.
Docker's documentation states that `docker system prune` removes, by default,
"all stopped containers", "all networks not used by at least one container",
"all dangling images", and "**unused build cache**" — the last of which includes
the cache mount above. Each deploy therefore cold-installed the full dependency
set four times over (landing, docs, api, web).

Evidence from the failing deploy log: `resolved 851, reused 0, downloaded 761`.
`reused 0` is direct proof the pnpm store was empty at build time.

Timing evidence:

| Date | Result | Duration |
|---|---|---|
| 2026-08-20 09:50 | success | 17 min |
| 2026-08-21 11:24 | failure | 30 min (`Run Command Timeout`) |
| 2026-08-22 14:30 | failure | 30 min |
| 2026-08-22 14:37 | failure | 30 min |

No dependency change exists in the window between the last success and the
first timeout — only a version bump and one added `package.json` script. The
17-minute success already consumed 57% of `command_timeout: 30m` with no
margin; ordinary host-side variance was enough to cross the line.

## Decision

### 1. Detect minor bumps from the commit subject

```diff
-elif git log "$LAST_TAG..HEAD" --oneline | grep -q "^feat"; then
+elif git log "$LAST_TAG..HEAD" --format="%s" | grep -qE "^feat(\(.+\))?:"; then
```

`--format="%s"` prints the subject alone, and the pattern requires the
Conventional Commits `feat:` / `feat(scope):` form rather than any word starting
with `feat`.

**Consequence, stated plainly:** releases containing a `feat:` commit now bump
the minor version. This is the documented intent of the existing code, not a new
policy — but it is a visible change in published version numbers for the browser
extension, and it takes effect on the first release that contains a feature
commit. Reverting is a one-line change if patch-only versioning is preferred.

### 2. Free disk space without discarding the build cache

```diff
-docker system prune -f
+docker container prune -f
+docker image prune -f
```

Both replacements reclaim the same categories the original was there for —
stopped containers and dangling images — while leaving the BuildKit cache
intact, so the Dockerfiles' cache mounts do what they were written to do.

`command_timeout: 30m` is deliberately **left unchanged**. Raising it would
treat the symptom; if 30 minutes is still insufficient once the cache is warm,
that is new information worth having rather than hiding.

## Alternatives

- **Raise `command_timeout` to 60m.** Rejected as symptom treatment: a
  30–60 minute production deploy remains a real problem, and the next
  dependency increase would breach it again.
- **`docker system prune -f --filter "until=24h"`.** Rejected: the filter
  applies to age, not to cache type, so a cache older than the window is still
  removed. It narrows the problem without fixing it.
- **`docker builder prune --keep-storage`.** Rejected as unnecessary: nothing
  indicates the build cache itself is what fills the disk. Container and image
  pruning address the stated purpose ("free disk space before build") directly.
- **Leave the bump selector alone and document it as patch-only versioning.**
  Rejected: the code's evident intent is semver-aware bumping, and a branch that
  cannot execute is a defect, not a policy. Recording it as intentional would
  make the documentation false.
- **Fix both defects in separate changes.** Rejected: both are one-line
  corrections in the same file with the same verification path (one release
  run), and splitting them would require two production deploys to validate.

## Consequences

- Deploys reuse the pnpm store across builds, so the four image builds no longer
  each download 761 packages. The expectation is a return to well under the
  17-minute baseline; the first run after this change is the measurement.
- Version numbers become semver-accurate going forward. Historical versions are
  not restated.
- `release.yml` remains human-authorized-only under `AGENTS.md`. Both changes
  were made under explicit human approval, and neither alters the deployment
  target, credentials, or the set of services deployed.
- The first release after this ADR is `v2.1.40` (a patch — the commits since
  `v2.1.39` are `fix:` and `docs:`), which validates the deploy fix without
  simultaneously exercising the new minor-bump path.
