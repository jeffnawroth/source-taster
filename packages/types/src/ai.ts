/**
 * AI service interfaces and configuration types
 */

/**
 * Single field match detail from AI (without weight)
 * Used internally by AI services
 */
export interface AIFieldMatchDetail {
  /** Name of the field being compared (e.g., 'title', 'authors') */
  field: string
  /** Match score for this specific field (0-100) */
  match_score: number
}

/**
 * Response from AI verification service
 * Contains field-level match scores for each reference
 */
export interface AIVerificationResponse {
  /** Array of field match details */
  fieldDetails: AIFieldMatchDetail[]
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
  extractReferences: (text: string) => Promise<AIExtractionResponse>
  verifyMatch: (prompt: string) => Promise<AIVerificationResponse>
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

/**
 * Request to verify references against databases
 * Backend-only type - the frontend sends VerificationRequest
 */
export interface VerificationRequest {
  /** References to verify */
  references: import('./reference').Reference[]
  /** Field weights for verification (provided by frontend) */
  fieldWeights: import('./verification').FieldWeights
}
