# ADR-0014: The pnpm Store Cache Mount Never Worked — Wrong Target Path

> Status: accepted
> Date: 2026-08-22

## Context

ADR-0012 attributed the production deploy timeouts to `docker system prune -f`
destroying the BuildKit cache before every build, and replaced it with
`docker container prune` + `docker image prune`. That change was correct and
measurably helped: cached layers in the deploy went from 12 to 27 and deploy
duration went from a 30-minute timeout to 18:08 across two consecutive
successful runs.

But it did not do what it was supposed to do. The pnpm progress lines still
read `reused 0 … downloaded 883` on every build. The improvement came from
Docker's *layer* cache, not from the pnpm store cache mount ADR-0012 was
written to protect.

Server inspection (`docker buildx du --verbose`) showed why:

```
Description:  cached mount /root/.local/share/pnpm/store from exec
              /bin/sh -c pnpm install --no-frozen-lockfile with id "/pnpm"
Size:         0B
Usage count:  20
Type:         exec.cachemount
```

The mount exists and has been used 20 times, and it is **empty**. All four
`apps/*/Dockerfile` declare:

```dockerfile
ENV PNPM_HOME="/pnpm"
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install ...
```

`PNPM_HOME` relocates the store. Verified inside the real base image:

| Environment | `pnpm store path` |
|---|---|
| no `PNPM_HOME` | `/root/.local/share/pnpm/store/v11` |
| `PNPM_HOME=/pnpm` (what the Dockerfiles set) | **`/pnpm/store/v11`** |

The cache mount therefore targets a directory pnpm never writes to. This has
been true since the cache mounts were introduced — it is independent of
`docker system prune`, and ADR-0012's diagnosis was incomplete rather than
wrong.

## Decision

Point the mount at the path pnpm actually uses, in all four Dockerfiles
(`api`, `web`, `docs`, `landing`):

```diff
-RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --no-frozen-lockfile
+RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile
```

This is the pattern pnpm's own Docker documentation uses: set `PNPM_HOME`, then
mount `$PNPM_HOME/store`.

### Verified before adoption, not predicted

A minimal Dockerfile reproducing the exact `PNPM_HOME` / mount arrangement was
built three times on the production host:

| Run | store size before | result |
|---|---|---|
| 1 | 4.0K (empty) | `reused 0, downloaded 1` |
| 2 | 6.0M | **`reused 1, downloaded 0`** |
| 3 | 6.0M | **`reused 1, downloaded 0`** |

The store persists across builds and is reused. Test images and their build
cache were removed from the host afterwards.

An earlier two-run version of this test showed `reused 0` twice and appeared to
disprove the fix. That test was faulty — it passed `--no-cache` on both runs and
read the wrong progress line. It is recorded here because it nearly produced a
second incorrect conclusion, and because "the experiment disagreed" is only
meaningful once the experiment itself has been checked.

## Alternatives

- **Drop `ENV PNPM_HOME="/pnpm"` and keep the existing mount target.** Rejected:
  `PNPM_HOME` is also on `PATH` and is how corepack-installed binaries are
  found. Removing it to satisfy a mount path inverts cause and effect.
- **Set `store-dir` in an `.npmrc`.** Rejected: a second place where the store
  location is defined, which is what produced this defect in the first place.
  One source of truth (`PNPM_HOME`) with the mount following it is simpler.
- **Leave it and rely on the layer cache.** Rejected: the layer cache is
  invalidated on every release anyway, because each release bumps the version in
  all eight `package.json` files and those are `COPY`-ed before `pnpm install`.
  The store cache is the part that survives that invalidation.

## Consequences

- The first deploy after this change populates the store; the deploy after that
  is the one that should show `reused` in the hundreds and `downloaded` near
  zero. **This is a measurement to take, not a result to assume** — ADR-0012
  predicted an outcome without checking, and this record does not repeat that.
- The `COPY … package.json` layer is still invalidated on every release by the
  version bump, so `pnpm install` will keep re-running. The store cache makes
  that re-run cheap rather than preventing it. Splitting the lockfile and
  manifest copies into separate layers would address the invalidation itself and
  is a reasonable follow-up, not attempted here.
- **Reported, not acted on:** the production host is at 84% disk (5.8 GB free)
  with 11.61 GB of build cache, 9.3 GB of it reclaimable. Nothing was pruned —
  the reclaimable cache includes the layers that took the deploy from 30 minutes
  to 18. This is the operator's call.
