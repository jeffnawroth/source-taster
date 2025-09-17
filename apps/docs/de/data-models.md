---
title: Datenmodelle & Schemas
outline: deep
---

# Datenmodelle & Schemas

Alle Typdefinitionen liegen in `packages/types/src`. Sie werden per Zod validiert und als TypeScript-Deklarationen bereitgestellt.

## CSL-JSON

- **`CSLItemSchema`** – Vollständiges CSL-Item mit `id`, optionalem `type`, Autorenlisten, Datumsfeldern, Identifikatoren (DOI, ISBN, ISSN, `arxivId`, …).
- **`CSLItemWithoutIdSchema`** – Wie oben ohne `id` (für AnyStyle oder LLM-Ausgaben).
- **`CSLVariableSchema`** – Enum aller CSL-Felder, plus Hilfen `CommonCSLVariableSchema` und `CSLVariableWithoutIdSchema`.
- **Utilities (`packages/types/src/csl-utils.ts`)**:
  - `stringifyCSLName`, `stringifyCSLDate`, `stringifyCSLValue`
  - `extractYearFromCSLDate`, `formatCSLDateForDisplay`, `formatAuthorsCompact`

Diese Funktionen werden im Matching und in der UI zur Normalisierung und Darstellung eingesetzt.

## KI & Extraktion

- **`ApiAIProviderSchema`** – `openai`, `anthropic`, `google`, `deepseek`.
- **Modell-Enums** – `ApiOpenAIModelSchema`, `ApiAnthropicModelSchema`, `ApiGoogleModelSchema`, `ApiDeepSeekModelSchema`.
- **`ApiAISettingsSchema`** – `{ provider, model }`, Default `{ openai, gpt-4.1 }`.
- **`ApiExtractRequestSchema`**
  ```ts
  interface ApiExtractRequest {
    text: string
    extractionSettings?: {
      extractionConfig?: {
        variables: CSLVariableWithoutId[]
      }
    }
    aiSettings?: ApiAISettings
  }
  ```
  Defaults decken alle CSL-Felder außer `id` ab.
- **`ApiExtractReferenceSchema`** – `{ id: uuid, originalText: string, metadata: CSLItem }`.

### Dynamische JSON-Schemas

`createDynamicExtractionSchema` erzeugt – abhängig von der Feldauswahl – ein JSON-Schema für `response_format=json_schema`. Fällt der Provider zurück, nutzt die API `json_object` mit Schemahinweisen im Prompt.

## Suche

- **`ApiSearchRequestSchema`** – `references: ApiSearchReference[]`.
- **`ApiSearchSourceSchema`** – `openalex | crossref | semanticscholar | europepmc | arxiv`.
- **`ApiSearchCandidateSchema`** – `{ id: uuid, source, metadata: CSLItem, url? }`.
- **`ApiSearchDataSchema`** – `{ results: { referenceId, candidates[] }[] }`.

## Matching

- **Normalisierungsregeln (`ApiMatchNormalizationRuleSchema`)**: `normalize-typography`, `normalize-lowercase`, `normalize-identifiers`, `normalize-characters`, `normalize-whitespace`, `normalize-accents`, `normalize-umlauts`, `normalize-punctuation`, `normalize-unicode`, `normalize-urls`, `match-structured-dates`, `match-author-initials`, `match-volume-issue-numeric`, `match-page-range-overlap`, `match-container-title-variants`.
- **`ApiMatchFieldConfigSchema`** – `enabled: boolean`, `weight: number (0–100)`.
- **Default-Konfiguration** (`createDefaultFieldConfigurations`):
  | Feld | Gewicht |
  | --- | --- |
  | `title` | 30 |
  | `author` | 25 |
  | `issued` | 15 |
  | `container-title` | 15 |
  | `DOI` | 10 |
  | `volume` | 3 |
  | `page` | 2 |
- **`ApiMatchMatchingSettingsSchema`** – `{ matchingStrategy, matchingConfig }`, Default `balanced` plus vollständige Normalisierung.
- **Antwort (`ApiMatchResponseSchema`)** – `{ evaluations: [{ candidateId, matchDetails: { overallScore, fieldDetails[] } }] }`.

Siehe [Matching & Scoring](matching-scoring.md) für Details.

## AnyStyle

- **`ApiAnystyleParseRequestSchema`** – `{ input: string[] }` → Token-Arrays.
- **`ApiAnystyleConvertRequestSchema`** – `{ references: [{ id, tokens }] }` → `CSLItemWithoutId[]`.

## Nutzer & UI

- **`ApiUserAISecretsRequestSchema`** – Speichert einen API-Key `{ provider, apiKey }`.
- **`ApiUserAISecretsInfoDataSchema`** – `{ hasApiKey: boolean, provider?: ApiAIProvider }`.

### UI-Settings (`packages/types/src/frontend/settings.ts`)

- **Allgemein** – `theme: light|dark|system` (Default `system`), `locale: en|de` (Default `en`).
- **Suche (`settings.search.databases`)** – Liste mit `enabled`, `priority`. Defaults:
  1. openalex (1)
  2. crossref (2)
  3. semanticscholar (3)
  4. europepmc (4, deaktiviert)
  5. arxiv (5, deaktiviert)
- **Extraktion (`settings.extract`)** – `extractionConfig.variables` (Standard: alle Felder), `useAi`-Flag (Default `false`).
- **Matching (`settings.matching`)** – Strategie/Konfiguration wie im Backend, zusätzlich:
  - `earlyTermination`: `{ enabled: true, threshold: 95 }`
  - `displayThresholds`: `{ strongMatchThreshold: 85, possibleMatchThreshold: 50 }`
- **AI (`settings.ai`)** – `{ provider, model, canUseAI }`; `canUseAI` nur `true`, wenn ein Key gespeichert ist.

## Hilfsfunktionen & Services

- **`NormalizationService`** (API) wendet Regeln deterministisch an (`normalize-typography` → … → `normalize-lowercase`).
- **`MetadataComparator`** filtert sinnvolle Felder gemäß Aktivierung.
- **`similarity.ts` / `similarityHelpers.ts`** liefern Datums-Parsing, Namensvergleich und Damerau-Levenshtein.

## TODOs

- **TODO:** Entscheiden, ob der Provider `deepseek` in der UI auswählbar sein soll.
- **TODO:** Dokumentieren, wie `DEFAULT_UI_SETTINGS` bei Storage-Migrationen angepasst werden.
