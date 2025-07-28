import z from 'zod'
import { type MatchingResult, MatchingStrategySchema, ValidatedMatchingConfigSchema } from '../matching'
import { ReferenceMetadataSchema } from '../reference'
import { WebsiteMatchingOptionsSchema } from '../website'
import { MatchingSettingsSchema } from './matching-settings.types'

/**
 * Lightweight reference type for matching - only contains metadata
 */
export const MatchingReferenceSchema = z.object({
  id: z.string().describe('Unique identifier for this reference'),
  metadata: ReferenceMetadataSchema.describe('Bibliographic metadata for matching'),
})

/**
 * Response containing multiple matching results
 */
export interface MatchingResponse {
  /** Individual matching results */
  results: MatchingResult[]
}

export const MatchingRequestSchema = z.object({
  references: z.array(MatchingReferenceSchema).min(1).describe('Array of reference metadata to match'),
  matchingSettings: MatchingSettingsSchema.describe('Settings for matching behavior'),
})

export const ValidatedMatchingRequestSchema = MatchingRequestSchema.extend({
  matchingSettings: z.object({
    matchingStrategy: MatchingStrategySchema,
    matchingConfig: ValidatedMatchingConfigSchema,
  }),
})

export const WebsiteMatchingRequestSchema = z.object({
  reference: MatchingReferenceSchema.describe('Reference metadata to match against website'),
  url: z.string().url().describe('Website URL to match against'),
  matchingSettings: MatchingSettingsSchema.describe('Settings for matching behavior'),
  options: WebsiteMatchingOptionsSchema.optional().describe('Optional website matching configuration'),
})

// Export types
export type MatchingReference = z.infer<typeof MatchingReferenceSchema>
export type MatchingRequest = z.infer<typeof MatchingRequestSchema>
export type ValidatedMatchingRequest = z.infer<typeof ValidatedMatchingRequestSchema>
export type WebsiteMatchingRequest = z.infer<typeof WebsiteMatchingRequestSchema>
