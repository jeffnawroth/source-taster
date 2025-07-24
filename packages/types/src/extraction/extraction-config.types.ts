/**
 * Field definitions for metadata extraction
 * Controls which metadata fields should be extracted by the AI
 */

import type { DateInfo, ExternalIdentifiers, ReferenceMetadata, SourceInfo } from '../reference'

// Nur die gewünschten Top-Level-Felder (ohne date, source, identifiers)
type AllowedTopLevelFields = Extract<keyof ReferenceMetadata, 'authors' | 'title'>

// Typ für alle verfügbaren DateInfo-Felder
type DateFields = keyof DateInfo

// Typ für alle verfügbaren SourceInfo-Felder
type SourceFields = keyof SourceInfo

// Typ für alle verfügbaren ExternalIdentifiers-Felder
type IdentifierFields = keyof ExternalIdentifiers

// Union-Typ für alle extrahierbaren Felder (ohne Container-Objekte)
export type ExtractableField =
  | AllowedTopLevelFields
  | DateFields
  | SourceFields
  | IdentifierFields

// Typ für das Extraktions-Array
export type ExtractionConfig = ExtractableField[]
