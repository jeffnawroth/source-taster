import z from 'zod'
import { CSLVariableSchema } from '..'

// Field Configuration Schemas
export const FieldConfigSchema = z.object({
  enabled: z.boolean().describe('Whether this field is enabled for matching'),
  weight: z.number().min(0).max(100).describe('Weight percentage for this field (0-100)'),
})

export const FieldConfigurationsSchema = z.record(
  CSLVariableSchema,
  FieldConfigSchema.optional(),
).describe('Configuration for each metadata field')

export const MatchQualitySchema = z.enum(['exact', 'high', 'none']).describe('Match quality classification')

export const MatchQualityThresholdsSchema = z.object({
  highMatchThreshold: z.number().min(0).max(100).describe('Minimum score for high match'),
  partialMatchThreshold: z.number().min(0).max(100).describe('Minimum score for partial match'),
})

export const EarlyTerminationConfigSchema = z.object({
  enabled: z.boolean().describe('Whether early termination is enabled'),
  threshold: z.number().min(0).max(100).describe('Score threshold for early termination (0-100)'),
})

export const MatchingConfigSchema = z.object({
  fieldConfigurations: FieldConfigurationsSchema.describe('Field enable/weight configurations'),
  matchThresholds: MatchQualityThresholdsSchema.describe('Match quality thresholds'),
  earlyTermination: EarlyTerminationConfigSchema.describe('Early termination configuration'),
})

// Custom validation schema that includes weight sum validation
export const ValidatedMatchingConfigSchema = MatchingConfigSchema.refine(
  data => validateFieldWeights(data.fieldConfigurations),
  {
    message: 'Enabled field weights must sum to exactly 100%',
    path: ['fieldConfigurations'],
  },
)

export function validateFieldWeights(fieldConfigurations: Record<string, { enabled: boolean, weight: number } | undefined>): boolean {
  const enabledFields = Object.values(fieldConfigurations).filter(config => config?.enabled)
  const totalWeight = enabledFields.reduce((sum, config) => sum + (config?.weight || 0), 0)
  return totalWeight === 100
}

export type FieldConfig = z.infer<typeof FieldConfigSchema>
export type FieldConfigurations = z.infer<typeof FieldConfigurationsSchema>
export type MatchQuality = z.infer<typeof MatchQualitySchema>
export type MatchQualityThresholds = z.infer<typeof MatchQualityThresholdsSchema>
export type EarlyTerminationConfig = z.infer<typeof EarlyTerminationConfigSchema>
export type MatchingConfig = z.infer<typeof MatchingConfigSchema>
