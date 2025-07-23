/**
 * Field definitions for metadata extraction
 * Controls which metadata fields should be extracted by the AI
 */

import type { DateInfo, ExternalIdentifiers, ReferenceMetadata, SourceInfo } from '../reference'

type ExtractionFieldType<T> = { [K in keyof T]?: boolean }

export type DateInfoExtractionConfig = ExtractionFieldType<DateInfo>
export type SourceInfoExtractionConfig = ExtractionFieldType<SourceInfo>
export type ExternalIdentifiersExtractionConfig = ExtractionFieldType<ExternalIdentifiers>

/**
 * Configuration for which metadata fields to extract
 * Includes ALL fields from ReferenceMetadata structure
 */
export type ExtractionConfig = {
  [K in keyof ReferenceMetadata]?:
  K extends 'date' ? DateInfoExtractionConfig :
    K extends 'source' ? SourceInfoExtractionConfig :
      K extends 'identifiers' ? ExternalIdentifiersExtractionConfig :
        boolean
}
