import type { FieldWeights, MatchQualityThresholds } from './matching-config.types'

// Default field weights (only available fields)
export const DEFAULT_FIELD_WEIGHTS: FieldWeights = {
  // Core fields (enabled by default)
  title: 25,
  authors: 20,
  year: 5,

  // Identifier fields (most important ones enabled)
  doi: 15,
  arxivId: 8,
  pmid: 3,
  pmcid: 2,
  isbn: 1,
  issn: 1,

  // Source fields (basic ones enabled)
  containerTitle: 10,
  volume: 5,
  issue: 3,
  pages: 2,

  // Additional fields (disabled by default, available for expert users)
  publisher: 0,
  url: 0,
  sourceType: 0,
  conference: 0,
  institution: 0,
  edition: 0,
  articleNumber: 0,
  subtitle: 0,
}

/**
 * Default match quality thresholds
 */
export const DEFAULT_MATCH_QUALITY_THRESHOLDS: MatchQualityThresholds = {
  exactMatchThreshold: 95,
  highMatchThreshold: 70,
}
