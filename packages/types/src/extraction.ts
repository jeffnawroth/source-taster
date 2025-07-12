/**
 * AI extraction-related types
 */
import type { ExtractionSettings } from './ai'
import type { Reference } from './reference'

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
