# DX Foundation — Dev-Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Root scripts (typecheck/preview/test), pre-commit typecheck, root .editorconfig, Docker dev-override, dev-docs cleanup.

**Architecture:** Add `typecheck` scripts to api/types packages, wire them into root `pnpm typecheck`. Extend simple-git-hooks to run typecheck before lint-staged. Create `docker-compose.override.yml` + `apps/api/Dockerfile.dev` for local dev with hot reload. Replace TODOs in dev docs with real content.

**Tech Stack:** simple-git-hooks, Docker Compose override pattern, tsx watch, ASTRO/VitePress built-in type-check.

## Global Constraints

- All new scripts use `--aggregate-output` flag for clean parallel output
- simple-git-hooks stays (no husky/lefthook migration)
- Docker dev image uses `node:22-bookworm-slim`, same base as production
- `.editorconfig` at root uses `root = true` to prevent cascade
- dev-docs replace all TODO markers with complete content

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `package.json` (root) | Modify | Add `typecheck`, `preview` scripts; extend `simple-git-hooks` |
| `apps/api/package.json` | Modify | Add `typecheck: tsc --noEmit` script |
| `packages/types/package.json` | Modify | Add `typecheck: tsc --noEmit` script |
| `.editorconfig` | Create | Projektweite Editor-Einstellungen |
| `apps/api/Dockerfile.dev` | Create | Dev image mit tsx watch |
| `docker-compose.override.yml` | Create | Dev-Override mit Volumes |
| `apps/docs/development.md` | Modify | TODOs ersetzen, Commands + Contribution Guide |

---

### Task 1: Root Scripts + typecheck in Packages

**Files:**
- Modify: `package.json` (root)
- Modify: `apps/api/package.json`
- Modify: `packages/types/package.json`

- [ ] **Add `typecheck` to `packages/types/package.json`**

```json
// in "scripts" section, after "dev"
"typecheck": "tsc --noEmit",
```

- [ ] **Add `typecheck` to `apps/api/package.json`**

```json
// in "scripts" section, after "lint:fix"
"typecheck": "tsc --noEmit",
```

- [ ] **Add `typecheck` and `preview` to root `package.json`**

```json
// in "scripts" section, after "build:types"
"typecheck": "pnpm run -r --parallel --aggregate-output typecheck",
"preview": "pnpm run -r --parallel preview",
```

The existing `test` script (`pnpm run -r --parallel test`) is already correct — it silently skips packages without a test script.

- [ ] **Verify typecheck passes**

Run: `pnpm typecheck`
Expected: All packages pass (or skip silently). Zero errors.

- [ ] **Commit**

```bash
git add package.json apps/api/package.json packages/types/package.json
git commit -m "feat: add root typecheck and preview scripts, typecheck to api and types"
```

---

### Task 2: Pre-commit typecheck

**Files:**
- Modify: `package.json` (root)

**Depends on:** Task 1 (typecheck scripts must exist)

- [ ] **Update simple-git-hooks in root `package.json`**

Change:
```json
"simple-git-hooks": {
  "pre-commit": "pnpm lint-staged"
}
```

To:
```json
"simple-git-hooks": {
  "pre-commit": "pnpm typecheck && pnpm lint-staged"
}
```

- [ ] **Apply hook**

Run: `npx simple-git-hooks`
Expected: Hook is updated. No error output.

- [ ] **Verify hook works**

Run: `git commit --allow-empty -m "test: verify pre-commit hook"` (then amend/delete this commit afterward — or just trust that `npx simple-git-hooks` reported success)

- [ ] **Commit**

```bash
git add package.json
git commit -m "feat: add typecheck to pre-commit hook"
```

---

### Task 3: Root .editorconfig

**Files:**
- Create: `.editorconfig`

- [ ] **Create `.editorconfig` at project root**

Content:
```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = false
insert_final_newline = true
```

- [ ] **Commit**

```bash
git add .editorconfig
git commit -m "feat: add root .editorconfig for project-wide editor settings"
```

---

### Task 4: Docker Dev-Override

**Files:**
- Create: `apps/api/Dockerfile.dev`
- Create: `docker-compose.override.yml`

**Best to build api Dockerfile.dev first, then compose override second, since the override references the dev Dockerfile.**

#### Step 1: Create dev Dockerfile for API

- [ ] **Create `apps/api/Dockerfile.dev`**

