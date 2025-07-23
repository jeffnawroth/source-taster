import type { ExtractionSettings } from './extraction-settings.types'
import { ESSENTIAL_EXTRACTION_CONFIG } from './extraction-config.constants'
import { DEFAULT_PROCESSING_STRATEGY } from './processing-strategy.constants'

/**
 * Complete default extraction settings
 * Uses balanced mode with standard field selection
 */
export const DEFAULT_EXTRACTION_SETTINGS: ExtractionSettings = {
  processingStrategy: DEFAULT_PROCESSING_STRATEGY,
  extractionConfig: ESSENTIAL_EXTRACTION_CONFIG,
}
