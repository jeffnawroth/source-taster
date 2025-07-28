import type { MatchingResult } from './matching-result'
import z from 'zod'
import { ReferenceMetadataSchema } from '../reference'

import { WebsiteMatchingOptionsSchema } from '../website'
import { EarlyTerminationConfigSchema, FieldConfigurationsSchema, validateFieldWeights } from './matching-config.types'
import { MatchingStrategySchema } from './matching-strategy.types'

/**
 * Lightweight reference type for matching - only contains metadata
 */
export const MatchingReferenceSchema = z.object({
  id: z.string().describe('Unique identifier for this reference'),
  metadata: ReferenceMetadataSchema.describe('Bibliographic metadata for matching'),
})

/**
 * Optimized matching config for API requests - excludes frontend-only data
 */
export const APIMatchingConfigSchema = z.object({
  fieldConfigurations: FieldConfigurationsSchema.describe('Field enable/weight configurations'),
  earlyTermination: EarlyTerminationConfigSchema.describe('Early termination configuration'),
})

/**
 * Validated API matching config with field weight validation
 */
export const ValidatedAPIMatchingConfigSchema = APIMatchingConfigSchema.refine(
  data => validateFieldWeights(data.fieldConfigurations),
  {
    message: 'Enabled field weights must sum to exactly 100%',
    path: ['fieldConfigurations'],
  },
)

/**
 * Optimized matching settings for API requests - excludes frontend-only matchThresholds
 */
export const APIMatchingSettingsSchema = z.object({
  matchingStrategy: MatchingStrategySchema.describe('Strategy for matching behavior'),
  matchingConfig: APIMatchingConfigSchema.describe('Configuration for matching behavior'),
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
  matchingSettings: APIMatchingSettingsSchema.describe('Optimized settings for matching behavior'),
})

export const ValidatedMatchingRequestSchema = MatchingRequestSchema.extend({
  matchingSettings: z.object({
    matchingStrategy: MatchingStrategySchema,
    matchingConfig: ValidatedAPIMatchingConfigSchema,
  }),
})

export const WebsiteMatchingRequestSchema = z.object({
  reference: MatchingReferenceSchema.describe('Reference metadata to match against website'),
  url: z.string().url().describe('Website URL to match against'),
  matchingSettings: APIMatchingSettingsSchema.describe('Optimized settings for matching behavior'),
  options: WebsiteMatchingOptionsSchema.optional().describe('Optional website matching configuration'),
})

// Export types
export type MatchingReference = z.infer<typeof MatchingReferenceSchema>
export type APIMatchingConfig = z.infer<typeof APIMatchingConfigSchema>
export type APIMatchingSettings = z.infer<typeof APIMatchingSettingsSchema>
export type MatchingRequest = z.infer<typeof MatchingRequestSchema>
export type ValidatedMatchingRequest = z.infer<typeof ValidatedMatchingRequestSchema>
export type WebsiteMatchingRequest = z.infer<typeof WebsiteMatchingRequestSchema>
