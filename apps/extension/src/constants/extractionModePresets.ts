// Mode presets - only normalizationRules needed for frontend

import type { NormalizationRule } from '@source-taster/types'
import { createModePresets } from '@source-taster/types'

const BALANCED_ACTIONS: NormalizationRule[] = [
  'normalize-spelling',
  'normalize-typography',
  'normalize-title-case',
  'normalize-identifiers',
  'normalize-characters',
  'normalize-whitespace',
] as const

export const EXTRACTION_MODE_PRESETS = createModePresets<NormalizationRule>(
  BALANCED_ACTIONS,
)
