/**
 * AI service interfaces and configuration types
 */

import type { ExtractionSettings } from './extraction'

/**
 * Response from AI matching service
 * Contains field-level match scores for each reference
 */
export interface AIMatchingResponse {
  /** Array of field match details */
  fieldDetails: import('./matching').FieldMatchDetail[]
}

/**
 * Represents a reference as extracted by AI (without ID)
 * This matches the structure returned by the AI service before we add the unique ID
 */
export interface AIExtractedReference {
  /** The raw reference text as it appeared in the source document */
  originalText: string
  /** Parsed/extracted bibliographic information */
  metadata: import('./reference').ReferenceMetadata
  /** Information about modifications made during extraction */
  modifications?: import('./reference').FieldModification[]
}

/**
 * Response from AI service containing extracted references (without IDs)
 * This is converted to the public ExtractionResponse before sending to frontend
 */
export interface AIExtractionResponse {
  references: AIExtractedReference[]
}

/**
 * Interface for AI service implementations
 * Defines the contract that all AI services must implement
 */
export interface AIService {
  extractReferences: (text: string, extractionSettings?: ExtractionSettings) => Promise<AIExtractionResponse>
  matchFields: (prompt: string, matchingSettings?: import('./matching').MatchingSettings) => Promise<AIMatchingResponse>
}

/**
 * Configuration interface for OpenAI service
 * Defines all required and optional configuration parameters
 */
export interface OpenAIConfig {
  apiKey: string
  model: string
  maxRetries: number
  timeout: number
  temperature: number
}
