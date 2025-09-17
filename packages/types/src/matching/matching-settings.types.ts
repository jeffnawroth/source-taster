import z from 'zod'
import { MatchingConfigSchema } from './matching-config.types'
import { MatchingStrategySchema } from './matching-strategy.types'

export const MatchingSettingsSchema = z.object({
  matchingStrategy: MatchingStrategySchema.describe('Strategy for matching behavior'),
  matchingConfig: MatchingConfigSchema.describe('Configuration for matching behavior'),
})

export type MatchingSettings = z.infer<typeof MatchingSettingsSchema>
