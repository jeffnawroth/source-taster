# Design — Favorite Sources (Verified Sources)

> Date: 2026-08-20
> Status: accepted (see ADR-0007 for the identity/persistence decision)

## Problem

Users who verify academic references across sessions have no way to keep track
of sources that already passed verification, so they must re-run extraction and
verification to relocate a known-good source.

## Outcome

After a browser refresh, favorited sources remain marked without re-running
verification. Favorites never influence matching scores; deterministic
verification stays intact.

## Requirements

- **R1 — Toggle favorite.** On any result row with a verification result, mark/
  unmark the matched source as favorite with immediate visual state change.
- **R2 — Persist across refresh.** The favorite set survives a browser refresh.
  Web: `localStorage` (precedent `clientId`). Extension: `chrome.storage.local`
  via `useWebExtensionStorage` (precedent `settings`).
- **R3 — Favorites-only filter.** Toggleable filter showing only results whose
  source is a favorite; clearable. Filter state is session-only.
- **R4 — Locales.** All new UI strings in de + en.

## Acceptance Criteria

- **R1:** Given a result row with a verification result, when the user clicks
  the favorite toggle, then the row shows the favorited state; clicking again
  reverts it.
- **R2:** Given a favorited source, when the page is reloaded (web) or the
  report is reopened (extension), then the source is still marked favorite.
  Given two distinct matched sources, when both are favorited, then they remain
  distinct favorites.
- **R3:** Given ≥1 favorite and ≥1 non-favorite result, when the filter is
  enabled, then only results with a favorite source are displayed and a control
  to disable it is visible; disabling restores all results.
- **R4:** Given locale de or en, when favorite/filter controls render, then
  every new string exists in both locales.

## Design

**Identity.** Favorite keys derive from CSL metadata identifiers only, chain
`DOI → PMID → PMCID → arxivId → URL`, type-namespaced and normalized; URL
fallback is `metadata.URL ?? candidate.url`. Helper in `packages/types`
(unit-tested once). See ADR-0007.

**Web.** The verification store retains matched candidates
(`Record<candidateId, ApiSearchCandidate>`, currently discarded). A Pinia
`favorites` store holds the persisted set and the session-only `favoritesOnly`
flag. ResultsView renders per-evaluation rows with the source title and a star
toggle, a favorites chip in the toolbar (visible when ≥1 favorite), reference
panels hidden when they contain no favorite, and an empty state with a clear
action.

**Extension.** A `favorites` ref in `logic/storage.ts` (preserved on storage
version resets). A Pinia `favorites` store provides `isFavorite`,
`toggleFavorite`, and `referenceHasFavorite`. EvaluationList shows a star
toggle in each source panel title row. ReportSection gains a session-only
`favoritesOnly` state that ANDs with the existing score-filter chips and search;
a favorites chip in ReportSubtitle toggles it; an empty state offers a clear
action.

## Out of Scope

Accounts, cross-device sync, sharing, export, backend persistence, favorite
management views, search within favorites, bulk actions, restricting favorites
to success-only sources, changes to search/matching/extraction.

## Limitations

- Same work resurfacing with a different identifier set may produce a different
  favorite key (ADR-0007).
- URL-keyed favorites are the least durable.
- Favorites whose work disappears from results do not render (no dangling UI).
- Extension UI glue has no automated test infrastructure; the shared derivation
  logic is covered by unit tests in `packages/types`.