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
  /** AI service to use */
  aiService: 'openai' | 'gemini'
  /** AI model to use (optional) */
  model?: string
}

/**
 * Response containing extracted references
 */
export interface ExtractionResponse {
  /** List of extracted references */
  references: Reference[]
}
