---
title: Browser-Extension
outline: deep
---

# Browser-Extension

## Struktur

- Framework: Vue 3 + Vuetify, Pinia, vue-router (Auto-Routes).
- Build-System: Vite 7 (separate Bundles für Popup/Sidepanel, Background, Content Script).
- Skripte (siehe `apps/extension/package.json`):
  - `dev`, `dev-firefox`, `dev:*` – Dev-Server + Background-/Content-Builds.
  - `build`, `build-firefox` – Produktions-Build (`apps/extension/extension/`).
  - `pack:zip`, `pack:crx`, `pack:xpi` – Distributionspakete.
  - `start:chromium`, `start:firefox` – `web-ext run` mit gebauten Artefakten.

## Lokaler Build & Laden

```bash
pnpm --filter @source-taster/extension dev      # Chromium
pnpm --filter @source-taster/extension dev-firefox
```

- Dev-Modus erzeugt `apps/extension/extension/manifest.json` und Stub-HTML für HMR.
- **Chrome/Edge:** `chrome://extensions` → Entwicklermodus → „Entpackte Erweiterung laden“ → `apps/extension/extension`.
- **Firefox:** `about:debugging#/runtime/this-firefox` → „Temporäre Add-ons laden“ → `apps/extension/extension/manifest.json`.

## Produktionsbuild & Packaging

```bash
pnpm --filter @source-taster/extension build
pnpm --filter @source-taster/extension pack:zip   # Chrome Web Store
pnpm --filter @source-taster/extension pack:xpi   # Firefox Add-on (web-ext build)
```

- `pack:crx` erzeugt eine lokal signierte CRX (nur für Tests).
- Versionierung via `pnpm --filter @source-taster/extension release` (bumpp). Manifest-Version mit `package.json` synchron halten.

## Manifest (MV3)

- `manifest_version: 3`, Icons `assets/icon*.png`.
- Popup (`dist/popup/index.html`) und Options (`dist/options/index.html`).
- Sidepanel:
  - Chromium: `side_panel.default_path`
  - Firefox: `sidebar_action.default_panel`
- Background:
  - Chromium: Service Worker `dist/background/index.mjs`
  - Firefox: Modul-Skript `dist/background/index.mjs`
- Rechte:
  - `storage`, `activeTab`, `contextMenus`, optional `sidePanel` (Chromium).
  - Host-Permissions: `http://*/*`, `https://*/*`.
- Content Script: `dist/contentScripts/index.global.js`, Styles `dist/contentScripts/style.css`.
- CSP: Dev erlaubt Vite-HMR (`script-src self http://localhost:3303`).
- `default_locale: "en"`, Übersetzungen in `src/locales/en.json` & `de.json`.

Manifest wird durch `scripts/prepare.ts` generiert (`esno scripts/manifest.ts`). Anpassungen dort vornehmen.

## Funktionen & Flows

- **Kontextmenüs (`background/main.ts`)**
  - `check-bibliography`: öffnet das Sidepanel und füllt markierten Text vor.
  - `openSidePanel`: Sidepanel manuell öffnen; deaktiviert, solange das Panel sichtbar ist.
- **Sidepanel-/Popup-Auswahl**: gespeichert in `browser.storage.sync` (`displayOption`), steuerbar über die Options-UI.
- **WebExtension-Storage**: `useWebExtensionStorage` abstrahiert `storage.local` inkl. Cross-Context-Sync.
- **PDF-Import**: `extractTextFromPdfFile` (unpdf) extrahiert Plaintext aus PDFs.
- **Verifikation**: `useVerification` orchestriert AnyStyle-Konvertierung → Suche → Matching inklusive Early Termination.
- **Settings**: Pinia-Store `settings` (WebExtension Storage) nutzt `DEFAULT_UI_SETTINGS` aus den Shared Types.

## Kommunikation

- `webext-bridge` wird aktuell nur in `background/main.ts` genutzt (z. B. Sichtbarkeitsmeldungen des Sidepanels).
- Sidepanel sendet `SIDE_PANEL_OPENED/CLOSED` an das Background-Skript, um Kontextmenüs zu aktualisieren.

## QA & Tests

- Lint: `pnpm --filter @source-taster/extension lint`
- Typecheck: `pnpm --filter @source-taster/extension typecheck`
- **TODO:** Automatisierte UI-Tests (Cypress/Playwright) ergänzen.

## Release-Checkliste

1. Version erhöhen (`pnpm --filter @source-taster/extension release`).
2. Produktionsbuild (`pnpm --filter @source-taster/extension build`).
3. Artefakte erstellen (`pack:zip`, `pack:xpi`).
4. Upload in Chrome Web Store / AMO.
5. Release-Tag (`git tag vX.Y.Z`, push) → GitHub-Workflow `release.yml` erzeugt Changelog.

## Sicherheit & Datenschutz

- API-Keys werden nicht lokal gespeichert, sondern verschlüsselt über `/api/user/ai-secrets` abgelegt.
- Alle Requests laufen gegen `VITE_API_BASE_URL` (`env.ts`, Default `http://localhost:8000`).
- **TODO:** CSP/Permissions prüfen, sobald neue Provider oder APIs hinzukommen.
