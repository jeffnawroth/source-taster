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

export const DEFAULT_MATCHING_MODE: ApiMatchMode = 'balanced' as const

export const DEFAULT_NORMALIZATION_RULES: ApiMatchNormalizationRule[] = [
  ...ApiMatchNormalizationRuleSchema.options,
]

export const ApiMatchMatchingStrategySchema = z.object({
  mode: ApiMatchModeSchema.default(DEFAULT_MATCHING_MODE).describe('Strategy mode to control behavior'),
  normalizationRules: z.array(ApiMatchNormalizationRuleSchema).default([
    ...DEFAULT_NORMALIZATION_RULES,
  ]).describe('Selected normalization rules for matching behavior'),
}).strict()
export type ApiMatchMatchingStrategy = z.infer<typeof ApiMatchMatchingStrategySchema>

export const ApiMatchFieldConfigSchema = z.object({
  enabled: z.boolean().describe('Whether this field is enabled for matching'),
  weight: z.number().min(0).max(100).describe('Weight percentage for this field (0-100)'),
}).strict()
export type ApiMatchFieldConfig = z.infer<typeof ApiMatchFieldConfigSchema>

// Create a schema for all possible CSL field configurations
const AllFieldConfigurationsSchema = z.object(
  Object.fromEntries(
    CSLVariableSchema.options.map(field => [field, ApiMatchFieldConfigSchema]),
  ),
)

export const DEFAULT_FIELD_CONFIG = createDefaultFieldConfigurations() as Record<string, ApiMatchFieldConfig>

export const ApiMatchConfigSchema = z.object({
  fieldConfigurations: AllFieldConfigurationsSchema
    .partial()
    .default(DEFAULT_FIELD_CONFIG)
    .describe('Field enable/weight configurations'),
}).strict().refine(
  (val) => {
    const entries = Object.values(val.fieldConfigurations) as ApiMatchFieldConfig[]
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

export const DEFAULT_MATCHING_STRATEGY: ApiMatchMatchingStrategy = {
  mode: DEFAULT_MATCHING_MODE,
  normalizationRules: DEFAULT_NORMALIZATION_RULES,
} as const as ApiMatchMatchingStrategy

export const DEFAULT_MATCHING_CONFIG: ApiMatchConfig = {
  fieldConfigurations: DEFAULT_FIELD_CONFIG,
} as const as ApiMatchConfig

export const DEFAULT_MATCHING_SETTINGS: ApiMatchMatchingSettings = {
  matchingStrategy: DEFAULT_MATCHING_STRATEGY,
  matchingConfig: DEFAULT_MATCHING_CONFIG,
} as const as ApiMatchMatchingSettings

export const ApiMatchMatchingSettingsSchema = z.object({
  matchingStrategy: ApiMatchMatchingStrategySchema.default(DEFAULT_MATCHING_STRATEGY).describe('Strategy for matching behavior'),
  matchingConfig: ApiMatchConfigSchema.default(DEFAULT_MATCHING_CONFIG).describe('Configuration for matching behavior'),
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
// Default field configurations for matching
export function createDefaultFieldConfigurations(): Record<string, ApiMatchFieldConfig> {
  const allFields = CSLVariableSchema.options
  const defaultConfig: Record<string, ApiMatchFieldConfig> = {}

  // Set all fields to disabled by default
  allFields.forEach((field) => {
    defaultConfig[field] = { enabled: false, weight: 0 }
  })

  // Enable and weight the most important fields for matching (total = 100%)
  defaultConfig.title = { enabled: true, weight: 30 }
  defaultConfig.author = { enabled: true, weight: 25 }
  defaultConfig.issued = { enabled: true, weight: 15 }
  defaultConfig['container-title'] = { enabled: true, weight: 15 }
  defaultConfig.DOI = { enabled: true, weight: 10 }
  defaultConfig.volume = { enabled: true, weight: 3 }
  defaultConfig.page = { enabled: true, weight: 2 }

  return defaultConfig
}
