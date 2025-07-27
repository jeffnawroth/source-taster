import z from 'zod'
import { DEFAULT_FIELDS_CONFIG, DEFAULT_MATCH_QUALITY_THRESHOLDS } from './matching-config.constants'
import { MatchingConfigSchema } from './matching-config.types'
import { DEFAULT_MATCHING_STRATEGY } from './matching-strategy.constants'
import { MatchingStrategySchema } from './matching-strategy.types'

export const MatchingSettingsSchema = z.object({
  matchingStrategy: MatchingStrategySchema.describe('Strategy for matching behavior'),
  matchingConfig: MatchingConfigSchema.describe('Configuration for matching behavior'),
})

/**
 * Complete default extraction settings
 * Uses balanced mode with standard field selection
 */
export const DEFAULT_MATCHING_SETTINGS: MatchingSettings = {
  matchingStrategy: DEFAULT_MATCHING_STRATEGY,
  matchingConfig: {
    fieldConfigurations: DEFAULT_FIELDS_CONFIG,
    matchThresholds: DEFAULT_MATCH_QUALITY_THRESHOLDS,
  },
}

export type MatchingSettings = z.infer<typeof MatchingSettingsSchema>
