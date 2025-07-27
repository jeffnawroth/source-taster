import type { ReferenceMetadataFields } from '../reference'

export interface MatchingConfig {
  fieldConfigurations: FieldConfigurations
  matchThresholds: MatchQualityThresholds
}

/**
 * Configuration for a single field in matching
 */
export interface FieldConfig {
  enabled: boolean
  weight: number
}

/**
 * Dynamic field configuration based on available metadata fields
 */
export type FieldConfigurations = {
  [K in ReferenceMetadataFields]?: FieldConfig
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
