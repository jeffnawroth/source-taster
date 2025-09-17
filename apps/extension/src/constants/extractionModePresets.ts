// Mode presets - only normalizationRules needed for frontend

import type { NormalizationRule } from '@source-taster/types'
import { createModePresets } from '@source-taster/types'

const BALANCED_EXTRACTION_RULES: NormalizationRule[] = [
  'normalize-typography',
  'normalize-identifiers',
  'normalize-characters',
  'normalize-whitespace',
  'normalize-accents',
  'normalize-umlauts',
  'normalize-punctuation',
  'normalize-unicode',
  'normalize-lowercase',
]

export const EXTRACTION_MODE_PRESETS = createModePresets<NormalizationRule>(
  BALANCED_EXTRACTION_RULES,
)
