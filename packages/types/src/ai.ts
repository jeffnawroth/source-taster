/**
 * AI service interfaces and configuration types
 */

import type { ExtractionRequest } from './extraction'
import type { APIMatchingSettings, FieldMatchDetail } from './matching'
import type { ReferenceMetadataFields } from './reference/reference.constants'
import z from 'zod'
import { AIExtractedReferenceSchema } from './reference'

/**
 * Response from AI matching service
 * Contains field-level match scores for each reference
 */
export interface AIMatchingResponse {
  /** Array of field match details */
  fieldDetails: FieldMatchDetail[]
}

/**
 * Response from AI service containing extracted references (without IDs)
 * This is converted to the public ExtractionResponse before sending to frontend
 */
export const AIExtractionResponseSchema = z.object({
  references: z.array(AIExtractedReferenceSchema).describe('Array of extracted references'),
})

export type AIExtractionResponse = z.infer<typeof AIExtractionResponseSchema>

/**
 * Interface for AI service implementations
 * Defines the contract that all AI services must implement
 */
export interface AIService {
  extractReferences: (extractionRequest: ExtractionRequest) => Promise<AIExtractionResponse>
  matchFields: (prompt: string, matchingSettings: APIMatchingSettings, availableFields: ReferenceMetadataFields[]) => Promise<AIMatchingResponse>
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
