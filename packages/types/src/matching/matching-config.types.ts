export interface MatchingConfig {
  fieldWeights: FieldWeights
  matchThresholds: MatchQualityThresholds
}

/**
 * Weights for different fields in match score calculation
 */
export interface FieldWeights {
  // Core bibliographic fields (primary matching)
  /** Weight for title matching (typically highest) */
  title?: number
  /** Weight for author matching (typically high) */
  authors?: number
  /** Weight for publication year matching */
  year?: number

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
  /** Weight for subtitle matching (important for German citation styles) */
  subtitle?: number
}

/**
 * Match quality classes for visual representation
 */
export enum MatchQuality {
  /** Excellent match (95-100%) - Green */
  EXACT = 'exact',
  /** Good match (70-94%) - Orange */
  HIGH = 'high',
  /** Poor or no match (0-69%) - Red */
  NONE = 'none',
}

/**
 * Thresholds for match quality classification
 */
export interface MatchQualityThresholds {
  /** Minimum score for exact match (default: 95) */
  exactMatchThreshold: number
  /** Minimum score for high quality match (default: 70) */
  highMatchThreshold: number
  /** Scores below this are considered no match (implicit: 0) */
}
