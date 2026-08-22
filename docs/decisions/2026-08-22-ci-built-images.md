# ADR-0015: Build Images in CI, Not on the Production Host

> Status: accepted
> Date: 2026-08-22

## Context

The production deploy built four Docker images **on the production host**, while
production was serving traffic from that same host. Measured on 2026-08-22:

| Property | Value |
|---|---|
| CPU | 2 vCPU (Intel Xeon, Skylake) |
| RAM | 3.7 GiB total — 3.7 GiB used, **48 MiB available** |
| Swap | **0 B** |
| Load average | **85–117** on 2 cores (≈ 42× oversubscribed) |
| Disk | 30 G of 38 G used (84 %) |
| Running containers | **16** |

The container list explains the memory picture. Besides the six Source Taster
services, the host runs a **seven-container observability stack** (grafana,
prometheus, loki, tempo, promtail, otel-collector, cadvisor) and **a second,
unrelated project** (`zwitscher-frontend`, `zwitscher-backend`,
`zwitscher-sqlserver`) — SQL Server alone typically wants 2 GB.

On top of that, each deploy built four images sequentially, each running
`pnpm install` over ~850 packages plus a TypeScript and Vite build. During one
such deploy, a plain `ssh … 'nproc; uptime'` failed to return **twice within 120
seconds**.

Consequences observed: deploys took 18–30 minutes and repeatedly died at
`command_timeout: 30m` (2026-08-21 onward, three consecutive failures).

Two genuine defects were fixed earlier the same day — ADR-0012 (`docker system
prune` was deleting the BuildKit cache) and ADR-0014 (the pnpm cache mount
targeted a path `PNPM_HOME=/pnpm` had moved the store away from). Both were
correct and measurably helped: cached layers went from 12 to 27 and deploy time
from a 30-minute timeout to 18:08. **But they optimized a build that should not
happen on this host at all.**

## Decision

Images are built in GitHub Actions and pulled by the host.

### 1. `publish-images` job

A matrix job over the five buildable services (`api`, `web`, `docs`, `landing`,
`anystyle`) runs after `release`, using `docker/build-push-action@v6` with
`cache-from`/`cache-to: type=gha` scoped per service. The five builds run **in
parallel on five runners** with 4 cores and 16 GB each, instead of sequentially
on 2 cores with 48 MiB free.

Each image is pushed to `ghcr.io/jeffnawroth/source-taster-<service>` with two
tags: the released version (`v2.2.3`) and `latest`. `platforms: linux/amd64`
only — both the runners and the host are x86_64.

The `release` job gains an `outputs.version` so the tag is the version that was
actually released.

**On building from the pre-bump commit:** `publish-images` checks out the commit
that triggered the run, not the version-bump commit. This is safe because no
application reads its own version — every `version` occurrence under `apps/*/src`
belongs to an external API type definition (Crossref, Europe PMC). The image
content is therefore identical; only the `package.json` string differs, and
nothing consumes it.

### 2. `docker-compose.yml` gains `image:` alongside `build:`

```yaml
  api:
    image: ghcr.io/jeffnawroth/source-taster-api:${IMAGE_TAG:-latest}
    build:
      context: .
      dockerfile: apps/api/Dockerfile
```

`build:` is retained so local use keeps working. On the host the image is present
after `pull`, so `up -d` uses it rather than building.

### 3. The deploy pulls instead of building

```sh
export IMAGE_TAG="v<released version>"
docker compose pull api web docs landing anystyle
docker compose up -d --remove-orphans
docker image prune -f
```

`git reset --hard origin/main` stays — the compose file, nginx configs, and
observability configs still come from the repository.

Pinning `IMAGE_TAG` to the released version rather than using `latest` makes the
deploy reproducible and turns rollback into one command:
`IMAGE_TAG=v2.2.1 docker compose up -d`. Today a rollback would mean a full
rebuild on the constrained host. This directly serves CORE §49.

### 4. No registry credentials on the host

