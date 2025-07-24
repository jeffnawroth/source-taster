/**
 * AI service interfaces and configuration types
 */

import type { ExtractionSettings } from './extraction/extraction-settings.types'
import type { FieldMatchDetail, MatchingSettings } from './matching'
import z from 'zod'
import { ProcessingActionType } from './extraction'
import { ReferenceMetadataSchema } from './reference'

/**
 * Response from AI matching service
 * Contains field-level match scores for each reference
 */
export interface AIMatchingResponse {
  /** Array of field match details */
  fieldDetails: FieldMatchDetail[]
}

export const FieldProcessingResultSchema = z.object({
  fieldPath: z.string().describe('The field path that was processed (e.g., "metadata.title", "metadata.source.containerTitle")'),
  originalValue: z.string().describe('The original value before processing'),
  processedValue: z.string().describe('The value after processing'),
  actionTypes: z.array(z.nativeEnum(ProcessingActionType)).describe('Type of processing actions applied'),
})

export type FieldProcessingResult = z.infer<typeof FieldProcessingResultSchema>

export const AIExtractedReferenceSchema = z.object({
  originalText: z.string().describe('The raw reference text as it appeared in the source document'),
  metadata: ReferenceMetadataSchema.describe('Parsed/extracted bibliographic information'),
  processingResults: z.array(FieldProcessingResultSchema).optional().describe('Information about modifications made'),
})

export type AIExtractedReference = z.infer<typeof AIExtractedReferenceSchema>

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
  extractReferences: (text: string, extractionSettings: ExtractionSettings) => Promise<AIExtractionResponse>
  matchFields: (prompt: string, matchingSettings: MatchingSettings) => Promise<AIMatchingResponse>
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
