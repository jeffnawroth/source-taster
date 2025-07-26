import type { MatchingConfig } from './matching-config.types'
import type { MatchingStrategy } from './matching-strategy.types'
import { DEFAULT_FIELD_WEIGHTS, DEFAULT_MATCH_QUALITY_THRESHOLDS } from './matching-config.constants'
import { DEFAULT_MATCHING_STRATEGY } from './matching-strategy.constants'

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
export const DEFAULT_MATCHING_SETTINGS: MatchingSettings = {
  matchingStrategy: DEFAULT_MATCHING_STRATEGY,
  matchingConfig: {
    fieldWeights: DEFAULT_FIELD_WEIGHTS,
    matchThresholds: DEFAULT_MATCH_QUALITY_THRESHOLDS,
  },
}
