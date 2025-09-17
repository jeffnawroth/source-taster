import type { NormalizationRule } from '@source-taster/types'
import { createModePresets } from '@source-taster/types'

const BALANCED_ACTIONS: NormalizationRule[] = [
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

export const MATCHING_MODE_PRESETS = createModePresets<NormalizationRule>(
  BALANCED_ACTIONS,
)
