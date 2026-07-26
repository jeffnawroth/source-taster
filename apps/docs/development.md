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
```

## Dev-Server starten

**Mit API + anystyle (empfohlen):**

```bash
pnpm dev:docker
# Startet: anystyle (Docker) + Types + Api + Extension + Docs + Landing (lokal)
```

**Ohne API (nur Frontend — Extension, Docs, Landing):**

```bash
pnpm dev
# Startet: Types + Extension + Docs + Landing (lokal)
# Api läuft, aber anystyle fehlt → Reference-Parsing geht nicht
```

## Workspace Commands

| Command           | Description                                                        |
| ----------------- | ------------------------------------------------------------------ |
| `pnpm dev:docker` | **Für API-Entwicklung.** Docker (anystyle) + alle Dev-Server lokal |
| `pnpm dev`        | Nur lokale Dev-Server (ohne anystyle)                              |
| `pnpm build`      | Alle Packages bauen                                                |
| `pnpm typecheck`  | TypeScript-Prüfung workspace-weit                                  |
| `pnpm preview`    | Preview für docs + landing                                         |
| `pnpm test`       | Tests ausführen (bereitgestellt, sobald Tests existieren)          |
| `pnpm lint`       | ESLint workspace-weit                                              |

## Workflow

1. **API starten**: `pnpm dev` oder `pnpm --filter @source-taster/api dev`.
2. **Extension entwickeln**: `pnpm --filter @source-taster/extension dev`, Build in Browser laden.
3. **Docs editieren**: `pnpm --filter @source-taster/docs dev` für Live-Vorschau.
4. **Pre-commit**: Typecheck + ESLint laufen automatisch vor jedem Commit.

## Docker Compose

Für den Normalfall reicht `pnpm dev:docker` — das startet anystyle automatisch.

Nur Docker (ohne pnpm):

```bash
docker compose up --build         # Alle Services in Containern (production-like)
docker compose up api              # Api mit Hot Reload (Dev-Override)
docker compose up anystyle         # Nur anystyle
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
- **“AnyStyle unreachable”**: `pnpm dev:docker` startet anystyle automatisch. Reicht das nicht: `docker compose up anystyle` prüfen oder `ANYSTYLE_SERVER_URL` anpassen.
- **TypeScript-Fehler nach Pull**: `pnpm build:types && pnpm typecheck` — möglicherweise sind shared types geändert.
- **Firefox side panel fehlt**: Extension neu laden (`about:debugging` → "Reload").
