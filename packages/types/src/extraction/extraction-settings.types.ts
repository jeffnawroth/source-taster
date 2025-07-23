/**
 * Main extraction settings configuration
 * Combines extraction modes, custom options, and field selections
 */

import type { ExtractionConfig } from './extraction-config.types'
import type { ProcessingStrategy } from './processing-strategy.types'

/**
 * User-configurable extraction settings
 * Controls both AI behavior and which metadata fields should be extracted
 */
export interface ExtractionSettings {
  processingStrategy: ProcessingStrategy

  /** Which metadata fields to extract */
  extractionConfig: ExtractionConfig
}
