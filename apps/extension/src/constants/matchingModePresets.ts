import type { ApiMatchNormalizationRule } from '@source-taster/types'

const BALANCED_ACTIONS: ApiMatchNormalizationRule[] = [
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
] as const

function createModePresets<T extends string>(actions: T[]) {
  return {
    balanced: actions,
  }
}

export const MATCHING_MODE_PRESETS = createModePresets<ApiMatchNormalizationRule>(
  BALANCED_ACTIONS,
)
