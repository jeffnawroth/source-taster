/**
 * Default matching settings for the frontend
 * Combines all matching-related default configurations
 */

import type { EarlyTerminationConfig, MatchingSettings, MatchingStrategy, MatchQualityThresholds, Mode } from '@source-taster/types'
import { MATCHING_MODE_PRESETS } from '../matchingModePresets'
import { DEFAULT_FIELDS_CONFIG } from './defaultFieldConfig'

export const DEFAULT_MATCHING_MODE: Mode = 'balanced'

/**
 * Default match quality thresholds
 */
export const DEFAULT_MATCH_QUALITY_THRESHOLDS: MatchQualityThresholds = {
  highMatchThreshold: 80,
  partialMatchThreshold: 50,
}

/**
 * Default early termination configuration
 * Disabled by default with a conservative threshold
 */
export const DEFAULT_EARLY_TERMINATION_CONFIG: EarlyTerminationConfig = {
  enabled: true,
  threshold: 80, // Conservative threshold - only terminate on very good matches
}

export const DEFAULT_MATCHING_STRATEGY: MatchingStrategy = {
  mode: DEFAULT_MATCHING_MODE,
  actionTypes: MATCHING_MODE_PRESETS.balanced,
} as const

/**
 * Complete default matching settings
 * Uses default strategy with standard field configurations
 */
export const DEFAULT_MATCHING_SETTINGS: MatchingSettings = {
  matchingStrategy: DEFAULT_MATCHING_STRATEGY,
  matchingConfig: {
    fieldConfigurations: DEFAULT_FIELDS_CONFIG,
    matchThresholds: DEFAULT_MATCH_QUALITY_THRESHOLDS,
    earlyTermination: DEFAULT_EARLY_TERMINATION_CONFIG,
  },
}
