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

/**
 * Default match quality thresholds
 */
export const DEFAULT_MATCH_QUALITY_THRESHOLDS: MatchQualityThresholds = {
  exactMatchThreshold: 95,
  highMatchThreshold: 70,
}
