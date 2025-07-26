/**
 * Field definitions for metadata extraction
 * Controls which metadata fields should be extracted by the AI
 */
import type { ReferenceMetadataDateFields, ReferenceMetadataIdentifierFields, ReferenceMetadataSourceFields, ReferenceMetadataTopLevelFields } from '../reference'

// Union-Typ für alle extrahierbaren Felder (ohne Container-Objekte)
export type ExtractableField =
  | ReferenceMetadataTopLevelFields
  | ReferenceMetadataDateFields
  | ReferenceMetadataSourceFields
  | ReferenceMetadataIdentifierFields

export interface ExtractionConfig {
  /** Array of fields that should be extracted from the source text */
  fields: ExtractableField[]
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
