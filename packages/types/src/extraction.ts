/**
 * AI extraction-related types
 */
import type { Reference } from './reference'

/**
 * Request to extract references from text using AI
 */
export interface ExtractionRequest {
  /** The text to extract references from */
  text: string
  /** OpenAI model to use (optional, defaults to gpt-4o) */
  model?: string
}

/**
 * Response containing extracted references
 */
export interface ExtractionResponse {
  /** List of extracted references */
  references: Reference[]
}
