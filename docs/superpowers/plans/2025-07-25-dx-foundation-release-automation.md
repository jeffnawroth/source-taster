# Release-Automation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge to main → automatischer Version-Bump, Changelog, GitHub Release, VPS-Deploy.

**Architecture:** Ein neuer `release.yml` Workflow auf `push: branches: [main]` ersetzt die alte tag-getriggerte release.yml und die deploy.yml. Der Workflow hat drei Jobs: quality → release → deploy. Version wird aus Conventional Commits seit letztem Tag ermittelt.

**Tech Stack:** GitHub Actions, pnpm 11, bumpp, conventional-changelog

## Global Constraints

- Workflow-Trigger: `push` auf `main` (nicht mehr auf Tags)
- Alle Jobs nutzen `ubuntu-24.04`
- pnpm/action-setup@v4 ohne `version` (liest aus package.json packageManager)
- Commit-Message des Release-Commits enthält `[skip ci]`
- Versionsbestimmung aus Conventional Commits (git log seit letztem Tag)

---
### Task 1: Prepare root dependencies and package versions

**Files:**
- Modify: `package.json` (root)
- Modify: `apps/extension/package.json`
- Modify: `apps/api/package.json`
- Create: `CHANGELOG.md`

**Interfaces:**
- Consumes: nothing
- Produces: paketierte devDependencies im Root, CHANGELOG.md, version-field auf api

- [ ] **Step 1: Add devDependencies to root package.json**

Füge in `package.json` unter `devDependencies` ein:

```json
    "bumpp": "^10.4.1",
    "conventional-changelog-cli": "^5.0.0",
    "conventional-changelog-conventionalcommits": "^8.0.0"
```

- [ ] **Step 2: Remove bumpp from extension devDependencies**

Entferne aus `apps/extension/package.json` `devDependencies`:

```json
    "bumpp": "^10.4.1",
```

- [ ] **Step 3: Add version field to api package.json**

Füge in `apps/api/package.json` nach `"name": "@source-taster/api"` ein:

```json
  "version": "1.0.0",
```

- [ ] **Step 4: Create CHANGELOG.md**

```markdown
# Changelog

All notable changes to Source Taster will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).
```

- [ ] **Step 5: Install dependencies and verify**

```bash
pnpm install
```

Prüfe: `pnpm ls -r bumpp` zeigt bumpp nur noch im Root, nicht in extension.

- [ ] **Step 6: Commit**

```bash
git add package.json apps/extension/package.json apps/api/package.json CHANGELOG.md pnpm-lock.yaml
git commit -m "chore: add release tooling to root devDependencies, add version to api"
```

### Task 2: Create new release.yml workflow

**Files:**
- Create/Replace: `.github/workflows/release.yml`

**Interfaces:**
- Consumes: Task 1 (bumpp + conventional-changelog im Root), Phase 1/2 (CI-Build, Dockerfiles)
- Produces: vollständiger Release-Workflow

- [ ] **Step 1: Replace `.github/workflows/release.yml`**

Schreibe die Datei komplett neu:

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm run -r typecheck

  release:
    needs: [quality]
    runs-on: ubuntu-24.04
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install

      - name: Configure git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

      - name: Determine version bump
        id: version
        run: |
          LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
          echo "last_tag=$LAST_TAG" >> "$GITHUB_OUTPUT"
          if git log "$LAST_TAG..HEAD" --oneline | grep -q "BREAKING CHANGE\|feat!"; then
            echo "bump=major" >> "$GITHUB_OUTPUT"
          elif git log "$LAST_TAG..HEAD" --oneline | grep -q "^feat"; then
            echo "bump=minor" >> "$GITHUB_OUTPUT"
          else
            echo "bump=patch" >> "$GITHUB_OUTPUT"
          fi

      - name: Bump versions
        run: pnpm bumpp --no-commit --no-push --release "${{ steps.version.outputs.bump }}"

      - name: Generate changelog
        run: npx conventional-changelog -p conventionalcommits -i CHANGELOG.md -s

      - name: Commit and tag
        run: |
          VERSION=$(node -p "require('./apps/extension/package.json').version")
          git add -A
          git commit -m "chore(release): v${VERSION} [skip ci]"
          git tag "v${VERSION}"
          git push origin --tags

      - name: Build extension packages
        run: |
          pnpm install
          pnpm build
          pnpm --filter @source-taster/extension pack

      - uses: softprops/action-gh-release@v2
        with:
          files: |
            apps/extension/extension.zip
            apps/extension/extension.xpi
          generate_release_notes: true

  deploy:
    needs: [release]
    runs-on: ubuntu-24.04
    steps:
      - name: Deploy over SSH
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          port: ${{ secrets.PORT }}
          passphrase: ${{ secrets.PASSPHRASE }}
          script_stop: 'true'
          command_timeout: 30m
          script: |
            set -euo pipefail
            cd ${{ secrets.DEPLOY_PATH }}
            git fetch origin main
            git reset --hard origin/main
            docker compose build --pull
            docker compose up -d --remove-orphans
```

- [ ] **Step 2: Verify YAML syntax**

```bash
find .github/workflows -name "*.yml" -exec python3 -c "import yaml; yaml.safe_load(open('{}')); print('{} OK')" \;
```

Expected: All files parse without error.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "feat: add main-triggered release workflow with bump, changelog, release, deploy"
```

### Task 3: Clean up old workflows

**Files:**
- Modify: `.github/workflows/ci.yml`
- Delete: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: Task 2 (release.yml existiert)
- Produces: bereinigte Workflow-Struktur

- [ ] **Step 1: Remove pack job from ci.yml**

Lösche die gesamte `pack:` job definition (Zeilen 47-65) aus `.github/workflows/ci.yml`. Der Pack-Schritt lebt jetzt im release.yml Workflow.

- [ ] **Step 2: Delete deploy.yml**

```bash
git rm .github/workflows/deploy.yml
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "chore: remove pack job from CI and delete deploy.yml — now in release.yml"
```

### Task 4: Verification

**Files:** none

**Interfaces:**
- Consumes: Tasks 1-3

- [ ] **Step 1: Push dev and verify CI green**

```bash
git push origin dev
```

Wait for CI run → check lint, typecheck, build pass.

- [ ] **Step 2: Check workflow structure**

```bash
ls .github/workflows/
```

Expected: ci.yml, lint.yml, release.yml. deploy.yml removed.

- [ ] **Step 3: Verify release.yml has correct triggers**

```bash
grep "on:" .github/workflows/release.yml
grep "branches:" .github/workflows/release.yml
```

Expected: `push` on `main`.
