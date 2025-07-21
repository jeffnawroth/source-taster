/**
 * Main extraction settings configuration
 * Combines extraction modes, custom options, and field selections
 */

import type { ExtractionFields } from './fields'
import type { CustomExtractionSettings, ExtractionMode } from './modes'
import { DEFAULT_EXTRACTION_FIELDS } from './fields'
import { DEFAULT_EXTRACTION_MODE } from './modes'

/**
 * User-configurable extraction settings
 * Controls both AI behavior and which metadata fields should be extracted
 */
export interface ExtractionSettings {
  /** Extraction mode controlling AI behavior and accuracy vs tolerance */
  extractionMode: ExtractionMode

  /** Custom extraction configuration (only used when extractionMode is CUSTOM) */
  customSettings?: CustomExtractionSettings

  /** Which metadata fields to extract */
  enabledFields: ExtractionFields
}

/**
 * Complete default extraction settings
 * Uses balanced mode with standard field selection
 */
export const DEFAULT_EXTRACTION_SETTINGS: ExtractionSettings = {
  extractionMode: DEFAULT_EXTRACTION_MODE,
  customSettings: undefined,
  enabledFields: DEFAULT_EXTRACTION_FIELDS,
}