The host pulls anonymously. **Correction to this ADR as originally written:** it
stated that new GHCR packages default to private and would need a one-time
visibility change, and that `docker compose pull` would otherwise fail with
`denied`. That did not happen — the first deploy pulled all five images without
any manual step. Packages pushed from a public repository via `GITHUB_TOKEN`
inherit the repository's visibility.

A `docker login ghcr.io` on the host with a read-only PAT was considered and
remains rejected: the token would sit in the SSH script, and the repository and
its source are public anyway.

## Alternatives

- **Add swap.** Rejected as the primary fix: it prevents OOM deaths but a
  thrashing 2-core box is still a 20-minute deploy. Worth doing independently —
  0 B swap on a host running 16 containers is fragile regardless.
- **Resize the server.** Effective but pays recurring cost to keep doing work
  that a free CI runner does better. Also leaves the deploy competing with
  production for resources, just with a higher ceiling.
- **Move `zwitscher-*` and/or the observability stack off the host.** Both are
  sensible and would free real memory, but neither is a repository change and
  neither addresses the build-on-production pattern itself.
- **Keep building on the host and raise `command_timeout`.** Rejected in
  ADR-0012 already; the measurements above are why.

## Consequences

- The host performs no compilation during a deploy. **Measured on the first
  deploy after this change (run 32594913136, release `v2.3.0`):**

  | | Before | After |
  |---|---|---|
  | Deploy duration | 18–30 min, three timeout failures | **1:32** |
  | Load average (1 min) | 85–117 | **1.30** |
  | RAM available | 48 MiB | **1169 MiB** |
  | Images built on host | 4, sequentially | **0** |
  | Image build step | ~25 min on 2 vCPU | **3:07** on five parallel runners |

  Per-image build times, all started at 19:54:00: `anystyle` 1:27, `web` 1:57,
  `landing` 1:56, `docs` 2:10, `api` 3:07 — and this was the *cold* run, before
  any GHA cache existed. Production stayed reachable throughout:
  `sourcetaster.com` 200 in 156 ms, `api/health` 200 in 131 ms.
- **ADR-0012 and ADR-0014 become largely moot for production.** Both fixes stay
  in place and are still correct — they now benefit the CI build — but the host
  no longer builds, so the cache they protect is no longer on the critical path.
  Recording this plainly is preferable to leaving two ADRs that appear to
  describe the current deploy path.
- Measured image sizes on the host: `api` **1.02 GB**, `anystyle` 560 MB, `web`
  55.2 MB, `docs` 53.7 MB, `landing` 48.4 MB. Base layers
  (`node:22-bookworm-slim`, `nginx:1.27-alpine`, `ruby:3.4-slim`) are already
  present and unchanged, so pulls are incremental — **except** for the `api`
  dependency layer, which is rebuilt every release because each release bumps
  the version in all eight `package.json` files and those are `COPY`-ed before
  `pnpm install`. That layer gets a new digest each time and must be transferred
  in full. Splitting the lockfile and manifest copies into separate layers is
  the follow-up that would fix this; it is not attempted here.
- An earlier estimate in conversation put the new deploy at "one to two
  minutes". That estimate was then revised upward to 2–4 minutes on account of
  the 1.02 GB `api` image and decompression on 2 vCPU. The measurement came in
  at **1:32** — the original estimate was right and the revision was
  unnecessarily pessimistic. The incremental pull was smaller than the image
  size suggested.
- **Host disk reclaimed** after the change, on explicit operator approval. The
  build cache no longer serves any purpose there, and the locally-built
  `source-taster-*:latest` images were orphaned once the running containers
  moved to `ghcr.io/jeffnawroth/source-taster-*:v2.3.0` (verified via
  `docker ps` before removal). `docker buildx prune -af` released 8.19 GB and
  removing the five orphaned images released a further ~1.7 GB:

  | | Before | After |
  |---|---|---|
  | Disk used | 31 G of 38 G (**86 %**) | 21 G of 38 G (**58 %**) |
  | Free | 5.2 GB | **16 GB** |
  | Build cache | 10.5 GB | 2.31 GB |
