---
title: Data Models & Schemas
outline: deep
---

# Data Models & Schemas

Shared type definitions live in `packages/types/src`. They are validated with Zod and compiled to TypeScript declarations.

## CSL-JSON

- **`CSLItemSchema`** – full CSL item with `id`, optional `type`, contributor arrays, date fields, identifiers (DOI, ISBN, ISSN, `arxivId`, etc.).
- **`CSLItemWithoutIdSchema`** – same structure without `id` (used for AnyStyle and LLM output).
- **`CSLVariableSchema`** – enum of all CSL keys, plus helpers `CommonCSLVariableSchema` and `CSLVariableWithoutIdSchema`.
- **Utility functions (`packages/types/src/csl-utils.ts`)**:
  - `stringifyCSLName`, `stringifyCSLDate`, `stringifyCSLValue`
  - `extractYearFromCSLDate`, `formatCSLDateForDisplay`, `formatAuthorsCompact`

The utilities are used by the matching engine and the UI to format or normalise CSL data.

## AI & Extraction

- **`ApiAIProviderSchema`** – `openai`, `anthropic`, `google`, `deepseek`.
- **Model enums** – `ApiOpenAIModelSchema`, `ApiAnthropicModelSchema`, `ApiGoogleModelSchema`, `ApiDeepSeekModelSchema`.
- **`ApiAISettingsSchema`** – `{ provider, model }`, default `{ openai, gpt-4.1 }`.
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
  Defaults cover all CSL fields except `id`.
- **`ApiExtractReferenceSchema`** – `{ id: uuid, originalText: string, metadata: CSLItem }`.

### Dynamic JSON Schemas

`createDynamicExtractionSchema` generates a JSON schema tailored to the selected variables for `response_format=json_schema`. If the provider lacks support, the API falls back to `json_object` with schema hints embedded in the prompt.

## Search

- **`ApiSearchRequestSchema`** – `references: ApiSearchReference[]`.
- **`ApiSearchSourceSchema`** – `openalex | crossref | semanticscholar | europepmc | arxiv`.
- **`ApiSearchCandidateSchema`** – `{ id: uuid, source, metadata: CSLItem, url? }`.
- **`ApiSearchDataSchema`** – `{ results: { referenceId, candidates[] }[] }`.

## Matching

- **Normalisation rules (`ApiMatchNormalizationRuleSchema`)**:
  `normalize-typography`, `normalize-lowercase`, `normalize-identifiers`, `normalize-characters`, `normalize-whitespace`, `normalize-accents`, `normalize-umlauts`, `normalize-punctuation`, `normalize-unicode`, `normalize-urls`, `match-structured-dates`, `match-author-initials`, `match-volume-issue-numeric`, `match-page-range-overlap`, `match-container-title-variants`.
- **`ApiMatchFieldConfigSchema`** – `enabled: boolean`, `weight: number (0–100)`.
- **Default configuration** (`createDefaultFieldConfigurations`):
  | Field | Weight |
  | --- | --- |
  | `title` | 30 |
  | `author` | 25 |
  | `issued` | 15 |
  | `container-title` | 15 |
  | `DOI` | 10 |
  | `volume` | 3 |
  | `page` | 2 |
- **`ApiMatchMatchingSettingsSchema`** – `{ matchingStrategy, matchingConfig }`, default `balanced` plus the full normalisation set.
- **Response (`ApiMatchResponseSchema`)** – `{ evaluations: [{ candidateId, matchDetails: { overallScore, fieldDetails[] } }] }`.

See [Matching & Scoring](matching-scoring.md) for heuristics.

## AnyStyle

- **`ApiAnystyleParseRequestSchema`** – `{ input: string[] }` → returns token tuples.
- **`ApiAnystyleConvertRequestSchema`** – `{ references: [{ id, tokens }] }` → returns `CSLItemWithoutId[]`.

## User & UI

- **`ApiUserAISecretsRequestSchema`** – stores an API key `{ provider, apiKey }`.
- **`ApiUserAISecretsInfoDataSchema`** – `{ hasApiKey: boolean, provider?: ApiAIProvider }`.

### UI Settings (`packages/types/src/frontend/settings.ts`)

- **General** – `theme: light|dark|system` (default `system`), `locale: en|de` (default `en`).
- **Search (`settings.search.databases`)** – list with `enabled`, `priority`. Defaults:
  1. openalex (1)
  2. crossref (2)
  3. semanticscholar (3)
  4. europepmc (4, disabled)
  5. arxiv (5, disabled)
- **Extraction (`settings.extract`)** – `extractionConfig.variables` (defaults to all fields).
- **Matching (`settings.matching`)** – strategy/config mirroring backend defaults, plus:
  - `earlyTermination`: `{ enabled: true, threshold: 95 }`
  - `displayThresholds`: `{ strongMatchThreshold: 85, possibleMatchThreshold: 50 }`
- **AI (`settings.ai`)** – `{ provider, model, canUseAI }`; `canUseAI` is true only when a key is stored.

## Helpers & Services

- **`NormalizationService`** (API) applies rules in a deterministic order (`normalize-typography` → … → `normalize-lowercase`).
- **`MetadataComparator`** filters meaningful fields and respects enabled configuration.
- **`similarity.ts` / `similarityHelpers.ts`** provide date parsing, name similarity, and Damerau-Levenshtein utilities.

## TODOs

- **TODO:** Decide whether the new `deepseek` provider should surface in the UI selector.
- **TODO:** Document how to migrate `DEFAULT_UI_SETTINGS` when storage versions change.
