# DX Foundation — Phase 2: Standardisiertes Build-System

## Motivation

Phase 1 (CI/CD) hat den Automatisierungsrahmen geschaffen. Phase 2 standardisiert die Art, wie Source Taster gebaut und ausgeliefert wird — lokal, in CI, und auf dem Server. Jede App bekommt ein konsistentes Dockerfile nach demselben Pattern, docker-compose wird erweitert, und die Build-Kommandos werden in root Scripts abgebildet.

## Umfang

### 1. Konsistente Dockerfiles

Alle Apps folgen diesem Pattern:

```dockerfile
# syntax=docker/dockerfile:1.6
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# NUR die package.json der benötigten Workspaces
COPY apps/<app>/package.json apps/<app>/package.json
COPY packages/<dependency>/package.json packages/<dependency>/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @source-taster/<app> build

# Runtime-Stage – app-spezifisch
```

**Pro App:**

- **`apps/landing/Dockerfile`** (neu) — multi-stage build → nginx:1.27-alpine, port 80. Landing ist statisch (Astro build), daher nginx wie docs. Benötigt nur `apps/landing/package.json` (keine Workspace-Dependencies in production).

- **`apps/docs/Dockerfile`** (refactored) — gleiches Pattern. Entfernt die überflüssigen `apps/extension/`, `apps/api/`, `packages/*/package.json` Kopien. Benötigt nur `apps/docs/package.json`.

- **`apps/api/Dockerfile`** (refactored) — kopiert nur `apps/api/package.json` + `packages/types/package.json` statt aller Workspaces.

### 2. docker-compose.yml

- **landing** Service ergänzen:
  ```yaml
  landing:
    build:
      context: .
      dockerfile: apps/landing/Dockerfile
    ports:
      - '8081:80'
    restart: unless-stopped
  ```

- **Healthchecks** für alle selbstgebauten Services:
  - **api** (Node/Hono): `curl -f http://localhost:8000/health`
  - **anystyle** (Ruby/Sinatra): `curl -f http://localhost:4567/` (root existiert)
  - **docs** (nginx, statisch): `curl -f http://localhost:80/` (root existiert)
  - **landing** (nginx, statisch): `curl -f http://localhost:80/`
  - Pattern:
    ```yaml
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:<port>/<path>"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    ```

- **Grafana SMTP** — Platzhalter-Werte durch echte Umgebungsvariablen ersetzen: `GF_SMTP_HOST`, `GF_SMTP_USER`, `GF_SMTP_PASSWORD` via environment (Standardwerte in `apps/api/.env.example` dokumentieren).

### 3. Root Build Scripts

Convenience Scripts in `package.json` (root):

```json
"scripts": {
  "docker:build:api": "docker compose build api",
  "docker:build:docs": "docker compose build docs",
  "docker:build:landing": "docker compose build landing",
  "docker:build:all": "docker compose build",
  "docker:up": "docker compose up -d",
  "docker:down": "docker compose down"
}
```

### 4. Dokumentation (optional)

Falls nötig, ein `BUILD.md` im root, das das Pattern kurz beschreibt. Kann auch in Phase 3/4 wachsen.

## Abgrenzung

- Kein `docker-compose.override.yml` (kommt ggf. in Phase 4 Dev-Erfahrung)
- Keine Änderungen an `Dockerfile.anystyle` (Ruby-Dienst, eigenes Ökosystem)
- Keine Änderungen am Observability-Stack (cadvisor, prometheus, loki, etc.)

## Abhängigkeiten

- Baut auf Phase 1 auf (CI/CD läuft bereits, pnpm/action-setup Konflikt gelöst)
- Ist Voraussetzung für Phase 3 (Release-Automation baut auf konsistenten Build-Artefakten auf)
