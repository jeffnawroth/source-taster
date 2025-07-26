import type { MatchingStrategy } from './matching-strategy.types'
import { DEFAULT_MATCHING_STRATEGY } from './matching-strategy.constants'
import { DEFAULT_MATCH_QUALITY_THRESHOLDS } from './quality'
import { DEFAULT_FIELD_WEIGHTS, type MatchingConfig } from './weights'

/**
 * Matching settings combining mode and custom configuration
 */
export interface MatchingSettings {
  matchingStrategy: MatchingStrategy
  /** Field weights for scoring */
  matchingConfig: MatchingConfig
}

/**
 * Complete default extraction settings
 * Uses balanced mode with standard field selection
 */
export const DEFAULT_EXTRACTION_SETTINGS: MatchingSettings = {
  matchingStrategy: DEFAULT_MATCHING_STRATEGY,
  matchingConfig: {
    fieldWeights: DEFAULT_FIELD_WEIGHTS,
    matchThresholds: DEFAULT_MATCH_QUALITY_THRESHOLDS,
  },
}
