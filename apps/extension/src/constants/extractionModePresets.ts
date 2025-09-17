// Mode presets - only actionTypes needed for frontend

import type { ExtractionActionType } from '@source-taster/types'
import { createModePresets } from '@source-taster/types'

const BALANCED_ACTIONS: ExtractionActionType[] = [
  'normalize-spelling',
  'normalize-typography',
  'normalize-title-case',
  // 'normalize-abbreviations',
  // 'normalize-author-names',
  // 'normalize-date-format',
  'normalize-identifiers',
  'normalize-characters',
  'normalize-whitespace',
] as const

const TOLERANT_ACTIONS: ExtractionActionType[] = [] as const

export const EXTRACTION_MODE_PRESETS = createModePresets<ExtractionActionType>(
  BALANCED_ACTIONS,
  TOLERANT_ACTIONS,
)
