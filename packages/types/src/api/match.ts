import z from 'zod'
import { CSLItemSchema, CSLVariableSchema } from '../app/csl-json.zod'
import { createApiResponseSchema } from './api'

// ----- Request -----
export const ApiMatchReferenceSchema = z.object({
  id: z.uuid().describe('Unique identifier for the reference'),
  metadata: CSLItemSchema.describe('Bibliographic metadata for the reference'),
}).strict()
export type ApiMatchReference = z.infer<typeof ApiMatchReferenceSchema>

export const ApiMatchCandidateSchema = z.object({
  id: z.uuid().describe('Unique identifier in the external database'),
  metadata: CSLItemSchema, // candidate CSL item
}).strict()
export type ApiMatchCandidate = z.infer<typeof ApiMatchCandidateSchema>

export const ApiMatchNormalizationRuleSchema = z.enum([
  'normalize-typography',
  'normalize-lowercase',
  'normalize-identifiers',
  'normalize-characters',
  'normalize-whitespace',
  'normalize-accents',
  'normalize-umlauts',
  'normalize-punctuation',
  'normalize-unicode',
  'normalize-urls',
]).describe('Normalization rule action type')
export type ApiMatchNormalizationRule = z.infer<typeof ApiMatchNormalizationRuleSchema>

export const ApiMatchModeSchema = z.enum([
  'strict',
  'balanced',
  'custom',
]).describe('Mode for controlling behavior in matching')

export type ApiMatchMode = z.infer<typeof ApiMatchModeSchema>

export const ApiMatchMatchingStrategySchema = z.object({
  mode: ApiMatchModeSchema.default('balanced').describe('Strategy mode to control behavior'),
  normalizationRules: z.array(ApiMatchNormalizationRuleSchema).describe('Selected normalization rules for matching behavior'),
}).strict()
export type ApiMatchMatchingStrategy = z.infer<typeof ApiMatchMatchingStrategySchema>

export const ApiMatchFieldConfigSchema = z.object({
  enabled: z.boolean().describe('Whether this field is enabled for matching'),
  weight: z.number().min(0).max(100).describe('Weight percentage for this field (0-100)'),
}).strict()
export type ApiMatchFieldConfig = z.infer<typeof ApiMatchFieldConfigSchema>

export const ApiMatchConfigSchema = z.object({
  fieldConfigurations: z.record(CSLVariableSchema, ApiMatchFieldConfigSchema).describe('Field enable/weight configurations'),
}).strict().refine(
  (val) => {
    const entries = Object.values(val.fieldConfigurations)
    const enabled = entries.filter(e => e.enabled === true)
    if (enabled.length === 0)
      return false
    const sum = enabled.reduce((acc, e) => acc + e.weight, 0)
    return sum === 100
  },
  {
    message: 'Enabled field weights must sum to exactly 100% and at least one field must be enabled',
    path: ['fieldConfigurations'],
  },
)
export type ApiMatchConfig = z.infer<typeof ApiMatchConfigSchema>

export const ApiMatchMatchingSettingsSchema = z.object({
  matchingStrategy: ApiMatchMatchingStrategySchema.describe('Strategy for matching behavior'),
  matchingConfig: ApiMatchConfigSchema.describe('Configuration for matching behavior'),
}).strict()
export type ApiMatchMatchingSettings = z.infer<typeof ApiMatchMatchingSettingsSchema>

export const ApiMatchRequestSchema = z.object({
  reference: ApiMatchReferenceSchema.describe('The reference to be matched'),
  candidates: z.array(ApiMatchCandidateSchema).nonempty().describe('List of candidate items to match against'),
  matchingSettings: ApiMatchMatchingSettingsSchema.describe('Matching strategy and configuration settings'),
}).strict()
export type ApiMatchRequest = z.infer<typeof ApiMatchRequestSchema>

// ----- Response -----
export const ApiMatchFieldDetailSchema = z.object({
  field: CSLVariableSchema.describe('The metadata field name'),
  fieldScore: z.number().min(0).max(100).describe('The match score for the field'),
}).strict()
export type ApiMatchFieldDetail = z.infer<typeof ApiMatchFieldDetailSchema>

export const ApiMatchDetailsSchema = z.object({
  fieldDetails: z.array(ApiMatchFieldDetailSchema).describe('Detailed match scores per field'),
  overallScore: z.number().min(0).max(100).describe('The overall match score'),
}).strict()
export type ApiMatchDetails = z.infer<typeof ApiMatchDetailsSchema>

export const ApiMatchEvaluationSchema = z.object({
  candidateId: z.uuid().describe('ID of the external source candidate'),
  matchDetails: ApiMatchDetailsSchema,
}).strict()
export type ApiMatchEvaluation = z.infer<typeof ApiMatchEvaluationSchema>

export const ApiMatchDataSchema = z.object({
  evaluations: z.array(ApiMatchEvaluationSchema).describe('Array of source evaluations for the reference against all candidates'),
}).strict()
export type ApiMatchData = z.infer<typeof ApiMatchDataSchema>

export const ApiMatchResponseSchema = createApiResponseSchema(ApiMatchDataSchema)
export type ApiMatchResponse = z.infer<typeof ApiMatchResponseSchema>

// ----- Helper Functions -----
export function validateFieldWeights(fieldConfigurations: Record<string, { enabled: boolean, weight: number } | undefined>): boolean {
  const enabledFields = Object.values(fieldConfigurations).filter(config => config?.enabled)
  const totalWeight = enabledFields.reduce((sum, config) => sum + (config?.weight || 0), 0)
  return totalWeight === 100
}
