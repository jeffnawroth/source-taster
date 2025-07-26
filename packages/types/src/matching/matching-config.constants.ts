import type { FieldWeights, MatchQualityThresholds } from './matching-config.types'

// Default field weights (only available fields)
export const DEFAULT_FIELD_WEIGHTS: FieldWeights = {
  title: 25,
  authors: 20,
  date: {
    year: 5,
  },
  identifiers: {
    doi: 15,
    arxivId: 8,
    pmid: 3,
    pmcid: 2,
    isbn: 1,
    issn: 1,
  },
  source: {
    containerTitle: 10,
    volume: 5,
    issue: 3,
    pages: 2,
  },

}

/**
 * Default match quality thresholds
 */
export const DEFAULT_MATCH_QUALITY_THRESHOLDS: MatchQualityThresholds = {
  exactMatchThreshold: 95,
  highMatchThreshold: 70,
}
