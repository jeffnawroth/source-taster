/**
 * API types for extraction requests and responses
 */

import type { Reference } from '../reference'
import type { ExtractionSettings } from './settings'

/**
 * Request to extract references from text using AI
 */
export interface ExtractionRequest {
  /** The text to extract references from */
  text: string
  /** User-configurable extraction settings */
  extractionSettings?: ExtractionSettings
}

/**
 * Response containing extracted references
 */
export interface ExtractionResponse {
  /** List of extracted references */
  references: Reference[]
}
