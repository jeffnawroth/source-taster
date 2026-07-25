# DX Foundation — Phase 3: Release-Automation

## Motivation

Phase 1 (CI) stellt sicher, dass jeder Commit geprüft wird. Phase 2 (Build-System) stellt sicher, dass jedes Artefakt konsistent gebaut wird. Phase 3 schliesst den Kreis: **Merge nach main = automatischer Release + Deploy**. Kein manuelles Taggen, kein `bumpp` von Hand, kein SSH-Einloggen auf den VPS.

## Der Flow

Einzige Aktion des Entwicklers: `dev` → `main` mergen. Danach läuft automatisch:

```
Merge → main push
  │
  ├─ Quality Gate (lint + typecheck + build)
  │
  ├─ Version bestimmen (Conventional Commits seit letztem Tag)
  │   feat: → minor | fix: → patch | feat!:/BREAKING: → major
  │
  ├─ Bump + Changelog
  │   ├─ pnpm bumpp in allen Workspace-Packages
  │   └─ conventional-changelog → CHANGELOG.md
  │
  ├─ Commit + Tag + Push
  │   ├─ git commit -m "chore(release): vX.Y.Z [skip ci]"
  │   └─ git tag vX.Y.Z
  │
  ├─ GitHub Release
  │   ├─ Extension .zip + .xpi als Artefakte
  │   └─ Auto-generierte Release Notes
  │
  └─ Deploy (VPS)
      ├─ SSH zum Server
      ├─ git fetch + reset
      ├─ docker compose build --pull
      └─ docker compose up -d --remove-orphans
```

## Workflow-Struktur

### ci.yml (unverändert)
- Trigger: push/PR auf `main` und `dev`
- Jobs: lint, typecheck, build
- Ersetzt den bestehenden "pack"-Job (wird in release.yml abgebildet)

### release.yml (neu, ersetzt bestehendes)
- Trigger: push auf `main`
- Jobs:
  1. **quality** — lint + typecheck + build
  2. **release** (needs: quality) — version bump + changelog + commit/tag + GitHub Release
  3. **deploy** (needs: release) — SSH + docker compose auf VPS

## Versionierung

- **Monorepo-synchron** — alle Workspace-Packages kriegen denselben Versionbump
- **Ausgangsversion:** Extension `2.1.3`. Beim ersten Release nach Umstellung wird auf `2.1.4` (patch) oder `2.2.0`/`3.0.0` (je nach Commits) gebumpt
- **Conventional Commits** als Quelle für den Bump-Typ:
  - `fix:` oder `chore:` → patch
  - `feat:` → minor
  - `feat!:` oder `BREAKING CHANGE:` → major
- Fallback auf patch, wenn kein Commit gematcht wird

## Changelog

- Generiert aus Conventional Commits seit letztem Tag
- Format: [conventional-changelog-conventionalcommits](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-conventionalcommits)
- Datei: `CHANGELOG.md` im Root

## Tooling

Folgende Packages werden benötigt (devDependencies im Root):
- `bumpp` (ist bereits in `apps/extension` vorhanden → ins Root verschieben)
- `conventional-changelog-cli` + `conventional-changelog-conventionalcommits` (für changelog generation)

## Deployment

Der bestehende `deploy.yml`-Workflow wird obsolet — der Deploy-Schritt wandert in den neuen `release.yml`:
- SSH zum VPS (existing `appleboy/ssh-action`)
- `git fetch origin main && git reset --hard origin/main`
- `docker compose build --pull && docker compose up -d --remove-orphans`

## Bestehende Workflows

| Workflow | Änderung |
|----------|----------|
| `ci.yml` | Unverändert. Läuft auf push/PR für main + dev. |
| `release.yml` | Neu — ersetzt das alte tag-getriggerte release.yml. Vollständiger Release-Flow bei main-Push. |
| `deploy.yml` | Wird obsolet — Deploy-Schritt lebt in release.yml. Datei kann gelöscht werden. |
| `lint.yml` | Unverändert. Läuft auf PRs gegen main. |

## Abgrenzung

- Kein `changesets` (Overkill für 1-Person-Team)
- Kein `semantic-release` (der Workflow ersetzt das)
- Kein separates Staging (Deploy geht direkt auf Production-VPS)
- Extension-Build (`pnpm --filter @source-taster/extension pack`) läuft im release-Job, nicht mehr im CI
