/**
 * Single field match detail
 *
 */
export interface FieldMatchDetail {
  /** Name of the field being compared (e.g., 'title', 'authors') */
  field: keyof FieldWeights
  /** Match score for this specific field (0-100) */
  match_score: number
}

/**
 * Overall match details including final score and field-specific details
 */
export interface MatchDetails {
  /** Final weighted score: Σ(match_score * weight) / Σ(weights) */
  overallScore: number
  /** Detailed scoring per field */
  fieldDetails?: FieldMatchDetail[]
}

/**
 * Weights for different fields in match score calculation
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
  /** Weight for subtitle matching (important for German citation styles) */
  subtitle?: number
}
