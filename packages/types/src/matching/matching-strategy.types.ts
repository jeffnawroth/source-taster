import z from 'zod'
import { ModeSchema } from '../common/mode'
import { NormalizationRuleSchema } from '../normalization'

export const MatchingStrategySchema = z.object({
  mode: ModeSchema.describe('Strategy mode to control behavior'),
  normalizationRules: z.array(NormalizationRuleSchema).describe('Selected action types for matching behavior'),
}).describe('Matching strategy schema for AI extraction')

export type MatchingStrategy = z.infer<typeof MatchingStrategySchema>
