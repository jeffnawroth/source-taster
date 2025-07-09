import type { ReferenceMetadata } from '@source-taster/types'

/**
 * Backend-specific extraction types
 */

/**
 * Represents a reference as extracted by AI (without ID)
 * This matches the structure returned by the AI service before we add the unique ID
 * This is a backend-internal type and should not be exposed to the frontend
 */
export interface AIExtractedReference {
  /** The raw reference text as it appeared in the source document */
  originalText: string
  /** Parsed/extracted bibliographic information */
  metadata: ReferenceMetadata
}

/**
 * Response from AI service containing extracted references (without IDs)
 * This is converted to the public ExtractionResponse before sending to frontend
 */
export interface AIExtractionResponse {
  references: AIExtractedReference[]
}
