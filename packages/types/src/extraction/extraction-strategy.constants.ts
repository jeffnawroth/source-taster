import type { ExtractionActionType, ExtractionStrategy } from './extraction-strategy.types'
import { createModePresets, type Mode } from '../common/mode'

/**
 * Default extraction mode
 */
export const DEFAULT_PROCESSING_MODE: Mode = 'balanced'

// Mode presets - only actionTypes needed for frontend

const BALANCED_ACTIONS: ExtractionActionType[] = [
  'normalize-spelling',
  'normalize-typography',
  'normalize-title-case',
  'normalize-abbreviations',
  'normalize-author-names',
  'normalize-date-format',
  'normalize-identifiers',
  'normalize-characters',
  'normalize-whitespace',
] as const

const TOLERANT_ACTIONS: ExtractionActionType[] = [

] as const

export const PROCESSING_MODE_PRESETS = createModePresets<ExtractionActionType>(
  BALANCED_ACTIONS,
  TOLERANT_ACTIONS,
)

export const DEFAULT_PROCESSING_STRATEGY: ExtractionStrategy = {
  mode: DEFAULT_PROCESSING_MODE,
  actionTypes: PROCESSING_MODE_PRESETS[DEFAULT_PROCESSING_MODE],
}
