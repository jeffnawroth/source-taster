---
title: Matching & Scoring
outline: deep
---

# Matching & Scoring

## Engine

`apps/api/src/services/matching/engines/deterministicEngine.ts`

- Uses `NormalizationService` to pre-process text values.
- Computes similarities via `similarity()` (Damerau-Levenshtein) plus dedicated routines for authors, dates, container titles, volume/issue, and pages.
- Aggregates field scores (0–100) according to the configured weights.

## Normalisation Order

Defined in `NormalizationService.normalize`:

1. `normalize-typography` – smart quotes, dashes, ellipsis.
2. `normalize-characters` – corrupted characters, ASCII surrogates.
3. `normalize-urls` – via `normalize-url` (strip tracking params, sort query).
4. `normalize-identifiers` – strips DOI/URL prefixes, cleans identifiers.
5. `normalize-umlauts` – e.g. `ä → ae`, `ß → ss`.
6. `normalize-accents` – Unicode decomposition, remove diacritics.
7. `normalize-unicode` – `NFKC`, remove zero-width characters.
8. `normalize-punctuation` – limit to letters/numbers/spaces.
9. `normalize-whitespace` – trim, collapse multiple spaces.
10. `normalize-lowercase` – final lowercasing.

Only requested rules run; others are skipped.

## Field Heuristics

- **Authors (`match-author-initials`)** – match family names (exact or ≥0.9 similarity) and compare initials via `tokenizeGiven`/`isSubsequence`.
- **Dates (`match-structured-dates`)** – parse CSL dates (`date-parts`, `raw`, `literal`) and weight `year` (0.8), `month` (0.15), `day` (0.05).
- **Volume/Issue (`match-volume-issue-numeric`)** – extract digits and compare the first occurrence.
- **Pages (`match-page-range-overlap`)** – detect ranges, expand shorthand (“123-8”), compute overlap/union ratio. Single-page vs range yields 1.0 if contained.
- **Container title (`match-container-title-variants`)** – drop acronym-only parentheses, test variants, and use Damerau-Levenshtein to pick the best score.

## Score Calculation

```ts
overall = sum(fieldScore * weight) / sum(weight)
```

- `fieldScore` already ranges 0–100.
- Fields without meaningful values are ignored (`MetadataComparator`).
- Results are sorted descending (`MatchingCoordinator`).

### Example

- `title`: 100 %, weight 30
- `author`: 92 %, weight 25
- `issued`: 85 %, weight 15
- `container-title`: 70 %, weight 15
- `DOI`: 100 %, weight 10
- `volume`: 0 %, weight 3
- `page`: 50 %, weight 2

`overall ≈ 0.3*100 + 0.25*92 + 0.15*85 + 0.15*70 + 0.1*100 + 0.03*0 + 0.02*50 = 83.7 → 84`

## UI Thresholds & Colours

Configured in `settings.matching.matchingConfig.displayThresholds` and applied by `getScoreColor`.

- `score >= 85` → `success` (green, strong match).
- `50 <= score < 85` → `warning` (amber, potential match).
- `< 50` → `error` (red).
- `score === 100` → also `success` (highlighted chip).

## Early Termination

- `settings.matching.matchingConfig.earlyTermination` defaults to `{ enabled: true, threshold: 95 }`.
- `useVerification.performVerificationWithEarlyTermination`:
  1. Iterate enabled databases in priority order (`settings.search.databases`).
  2. After each match, check the current score.
  3. Stop querying other databases when the score ≥ threshold.
  4. Without early termination, the workflow completes all searches and re-matches to provide final scores.

`useVerificationProgressStore` tracks phases (`searching`, `matching`, `done`, `error`) per reference.

## TODOs

- **TODO:** Document custom weight presets (`strict`, `balanced`, `custom`) once additional modes ship.
- **TODO:** Provide sample normalisation profiles (e.g. “title + DOI only”).
