# Standardisiertes Build-System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vereinfachte und konsistente Dockerfiles für alle Apps, erweiterte docker-compose.yml, convenience Scripts.

**Architecture:** Jede App bekommt ein Dockerfile nach einheitlichem Pattern (node:22 → pnpm install → build → nginx/node-runtime). package.json Kopien in der `deps` Stage werden auf die tatsächlich benötigten Workspaces reduziert. docker-compose bekommt einen landing Service + Healthchecks.

**Tech Stack:** Docker BuildKit, pnpm 11, Node 22, nginx:1.27-alpine

## Global Constraints

- Alle node Dockerfiles starten mit `FROM node:22-bookworm-slim AS base` und `corepack enable`
- Statische Apps (docs, landing) enden in `FROM nginx:1.27-alpine`, Port 80
- API endet in `FROM node:22-bookworm-slim`, Port 8000
- pnpm install immer mit `--frozen-lockfile`
- Werkspace package.json Kopien nur für die tatsächliche dependency-chain

---
### Task 1: Refactor `apps/api/Dockerfile` — targeted package.json copies

**Files:**
- Modify: `apps/api/Dockerfile`

**Interfaces:**
- Consumes: nothing
- Produces: schlankeres API-Dockerfile

- [ ] **Step 1: Reduce package.json copies in deps stage**

Aktuell kopiert `apps/api/Dockerfile` package.jsons für ALLE Workspaces. Reduziere auf die, die `@source-taster/api` tatsächlich braucht: nur `apps/api/package.json` + `packages/types/package.json`.

Ersetze:

```dockerfile
COPY apps/api/package.json apps/api/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY apps/extension/package.json apps/extension/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
```

mit:

```dockerfile
COPY apps/api/package.json apps/api/package.json
COPY packages/types/package.json packages/types/package.json
```

- [ ] **Step 2: Verify the Dockerfile builds**

```bash
docker compose build api
```

Expected: Build succeeds, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add apps/api/Dockerfile
git commit -m "refactor: reduce package.json copies in api/Dockerfile to only needed workspaces"
```

### Task 2: Refactor `apps/docs/Dockerfile` — targeted package.json copies

**Files:**
- Modify: `apps/docs/Dockerfile`

**Interfaces:**
- Consumes: nothing
- Produces: schlankeres Docs-Dockerfile

- [ ] **Step 1: Reduce package.json copies in deps stage**

`@source-taster/docs` hat keine production workspace-dependencies. Ersetze:

```dockerfile
COPY apps/docs/package.json apps/docs/package.json
COPY apps/extension/package.json apps/extension/package.json
COPY apps/api/package.json apps/api/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
```

mit:

```dockerfile
COPY apps/docs/package.json apps/docs/package.json
```

- [ ] **Step 2: Verify the Dockerfile builds**

```bash
docker compose build docs
```

Expected: Build succeeds, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add apps/docs/Dockerfile
git commit -m "refactor: reduce package.json copies in docs/Dockerfile to only needed workspaces"
```

### Task 3: Create `apps/landing/Dockerfile`

**Files:**
- Create: `apps/landing/Dockerfile`

**Interfaces:**
- Consumes: nothing
- Produces: Landing-Dockerfile nach einheitlichem Pattern

- [ ] **Step 1: Create `apps/landing/Dockerfile`**

```dockerfile
# syntax=docker/dockerfile:1.6

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

FROM base AS deps
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends git \
  && rm -rf /var/lib/apt/lists/*
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/landing/package.json apps/landing/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY . .
RUN pnpm --filter @source-taster/landing build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/apps/landing/dist /usr/share/nginx/html
EXPOSE 80
```

- [ ] **Step 2: Verify the Dockerfile builds**

```bash
docker build -f apps/landing/Dockerfile --tag source-taster-landing .
```

Expected: Build succeeds, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add apps/landing/Dockerfile
git commit -m "feat: add landing Dockerfile with nginx runtime"
```

### Task 4: Update `docker-compose.yml` — landing service + healthchecks

**Files:**
- Modify: `docker-compose.yml`

**Interfaces:**
- Consumes: Tasks 1-3 (die Dockerfiles existieren)
- Produces: vollständige docker-compose.yml

- [ ] **Step 1: Add landing service**

Füge nach dem `docs:` block ein:

```yaml
  landing:
    build:
      context: .
      dockerfile: apps/landing/Dockerfile
    ports:
      - '8081:80'
    restart: unless-stopped
```

- [ ] **Step 2: Add healthchecks**

Füge `healthcheck:` block zu jedem Service (api, anystyle, docs, landing) hinzu:

**api:**
```yaml
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
```

**anystyle:**
```yaml
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4567/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
```

**docs:**
```yaml
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

**landing:**
```yaml
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

- [ ] **Step 3: Fix Grafana SMTP Platzhalter**

Ersetze die hartcodierten SMTP-Werte im grafana service:

```yaml
      GF_SMTP_HOST: smtp.example.com:587
      GF_SMTP_USER: your-smtp-user
      GF_SMTP_PASSWORD: your-smtp-password
```

durch Environment-Variablen (mit leerem Fallback):

```yaml
      GF_SMTP_HOST: ${GF_SMTP_HOST:-}
      GF_SMTP_USER: ${GF_SMTP_USER:-}
      GF_SMTP_PASSWORD: ${GF_SMTP_PASSWORD:-}
```

- [ ] **Step 4: Verify docker-compose config is valid**

```bash
docker compose config
```

Expected: Parsed YAML output, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml
git commit -m "feat: add landing service, healthchecks, and env-based SMTP config"
```

### Task 5: Add root build scripts

**Files:**
- Modify: `package.json` (root)

**Interfaces:**
- Consumes: nothing
- Produces: convenience docker:* scripts

- [ ] **Step 1: Add docker scripts to root package.json**

Füge in den `"scripts"` block (nach `"deploy"`) ein:

```json
    "docker:build:api": "docker compose build api",
    "docker:build:docs": "docker compose build docs",
    "docker:build:landing": "docker compose build landing",
    "docker:build:all": "docker compose build",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: add docker build/up/down convenience scripts"
```

### Task 6: Verification — build all images

**Files:** none

**Interfaces:**
- Consumes: Tasks 1-5

- [ ] **Step 1: Build all services**

```bash
pnpm docker:build:all
```

Expected: All 4 images (api, anystyle, docs, landing) build successfully.

- [ ] **Step 2: Push to CI and verify**

```bash
git push origin dev
```

Check GitHub Actions — CI should still be green.

- [ ] **Step 3: Clean up dangling images (optional)**

```bash
docker image prune -f
```
