import type { MatchQualityThresholds } from './quality'
import type { MatchingToleranceMode, MatchingToleranceOptions } from './tolerance'
import type { FieldWeights } from './weights'
import { DEFAULT_MATCH_QUALITY_THRESHOLDS } from './quality'
import { BALANCED_MATCHING_TOLERANCE_OPTIONS, DEFAULT_MATCHING_MODE } from './tolerance'
import { DEFAULT_FIELD_WEIGHTS } from './weights'

/**
 * Matching settings combining mode and custom configuration
 */
export interface MatchingSettings {
  toleranceSettings: MatchingToleranceSettings
  /** Field weights for scoring */
  fieldWeights: FieldWeights
}

/**
 * Tolerance settings for matching algorithm
 * Controls how strict/lenient the matching process should be
 */
export interface MatchingToleranceSettings {
  mode: MatchingToleranceMode
  options: MatchingToleranceOptions
}

/**
 * Settings for match quality classification
 * Defines thresholds for categorizing match quality
 */
export interface MatchQualitySettings {
  /** Thresholds for match quality classification */
  thresholds: MatchQualityThresholds
}

/*
  * Default matching tolerance settings
  * Uses balanced mode with standard options
  */
export const DEFAULT_MATCHING_TOLERANCE_SETTINGS: MatchingToleranceSettings = {
  mode: DEFAULT_MATCHING_MODE,
  options: BALANCED_MATCHING_TOLERANCE_OPTIONS,
}

/**
 * Complete default matching settings
 * Uses balanced mode with standard field weights
 */
export const DEFAULT_MATCHING_SETTINGS: MatchingSettings = {
  toleranceSettings: DEFAULT_MATCHING_TOLERANCE_SETTINGS,
  fieldWeights: DEFAULT_FIELD_WEIGHTS,
}

/**
 * Default match quality settings
 */
export const DEFAULT_MATCH_QUALITY_SETTINGS: MatchQualitySettings = {
  thresholds: DEFAULT_MATCH_QUALITY_THRESHOLDS,
}
