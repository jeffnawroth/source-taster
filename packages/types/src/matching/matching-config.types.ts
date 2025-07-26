import type { ReferenceMetadataDateFields, ReferenceMetadataIdentifierFields, ReferenceMetadataSourceFields, ReferenceMetadataTopLevelFields } from '../reference'

export interface MatchingConfig {
  fieldWeights: FieldWeights
  matchThresholds: MatchQualityThresholds
}

/**
 * Flattened field weights for all metadata fields
 */
export type FieldWeights = {
  [K in ReferenceMetadataTopLevelFields]?: number
} & {
  [K in ReferenceMetadataDateFields]?: number
} & {
  [K in ReferenceMetadataSourceFields]?: number
} & {
  [K in ReferenceMetadataIdentifierFields]?: number
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
