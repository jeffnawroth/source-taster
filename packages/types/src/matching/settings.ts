import type { CustomMatchingSettings, MatchingMode } from './modes'
import type { MatchQualityThresholds } from './quality'
import type { FieldWeights } from './weights'
import { DEFAULT_MATCHING_MODE } from './modes'
import { DEFAULT_MATCH_QUALITY_THRESHOLDS } from './quality'
import { DEFAULT_FIELD_WEIGHTS } from './weights'

/**
 * Matching settings combining mode and custom configuration
 */
export interface MatchingSettings {
  /** Matching mode controlling overall behavior */
  matchingMode: MatchingMode
  /** Custom matching configuration (only used when matchingMode is CUSTOM) */
  customSettings?: CustomMatchingSettings
  /** Field weights for scoring */
  fieldWeights: FieldWeights
}

/**
 * Complete default matching settings
 * Uses balanced mode with standard field weights
 */
export const DEFAULT_MATCHING_SETTINGS: MatchingSettings = {
  matchingMode: DEFAULT_MATCHING_MODE,
  customSettings: undefined,
  fieldWeights: DEFAULT_FIELD_WEIGHTS,
}

export interface MatchQualitySettings {
  /** Thresholds for match quality classification */
  thresholds: MatchQualityThresholds
}

/**
 * Default match quality settings
 */
export const DEFAULT_MATCH_QUALITY_SETTINGS: MatchQualitySettings = {
  thresholds: DEFAULT_MATCH_QUALITY_THRESHOLDS,
}
