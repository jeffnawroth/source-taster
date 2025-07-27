import z from 'zod'
import { type MatchingResult, MatchingStrategySchema, ValidatedMatchingConfigSchema } from '../matching'
import { ReferenceSchema } from '../reference'
import { WebsiteMatchingOptionsSchema } from '../website'
import { MatchingSettingsSchema } from './matching-settings.types'

/**
 * Response containing multiple matching results
 */
export interface MatchingResponse {
  /** Individual matching results */
  results: MatchingResult[]
}

export const MatchingRequestSchema = z.object({
  references: z.array(ReferenceSchema).min(1).describe('Array of references to match'),
  matchingSettings: MatchingSettingsSchema.describe('Settings for matching behavior'),
})

export const ValidatedMatchingRequestSchema = MatchingRequestSchema.extend({
  matchingSettings: z.object({
    matchingStrategy: MatchingStrategySchema,
    matchingConfig: ValidatedMatchingConfigSchema,
  }),
})

export const WebsiteMatchingRequestSchema = z.object({
  reference: ReferenceSchema.describe('Reference to match against website'),
  url: z.string().url().describe('Website URL to match against'),
  matchingSettings: MatchingSettingsSchema.describe('Settings for matching behavior'),
  options: WebsiteMatchingOptionsSchema.optional().describe('Optional website matching configuration'),
})

export type MatchingRequest = z.infer<typeof MatchingRequestSchema>
export type WebsiteMatchingRequest = z.infer<typeof WebsiteMatchingRequestSchema>
export type ValidatedMatchingRequest = z.infer<typeof ValidatedMatchingRequestSchema>
