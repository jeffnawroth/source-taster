import type { ApiMatchMode, ApiMatchNormalizationRule } from '@source-taster/types'

export const BALANCED_NORMALIZATION_RULES: ApiMatchNormalizationRule[] = [
  'normalize-typography',
  'normalize-lowercase',
  'normalize-identifiers',
  'normalize-characters',
  'normalize-whitespace',
  'normalize-accents',
  'normalize-umlauts',
  'normalize-punctuation',
  'normalize-unicode',
  'normalize-urls',
  'match-structured-dates',
  'match-author-initials',
  'match-volume-issue-numeric',
  'match-page-range-overlap',
  'match-container-title-variants',
] as const

function createModePresets<T extends string>(actions: T[]): Record<ApiMatchMode, T[]> {
  return {
    strict: [] as T[],
    balanced: actions,
    custom: [] as T[],
  }
}

export const MATCHING_MODE_PRESETS = createModePresets<ApiMatchNormalizationRule>(
  BALANCED_NORMALIZATION_RULES,
)
