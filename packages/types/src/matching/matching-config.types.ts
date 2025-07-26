import type { DateInfo, ExternalIdentifiers, ReferenceMetadata, SourceInfo } from '../reference'

export interface MatchingConfig {
  fieldWeights: FieldWeights
  matchThresholds: MatchQualityThresholds
}

  type FieldWeightType<T> = { [K in keyof T]?: number }

export type DateInfoFieldWeights = FieldWeightType<DateInfo>
export type SourceInfoFieldWeights = FieldWeightType<SourceInfo>
export type ExternalIdentifiersFieldWeights = FieldWeightType<ExternalIdentifiers>

export type FieldWeights = {
  [K in keyof ReferenceMetadata]?:
  K extends 'date' ? DateInfoFieldWeights :
    K extends 'source' ? SourceInfoFieldWeights :
      K extends 'identifiers' ? ExternalIdentifiersFieldWeights :
        number
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
