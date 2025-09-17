---
title: Matching & Scoring
outline: deep
---

# Matching & Scoring

## Engine

`apps/api/src/services/matching/engines/deterministicEngine.ts`

- Nutzt `NormalizationService` zur Vorverarbeitung.
- Berechnet Ähnlichkeiten via `similarity()` (Damerau-Levenshtein) plus Spezialbehandlung für Autor:innen, Daten, Container-Titel, Volume/Issue und Seiten.
- Aggregiert Feld-Scores (0–100) anhand der aktivierten Gewichte.

## Normalisierung (Reihenfolge)

Quelle: `NormalizationService.normalize`:

1. `normalize-typography` – Typografie (Smart Quotes, Gedankenstriche, Ellipse).
2. `normalize-characters` – korrigiert defekte Zeichen.
3. `normalize-urls` – via `normalize-url` (Tracking-Parameter entfernen, Query sortieren).
4. `normalize-identifiers` – bereinigt DOI-/URL-Präfixe.
5. `normalize-umlauts` – z. B. `ä → ae`, `ß → ss`.
6. `normalize-accents` – Unicode-Dekomposition, entfernt Diakritika.
7. `normalize-unicode` – `NFKC`, entfernt Zero-Width-Zeichen.
8. `normalize-punctuation` – reduziert auf Buchstaben/Zahlen/Leerzeichen.
9. `normalize-whitespace` – Trim, Mehrfach-Leerzeichen entfernen.
10. `normalize-lowercase` – Kleinschreibung.

Nur aktivierte Regeln werden angewendet.

## Feld-Heuristiken

- **Autor:innen (`match-author-initials`)** – Familiennamen (exakt oder ≥0,9) und Initialen per `tokenizeGiven`/`isSubsequence`.
- **Datum (`match-structured-dates`)** – CSL-Daten (`date-parts`, `raw`, `literal`) mit Gewichtung `year` 0,8, `month` 0,15, `day` 0,05.
- **Volume/Issue (`match-volume-issue-numeric`)** – extrahiert Zahlen und vergleicht das erste Vorkommen.
- **Seiten (`match-page-range-overlap`)** – erkennt Bereiche, erweitert Kurzschreibungen („123-8“) und berechnet das Schnittmenge/Vereinigung-Verhältnis. Einzelseite vs. Bereich → 1,0, wenn enthalten.
- **Container-Titel (`match-container-title-variants`)** – entfernt Akronyme in Klammern, testet Varianten, nutzt Damerau-Levenshtein.

## Score-Berechnung

```ts
overall = sum(fieldScore * weight) / sum(weight)
```

- `fieldScore` liegt bereits zwischen 0 und 100.
- Felder ohne Inhalte werden ignoriert (`MetadataComparator`).
- Ergebnisse werden absteigend sortiert (`MatchingCoordinator`).

### Beispiel

- `title`: 100 %, Gewicht 30
- `author`: 92 %, Gewicht 25
- `issued`: 85 %, Gewicht 15
- `container-title`: 70 %, Gewicht 15
- `DOI`: 100 %, Gewicht 10
- `volume`: 0 %, Gewicht 3
- `page`: 50 %, Gewicht 2

`overall ≈ 0.3*100 + 0.25*92 + 0.15*85 + 0.15*70 + 0.1*100 + 0.03*0 + 0.02*50 = 83,7 → 84`

## UI-Schwellen & Farben

Konfiguriert in `settings.matching.matchingConfig.displayThresholds` und umgesetzt durch `getScoreColor`.

- `score >= 85` → `success` (grün, starker Treffer).
- `50 <= score < 85` → `warning` (orange, möglicher Treffer).
- `< 50` → `error` (rot).
- `score === 100` → ebenfalls `success` (hervorgehobener Chip).

## Early Termination

- `settings.matching.matchingConfig.earlyTermination` Standard `{ enabled: true, threshold: 95 }`.
- `useVerification.performVerificationWithEarlyTermination`:
  1. Aktivierte Datenbanken in Prioritätsreihenfolge (`settings.search.databases`).
  2. Nach jeder Suche Score prüfen.
  3. Bei Score ≥ Threshold weitere Datenbanken überspringen.
  4. Ohne Early Termination werden alle Datenbanken abgefragt und abschließend erneut gematcht.

`useVerificationProgressStore` verfolgt Phasen (`searching`, `matching`, `done`, `error`) pro Referenz.

## TODOs

- **TODO:** Dokumentieren, wie alternative Gewichtsschemata (`strict`, `balanced`, `custom`) eingesetzt werden, sobald verfügbar.
- **TODO:** Beispiele für individuelle Normalisierungsprofile (z. B. „nur Titel + DOI“) ergänzen.
