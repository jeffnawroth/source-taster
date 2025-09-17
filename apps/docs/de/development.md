---
title: Entwicklung
outline: deep
---

# Entwicklung

## Voraussetzungen

- Node.js 20 (LTS). Dockerfiles basieren auf `node:20-bookworm-slim`.
- pnpm (z. B. `corepack enable pnpm`).
- Optional: Docker & Docker Compose für API + AnyStyle + Docs.

## Installation & Grundsetup

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
# OPENAI_API_KEY, MASTER_KEY und weitere Zugangsdaten eintragen
pnpm --filter @source-taster/types build
```

### Workspace-Befehle

| Package                    | Dev                                          | Build                                          | Hinweise                                                                |
| -------------------------- | -------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------- |
| `@source-taster/types`     | `pnpm --filter @source-taster/types dev`     | `pnpm --filter @source-taster/types build`     | Erzeugt `dist/` für alle Konsumenten.                                   |
| `@source-taster/api`       | `pnpm --filter @source-taster/api dev`       | `pnpm --filter @source-taster/api build`       | Prod-Start via `pnpm --filter @source-taster/api start` (liest `.env`). |
| `@source-taster/extension` | `pnpm --filter @source-taster/extension dev` | `pnpm --filter @source-taster/extension build` | Firefox-Modus `dev-firefox`, Packaging: `pack:*`.                       |
| `@source-taster/docs`      | `pnpm --filter @source-taster/docs dev`      | `pnpm --filter @source-taster/docs build`      | Preview: `pnpm --filter @source-taster/docs preview`.                   |
| Root                       | `pnpm dev`                                   | `pnpm build`                                   | Lint: `pnpm lint`, Deployment per GitHub-Workflow `deploy.yml`.         |

## Workflow

1. **Shared Types aktualisieren**: Bei Schema-Änderungen `packages/types/src` bearbeiten und bauen/watchen.
2. **API starten**: `pnpm --filter @source-taster/api dev` (tsx watch + `.env`).
3. **Extension entwickeln**: `pnpm --filter @source-taster/extension dev` und Output im Browser laden.
4. **Docs bearbeiten**: `pnpm --filter @source-taster/docs dev` für Live-Preview.
5. **Linting**: simple-git-hooks führt `pnpm lint-staged` (ESLint `--fix`) vor jedem Commit aus.

## Umgebungsvariablen

- `.env` in `apps/api` enthält sensible Keys. Im DEV reicht `OPENAI_API_KEY`; PROD nutzt Nutzer-Keys über die API.
- Ohne `MASTER_KEY` & `KEY_DERIVATION_SALT` startet die API nicht (`crypto.ts`).
- `ALLOWED_EXTENSION_IDS` in PROD setzen, um CORS auf bekannte Browser-IDs zu beschränken.
- `ANYSTYLE_SERVER_URL` zeigt standardmäßig auf den Compose-Service (`http://anystyle:4567`).

## Tests & Qualität

- **Lint**: `pnpm lint` (ESLint 9 + `@antfu/eslint-config`).
- **TypeScript**: Extension via `pnpm --filter @source-taster/extension typecheck`, API via `pnpm --filter @source-taster/api build`.
- **TODO:** Automatisierte API-/UI-Tests (z. B. Vitest, Playwright) ergänzen.

## Troubleshooting

- **„Missing X-Client-Id“**: Header wird nur gesetzt, wenn die Extension (und `clientId` im Storage) aktiv ist. Für Postman/curl manuell UUID senden.
- **„AnyStyle unreachable“**: `docker compose up anystyle` prüfen oder `ANYSTYLE_SERVER_URL` anpassen (`apps/api/src/services/anystyleProvider.ts`).
- **AI fällt auf `json_object` zurück**: `BaseAIProvider` weicht aus, wenn der Provider `json_schema` nicht unterstützt (z. B. Google AI); Logs erläutern den Fallback.
- **Rate-Limit-Warnungen**: OpenAlex/Crossref warnen ohne Polite-Pool-Mailto – Werte in `.env` setzen.
- **Firefox-Sidepanel-Menü fehlt**: Hintergrundskript initialisiert Menüs bei `browser.runtime.onInstalled`. Temporäres Add-on neu laden (`about:debugging` → „Neu laden“).

## Docker-Compose

```bash
docker compose up --build
# Services: api (8000), anystyle (4567), docs (8080)
```

- Die API liest `apps/api/.env` (nicht committen!).
- Der Keystore wird auf `./.keystore` gemountet.

## Release-Prozesse

- **Extension**: `pnpm --filter @source-taster/extension pack:zip` (Chrome Web Store), `pack:xpi` (Firefox).
- **API**: Docker-Build `apps/api/Dockerfile`, Laufzeit `node apps/api/dist/index.js`.
- **Docs**: Nginx-Image via `apps/docs/Dockerfile`.
- GitHub-Workflow `release.yml` erstellt bei `v*`-Tags ein Changelog mit `changelogithub`.

## Offene Punkte

- **TODO:** CONTRIBUTING/CODE_OF_CONDUCT ergänzen, sobald der Beitragsprozess steht.
- **TODO:** CI um Tests für Search-/Matching-Provider erweitern.
