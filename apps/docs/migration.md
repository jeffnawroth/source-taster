---
title: Migration & Breaking Changes
outline: deep
---

# Migration & Breaking Changes

No official migration guides exist yet. Use this document as a placeholder for future changes.

## WebExtension Storage

- `ensureStorageVersion` (`apps/extension/src/logic/storageVersion.ts`) resets the local storage when versions change and preserves `clientId`.
- When adjusting `DEFAULT_UI_SETTINGS`, bump the storage version and document the change here.

## API

- Update this page whenever Zod schemas (`ApiMatchRequestSchema`, `ApiSearchRequestSchema`, …) evolve, including client-side adjustments.
- `ALLOWED_EXTENSION_IDS` affects production deployments. Record new browser IDs when they go live.

## Recommendations for Future Breakers

1. Version shared types in `packages/types` first and add release notes.
2. Outline extension storage migrations (e.g. helper scripts or `ensureStorageVersion` upgrades).
3. Document API changes with request/response diffs and optional migration scripts.

## TODO

- **TODO:** Compile historical release notes (extension ≥1.8.4, API) and add migration guidance.
- **TODO:** Define processes for adding/removing data sources (search providers).
