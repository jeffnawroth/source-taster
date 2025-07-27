/**
 * Field definitions for metadata extraction
 * Controls which metadata fields should be extracted by the AI
 */
import type { ReferenceMetadataFields } from '../reference'

export interface ExtractionConfig {
  /** Array of fields that should be extracted from the source text */
  fields: ReferenceMetadataFields[]
}

export enum FieldCategory {
  ESSENTIAL = 'essential',
  CORE = 'core',
  IDENTIFIER = 'identifier',
  DATE = 'date',
  PUBLICATION = 'publication',
  ACADEMIC = 'academic',
  TECHNICAL = 'technical',
}