```dockerfile
FROM node:22-bookworm-slim
ENV NODE_ENV=development
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY apps/api/tsconfig.json apps/api/
COPY apps/api/package.json apps/api/
COPY packages/types/package.json packages/types/
COPY packages/types/tsconfig.json packages/types/
RUN pnpm install --frozen-lockfile
COPY packages/types/ packages/types/
RUN pnpm --filter @source-taster/types build
COPY apps/api/ apps/api/
EXPOSE 8000
CMD ["pnpm", "--filter", "@source-taster/api", "dev"]
```

#### Step 2: Create docker-compose override

- [ ] **Create `docker-compose.override.yml`**

```yaml
services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile.dev
    volumes:
      - ./apps/api/src:/app/apps/api/src
      - ./packages/types/src:/app/packages/types/src
    environment:
      - NODE_ENV=development
```

#### Step 3: Verify build

- [ ] **Build dev image**

Run: `docker compose build api`
Expected: Build succeeds. Image tagged with `source-taster-api` (or similar). Layer caching works for dependencies.

- [ ] **Commit**

```bash
git add apps/api/Dockerfile.dev docker-compose.override.yml
git commit -m "feat: add Docker dev-override with hot-reload API image"
```

---

### Task 5: Dev Documentation

**Files:**
- Modify: `apps/docs/development.md`

- [ ] **Update `apps/docs/development.md`**

Replace the existing content with:

```markdown
---
title: Development
outline: deep
---

# Development

## Prerequisites

- Node.js 22 (LTS). Dockerfiles use `node:22-bookworm-slim`.
- pnpm (enable via `corepack enable pnpm`).
- Docker & Docker Compose (optional, for API + services).

## Installation & Bootstrap

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
# Provide secrets such as OPENAI_API_KEY, MASTER_KEY, KEY_DERIVATION_SALT.
pnpm build:types
```

## Workspace Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Alle Dev-Server parallel (API, Extension, Docs, Landing) |
| `pnpm build` | Alle Packages bauen |
| `pnpm typecheck` | TypeScript-Prüfung workspace-weit |
| `pnpm preview` | Preview für docs + landing |
| `pnpm test` | Tests ausführen (bereitgestellt, sobald Tests existieren) |
| `pnpm lint` | ESLint workspace-weit |

## Workflow

1. **Shared types aktualisieren** bei Schema-Änderungen: `packages/types/src` editieren, dann `pnpm build:types`.
2. **API starten**: `pnpm dev` oder `pnpm --filter @source-taster/api dev`.
3. **Extension entwickeln**: `pnpm --filter @source-taster/extension dev`, Build in Browser laden.
4. **Docs editieren**: `pnpm --filter @source-taster/docs dev` für Live-Vorschau.
5. **Pre-commit**: Typecheck + ESLint laufen automatisch vor jedem Commit.

## Docker Compose

Production (alle Services):
```bash
docker compose up --build
```

Development (API mit Hot Reload):
```bash
docker compose up api
# Volume-Mounts syncen lokale Änderungen live in den Container
```

## Contribution Guide

- **Branch-Naming:** `feature/`, `fix/`, `chore/` Prefix
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- **Pre-commit:** `pnpm typecheck` + `pnpm lint-staged` (ESLint --fix) laufen automatisch
- **PR:** Gegen `dev` branch — CI muss grün sein. Merge nach `main` triggert automatischen Release + Deploy

## Environment Variables

- `apps/api/.env` hostet Secrets. In Entwicklung reicht `OPENAI_API_KEY`.
- `MASTER_KEY` + `KEY_DERIVATION_SALT` werden beim API-Start benötigt (`crypto.ts`).
- `ALLOWED_EXTENSION_IDS` restringiert CORS in Production.
- `ANYSTYLE_SERVER_URL` default: `http://anystyle:4567`.

## Troubleshooting

- **“Missing X-Client-Id”**: Der Header wird nur von der Extension gesetzt. Für curl/Postman manuelle UUID mitschicken.
- **“AnyStyle unreachable”**: `docker compose up anystyle` prüfen oder `ANYSTYLE_SERVER_URL` anpassen.
- **TypeScript-Fehler nach Pull**: `pnpm build:types && pnpm typecheck` — möglicherweise sind shared types geändert.
- **Firefox side panel fehlt**: Extension neu laden (`about:debugging` → "Reload").
```

(Replace TODOs with real content. Remove the old workspace commands table and the release processes section (that's now in the release spec). Keep the troubleshooting section.)

- [ ] **Commit**

```bash
git add apps/docs/development.md
git commit -m "docs: update dev docs — commands, contribution guide, Docker dev"
```
