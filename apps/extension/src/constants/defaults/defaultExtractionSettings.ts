import type { ExtractionConfig, ExtractionSettings, ExtractionStrategy, Mode } from '@source-taster/types'
import { EXTRACTION_MODE_PRESETS } from '../extractionModePresets'

/**
 * Default extraction mode
 */
export const DEFAULT_EXTRACTION_MODE: Mode = 'balanced'

export const DEFAULT_EXTRACTION_STRATEGY: ExtractionStrategy = {
  mode: DEFAULT_EXTRACTION_MODE,
  actionTypes: EXTRACTION_MODE_PRESETS[DEFAULT_EXTRACTION_MODE],
}

// Essential extraction configuration for basic metadata extraction
// This includes only the most critical fields needed for reference identification
export const ESSENTIAL_EXTRACTION_CONFIG: ExtractionConfig = {
  fields: [
    // Core bibliographic information
    'title',
    'authors',
    'year',

    // Publication identifiers
    'doi',
    'url',

    // Publication context
    'containerTitle',
    'volume',
    'issue',
    'pages',
  ],
}

/**
 * Complete default extraction settings
 * Uses balanced mode with standard field selection
 */
export const DEFAULT_EXTRACTION_SETTINGS: ExtractionSettings = {
  extractionStrategy: DEFAULT_EXTRACTION_STRATEGY,
  extractionConfig: ESSENTIAL_EXTRACTION_CONFIG,
}
