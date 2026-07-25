# DX Foundation — Phase 4: Dev-Experience

## Motivation

Phasen 1-3 haben CI/CD, Build-System und Release-Automation etabliert — die Pipeline ist robust. Was fehlt: eine reibungslose lokale Entwicklung.

Aktuelle Schmerzpunkte:

- `pnpm typecheck` existiert nur in `apps/extension`, nicht im Root
- `pnpm test` ist ein No-op (kein Package hat ein test-Script)
- `pnpm preview` existiert in docs/landing, aber nicht als Root-Script
- Pre-commit prüft nur ESLint — TS-Fehler landen erst in CI
- `.editorconfig` nur in `apps/extension`, nicht projektweit
- Docker Compose nur für Production — kein dev-Modus mit Hot Reload
- Dev-Dokumentation hat explizite TODOs statt richtiger Anleitung

Ziel: **Ein `pnpm install && pnpm dev` — und alles läuft. Typecheck, Preview, Test per Root-Script. Qualität vor dem Commit. Docker dev-fähig. Docs ohne Lücken.**

## Scope

1. Root-Scripts
2. Pre-commit typecheck
3. `.editorconfig` projektweit
4. Docker Compose dev-override
5. Dev-Dokumentation

## Root-Scripts

Folgende Scripts werden im Root ergänzt oder nachgezogen:

| Script      | Command                                               | Bemerkung                                                     |
| ----------- | ----------------------------------------------------- | ------------------------------------------------------------- |
| `typecheck` | `pnpm run -r --parallel --aggregate-output typecheck` | Nur Packages mit TypeScript                                   |
| `preview`   | `pnpm run -r --parallel preview`                      | Nur docs/landing haben preview                                |
| `test`      | `pnpm run -r --parallel test`                         | Wird funktionsfähig gemacht (aktuell no-op, bereit für Tests) |

Dazu werden `typecheck`-Scripts dort ergänzt, wo TypeScript kompiliert wird:

| Package       | typecheck-Script                           |
| ------------- | ------------------------------------------ |
| api           | `tsc --noEmit`                             |
| extension     | existiert bereits: `tsc --noEmit`          |
| types         | `tsc --noEmit`                             |
| landing       | (kein TS-Kompilat — Astro handled das)     |
| docs          | (kein TS-Kompilat — VitePress handled das) |
| eslint-config | (kein TS)                                  |

Packages ohne `typecheck`-Script werden von `pnpm run -r` still übersprungen.

## Pre-commit typecheck

Aktuell: `simple-git-hooks` → `pre-commit` → `pnpm lint-staged` (ESLint).

Neu: `pre-commit` → `pnpm typecheck && pnpm lint-staged`.

Der Typecheck läuft workspace-weit. Das dauert ~10-30s — akzeptabel für die Qualitätssicherung vor Commit.

## EditorConfig

Ein `.editorconfig` im Root wird angelegt (analog zum bestehenden in `apps/extension/`):

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

Das bestehende `apps/extension/.editorconfig` bleibt unverändert — kompatibel, da es weniger spezifisch ist und keine `root = true`-Direktive hat.

## Docker Compose Dev-Override

### `docker-compose.override.yml`

Ein neues Override-File für die lokale Entwicklung. Docker Compose lädt `docker-compose.override.yml` automatisch, wenn es neben `docker-compose.yml` liegt.

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

### `apps/api/Dockerfile.dev`

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

Das Dev-Dockerfile:

- Basis: gleiches `node:22-bookworm-slim`
- `corepack enable` wie in Production
- Installiert alle Dependencies via `--frozen-lockfile`
- Baut `@source-taster/types` (wird gebraucht bevor api startet)
- `CMD` läuft `tsx watch` (via api's `dev`-Script) statt `node dist/`
- Volume-Mounts sorgen für Hot Reload bei lokalen Änderungen

### Nutzung

```bash
docker compose up api  # startet api mit Hot Reload
docker compose up -d   # alle Services im dev-Modus
```

Für rein lokale Entwicklung ohne Docker bleibt `pnpm dev` wie gehabt.

## Dev-Dokumentation

`apps/docs/development.md` wird aktualisiert:

### Setup

(bereits vorhanden — `pnpm install` → `pnpm build:types` → `pnpm dev`)

### Commands

```bash
pnpm dev           # alle Dev-Server parallel
pnpm typecheck     # TypeScript-Prüfung workspace-weit
pnpm preview       # Preview für docs + landing
pnpm test          # Tests ausführen (wenn vorhanden)
pnpm lint          # ESLint workspace-weit
pnpm build         # alle Packages bauen
```

### Docker Dev

```bash
docker compose up api              # api mit Hot Reload
docker compose up -d               # alle Services im dev-Modus
docker compose down --volumes      # clean shutdown
```

### Contribution Guide

- Branch-Naming: `feature/`, `fix/`, `chore/` Prefix
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- Pre-commit: Typecheck + ESLint laufen automatisch
- PR: Gegen `dev` — CI muss grün sein. Merge nach `main` trigger Release

## Bestehende Dateien

| Datei                               | Änderung                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------ |
| `package.json` (Root)               | Neue Scripts `typecheck`, `preview`, `test` + simple-git-hooks erweitert |
| `apps/api/package.json`             | Neues Script `typecheck`: `tsc --noEmit`                                 |
| `packages/types/package.json`       | Neues Script `typecheck`: `tsc --noEmit`                                 |
| `.editorconfig` (neu Root)          | Neu — projektweite Editor-Einstellungen                                  |
| `docker-compose.override.yml` (neu) | Dev-Override mit Volume-Mounts + dev Dockerfile                          |
| `apps/api/Dockerfile.dev` (neu)     | Dev-Version mit `tsx watch`                                              |
| `apps/docs/development.md`          | TODOs ersetzt, Commands + Contribution Guide                             |
| `.editorconfig` (extension)         | Unverändert                                                              |

## Nicht im Scope

- **Test-Runner aufsetzen** — `vitest`-Konfiguration und erste Tests kommen in eine eigene Phase
- **E2E-Tests** — Playwright/Cypress sind nicht Teil dieser Phase
- **Lefthook/Husky** — simple-git-hooks bleibt, kein Tooling-Wechsel
- **Devcontainer** — `.devcontainer/devcontainer.json` wird nicht angelegt
- **Makefile** — alle Tasks über `package.json`-Scripts
- **commitlint** — keine automatische Commit-Message-Validierung (Conventional Commits per Konvention)
