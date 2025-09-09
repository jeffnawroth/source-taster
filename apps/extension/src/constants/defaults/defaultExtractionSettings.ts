// Essential extraction configuration for basic metadata extraction

import type { ApiExtractExtractionConfig, ApiExtractExtractionSettings } from '@source-taster/types'

// This includes only the most critical fields needed for reference identification
export const ESSENTIAL_EXTRACTION_CONFIG: ApiExtractExtractionConfig = {
  variables: [
    // Core bibliographic information
    'title',
    'author',
    'issued',

    // Publication identifiers
    'DOI',
    'URL',

    // Publication context
    'container-title',
    'volume',
    'issue',
    'page',
  ],
}

/**
 * Complete default extraction settings
 * Uses balanced mode with standard field selection
 */
export const DEFAULT_EXTRACTION_SETTINGS: ApiExtractExtractionSettings = {
  extractionConfig: ESSENTIAL_EXTRACTION_CONFIG,
}
