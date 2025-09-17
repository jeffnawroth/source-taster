---
title: Migration & Breaking Changes
outline: deep
---

# Migration & Breaking Changes

Derzeit existieren keine offiziellen Migration Guides. Dieses Dokument dient als Platzhalter für zukünftige Änderungen.

## WebExtension-Storage

- `ensureStorageVersion` (`apps/extension/src/logic/storageVersion.ts`) setzt bei Versionswechseln den Local Storage zurück und erhält `clientId`.
- Bei Änderungen an `DEFAULT_UI_SETTINGS` sollte die Storage-Version erhöht und hier dokumentiert werden.

## API

- Änderungen an Zod-Schemas (`ApiMatchRequestSchema`, `ApiSearchRequestSchema`, …) mit Client-Anpassungen in diesem Dokument festhalten.
- `ALLOWED_EXTENSION_IDS` beeinflusst Produktionsdeployments. Neue Browser-IDs hier ergänzen.

## Empfehlungen für zukünftige Breaker

1. Shared Types in `packages/types` versionieren und Release-Notizen ergänzen.
2. Storage-Migration der Extension planen (z. B. `ensureStorageVersion` erweitern).
3. API-Änderungen mit Request/Response-Diffs und ggf. Scripts dokumentieren.

## TODO

- **TODO:** Release-Historie (Extension ≥1.8.4, API) sammeln und Migrationshinweise ergänzen.
- **TODO:** Prozesse für das Hinzufügen/Entfernen von Datenquellen definieren.
