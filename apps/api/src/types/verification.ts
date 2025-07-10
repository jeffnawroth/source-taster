/**
 * Backend-specific verification types
 */
import type { Reference } from '@source-taster/types'

/**
 * Request to verify references against databases
 * Backend-only type - the frontend just sends { references: Reference[] }
 */
export interface VerificationRequest {
  /** References to verify */
  references: Reference[]
}

/**
 * Weights for different fields in match score calculation
 * Adjusted for the new hierarchical ReferenceMetadata structure
 * Core fields should sum to ~80-90, with optional fields adding extra confidence
 */
export interface FieldWeights {
  // Core bibliographic fields (primary matching)
  /** Weight for title matching (typically highest) */
  title: number
  /** Weight for author matching (typically high) */
  authors: number
  /** Weight for publication year matching */
  year: number

  // External identifiers (exact matches, very high confidence)
  /** Weight for DOI matching (exact match, when available) */
  doi?: number
  /** Weight for ISBN matching (exact match) */
  isbn?: number
  /** Weight for ISSN matching */
  issn?: number
  /** Weight for PMID matching (exact match) */
  pmid?: number
  /** Weight for PMC ID matching (exact match) */
  pmcid?: number
  /** Weight for arXiv ID matching (exact match) */
  arxivId?: number

  // Source information weights
  /** Weight for container title matching (journal name, book title) */
  containerTitle?: number
  /** Weight for volume number matching */
  volume?: number
  /** Weight for issue number matching */
  issue?: number
  /** Weight for page range matching */
  pages?: number
  /** Weight for publisher matching */
  publisher?: number
  /** Weight for URL matching */
  url?: number

  // Additional source fields (lower weights, boost confidence)
  /** Weight for source type matching */
  sourceType?: number
  /** Weight for conference name matching */
  conference?: number
  /** Weight for institution matching */
  institution?: number
  /** Weight for edition matching */
  edition?: number
  /** Weight for article number matching */
  articleNumber?: number
  /** Weight for retrieval date matching */
  retrievalDate?: number
  /** Weight for subtitle matching (important for German citation styles) */
  subtitle?: number
  /** Weight for publication place matching */
  publicationPlace?: number
  /** Weight for series name matching */
  series?: number
  /** Weight for chapter title matching */
  chapterTitle?: number
  /** Weight for medium matching (important for MLA) */
  medium?: number
  /** Weight for original title matching (for translated works) */
  originalTitle?: number
  /** Weight for degree matching (for theses) */
  degree?: number
  /** Weight for advisor matching (for theses) */
  advisor?: number
  /** Weight for description/abstract matching (for websites) */
  description?: number
}

/**
 * Single field match detail from AI (without weight)
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
