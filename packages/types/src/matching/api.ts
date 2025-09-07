import type { MatchingResult } from './matching-result'
import z from 'zod'
import { NormalizationRuleSchema } from '../normalization'

import { CSLItemSchema } from '../reference'
import { APISearchCandidateSchema } from '../search'
import { EarlyTerminationConfigSchema, FieldConfigurationsSchema, validateFieldWeights } from './matching-config.types'

/**
 * Lightweight reference type for matching - only contains metadata
 */
export const MatchingReferenceSchema = z.object({
  id: z.string().describe('Unique identifier for this reference'),
  metadata: CSLItemSchema.describe('Bibliographic metadata for matching'),
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
 * Optimized matching strategy for API requests - only sends normalizationRules
 */
export const APIMatchingStrategySchema = z.object({
  normalizationRules: z.array(NormalizationRuleSchema).describe('Selected normalization rules for matching behavior'),
})

/**
 * Optimized matching settings for API requests - excludes frontend-only matchThresholds
 */
export const APIMatchingSettingsSchema = z.object({
  matchingStrategy: APIMatchingStrategySchema.describe('Optimized strategy with only normalizationRules'),
  matchingConfig: APIMatchingConfigSchema.describe('Configuration for matching behavior'),
})

/**
 * Response containing matching results for multiple references
 */
export interface SearchAndMatchResponse {
  /** Array of matching results, one per reference */
  results: MatchingResult[]
}

/**
 * Response containing a single matching result
 */
export interface MatchingResponse {
  /** Single matching result for the reference against all candidates */
  result: MatchingResult
}

export const MatchingRequestSchema = z.object({
  reference: MatchingReferenceSchema.describe('Single reference metadata to match against candidates'),
  candidates: z.array(APISearchCandidateSchema).describe('Array of candidate sources to evaluate against the reference'),
  matchingSettings: APIMatchingSettingsSchema.describe('Optimized settings for matching behavior'),
})

export const ValidatedMatchingRequestSchema = MatchingRequestSchema.extend({
  matchingSettings: z.object({
    matchingStrategy: APIMatchingStrategySchema,
    matchingConfig: ValidatedAPIMatchingConfigSchema,
  }),
})

/**
 * Search and match request - searches for candidates and then matches them
 */
export const SearchAndMatchRequestSchema = z.object({
  references: z.array(MatchingReferenceSchema).min(1).describe('Array of references to search and match'),
  matchingSettings: APIMatchingSettingsSchema.describe('Optimized settings for matching behavior'),
})

export const ValidatedSearchAndMatchRequestSchema = SearchAndMatchRequestSchema.extend({
  matchingSettings: z.object({
    matchingStrategy: APIMatchingStrategySchema,
    matchingConfig: ValidatedAPIMatchingConfigSchema,
  }),
})

// Export types
export type MatchingReference = z.infer<typeof MatchingReferenceSchema>
export type APIMatchingConfig = z.infer<typeof APIMatchingConfigSchema>
export type APIMatchingStrategy = z.infer<typeof APIMatchingStrategySchema>
export type APIMatchingSettings = z.infer<typeof APIMatchingSettingsSchema>
export type MatchingRequest = z.infer<typeof MatchingRequestSchema>
export type ValidatedMatchingRequest = z.infer<typeof ValidatedMatchingRequestSchema>
export type SearchAndMatchRequest = z.infer<typeof SearchAndMatchRequestSchema>
export type ValidatedSearchAndMatchRequest = z.infer<typeof ValidatedSearchAndMatchRequestSchema>
