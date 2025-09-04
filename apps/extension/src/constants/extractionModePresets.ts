// Mode presets - only actionTypes needed for frontend

import type { ExtractionActionType } from '@source-taster/types'
import { createModePresets } from '@source-taster/types'

const BALANCED_ACTIONS: ExtractionActionType[] = [
  'normalize-spelling',
  'normalize-typography',
  'normalize-title-case',
  'normalize-identifiers',
  'normalize-characters',
  'normalize-whitespace',
] as const

export const EXTRACTION_MODE_PRESETS = createModePresets<ExtractionActionType>(
  BALANCED_ACTIONS,
)
