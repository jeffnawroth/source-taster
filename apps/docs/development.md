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
pnpm dev
```

## Workspace Commands

| Command          | Description                                               |
| ---------------- | --------------------------------------------------------- |
| `pnpm dev`       | Alle Dev-Server parallel (API, Extension, Docs, Landing)  |
| `pnpm build`     | Alle Packages bauen                                       |
| `pnpm typecheck` | TypeScript-Prüfung workspace-weit                         |
| `pnpm preview`   | Preview für docs + landing                                |
| `pnpm test`      | Tests ausführen (bereitgestellt, sobald Tests existieren) |
| `pnpm lint`      | ESLint workspace-weit                                     |

## Workflow

1. **API starten**: `pnpm dev` oder `pnpm --filter @source-taster/api dev`.
2. **Extension entwickeln**: `pnpm --filter @source-taster/extension dev`, Build in Browser laden.
3. **Docs editieren**: `pnpm --filter @source-taster/docs dev` für Live-Vorschau.
4. **Pre-commit**: Typecheck + ESLint laufen automatisch vor jedem Commit.

## Docker Compose

Drei Modi, je nachdem was du brauchst:

### 1. Alles lokal (schnellste Iteration)

```bash
docker compose up -d anystyle    # Ruby-Dienst im Container
pnpm dev                           # Api, Extension, Docs, Landing lokal
```

Anystyle (Ruby/Sinatra) läuft im Container — alles andere lokal mit Hot Reload.

### 2. Hybride Entwicklung (empfohlen)

```bash
docker compose up -d anystyle     # Ruby im Hintergrund
pnpm dev                           # Lokale Dev-Server
```

Gleicher Flow wie "alles lokal", aber anystyle läuft im Hintergrund.

### 3. Alles im Container (production-like)

```bash
docker compose up --build         # Alle Services in Containern
```

### Docker-Kommandos

```bash
docker compose up api              # Api mit Hot Reload (Dev-Override)
docker compose up -d anystyle      # Nur anystyle im Hintergrund
docker compose up -d               # Alle Services im Hintergrund
docker compose down                # Stoppen
docker compose down --volumes      # Stoppen + Volumes löschen
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
