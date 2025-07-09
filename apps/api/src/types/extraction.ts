import type { ReferenceMetadata } from '@source-taster/types'

/**
 * Represents a reference as extracted by AI (without ID)
 * This matches the structure returned by the AI service before we add the unique ID
 * This is a backend-internal type and should not be exposed to the frontend
 */
export interface ExtractedReference {
  /** The raw reference text as it appeared in the source document */
  originalText: string
  /** Parsed/extracted bibliographic information */
  metadata: ReferenceMetadata
}

export interface ExtractionResponse {
  references: ExtractedReference[]
}
