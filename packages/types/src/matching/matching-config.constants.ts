import type { EarlyTerminationConfig, FieldConfigurations, MatchQualityThresholds } from './matching-config.types'

// Default field configurations
export const DEFAULT_FIELDS_CONFIG: FieldConfigurations = {
  title: { enabled: true, weight: 25 },
  authors: { enabled: true, weight: 20 },
  year: { enabled: true, weight: 5 },
  doi: { enabled: true, weight: 15 },
  arxivId: { enabled: true, weight: 8 },
  pmid: { enabled: true, weight: 3 },
  pmcid: { enabled: true, weight: 2 },
  isbn: { enabled: true, weight: 1 },
  issn: { enabled: true, weight: 1 },
  containerTitle: { enabled: true, weight: 10 },
  volume: { enabled: true, weight: 5 },
  issue: { enabled: true, weight: 3 },
  pages: { enabled: true, weight: 2 },
}

/**
 * Default match quality thresholds
 */
export const DEFAULT_MATCH_QUALITY_THRESHOLDS: MatchQualityThresholds = {
  exactMatchThreshold: 95,
  highMatchThreshold: 70,
}

/**
 * Default early termination configuration
 * Disabled by default with a conservative threshold
 */
export const DEFAULT_EARLY_TERMINATION_CONFIG: EarlyTerminationConfig = {
  enabled: true,
  threshold: 85, // Conservative threshold - only terminate on very good matches
}
