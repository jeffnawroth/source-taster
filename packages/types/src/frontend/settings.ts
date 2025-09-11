import z from 'zod'
import { ApiExtractExtractionSettingsSchema, ApiMatchMatchingStrategySchema, ApiMatchNormalizationRuleSchema } from '../api'
import { ApiAISettingsSchema } from '../api/ai'
import { CommonCSLVariableSchema } from '../app'

export const UIMatchingEarlyTerminationSchema = z.object({
  enabled: z.boolean().default(true).describe('Whether early termination is enabled'),
  threshold: z.number().min(0).max(100).default(95).describe('Score threshold for early termination (0-100)'),
}).strict()
export type UIMatchingEarlyTermination = z.infer<typeof UIMatchingEarlyTerminationSchema>

export const UIMatchingDisplayThresholdsSchema = z.object({
  highMatchThreshold: z.number().min(0).max(100).default(80).describe('Minimum score for high match'),
  partialMatchThreshold: z.number().min(0).max(100).default(50).describe('Minimum score for partial match'),
}).strict().refine(v => v.partialMatchThreshold <= v.highMatchThreshold, {
  message: 'partialMatchThreshold must be ≤ highMatchThreshold',
  path: ['partialMatchThreshold'],
})
export type UIMatchingDisplayThresholds = z.infer<typeof UIMatchingDisplayThresholdsSchema>

// UI-specific matching config that includes additional UI fields without conflicting refinements
export const UIMatchingConfigSchema = z.object({
  // Core matching configuration from API
  fieldConfigurations: z.record(z.string(), z.object({
    enabled: z.boolean().default(false).describe('Whether field is enabled for matching'),
    weight: z.number().min(0).max(100).default(0).describe('Weight percentage for field (0-100)'),
  }).strict()).default({}).describe('Field enable/weight configurations'),

  // UI-specific extensions
  earlyTermination: UIMatchingEarlyTerminationSchema.default({ enabled: true, threshold: 95 }).describe('Early termination settings'),
  displayThresholds: UIMatchingDisplayThresholdsSchema.default({
    highMatchThreshold: 80,
    partialMatchThreshold: 50,
  }).describe('Thresholds for displaying match quality'),
}).strict()

export const UISettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('light').describe('UI theme preference'),
  locale: z.enum(['en', 'de']).default('en').describe('UI language/locale'),
  extract: ApiExtractExtractionSettingsSchema.default({ extractionConfig: { variables: [...CommonCSLVariableSchema.options] } }).describe('Extraction settings for the user'),
  matching: z.object({
    matchingStrategy: ApiMatchMatchingStrategySchema.default({
      mode: 'balanced',
      normalizationRules: [...ApiMatchNormalizationRuleSchema.options],
    }).describe('Strategy for matching behavior'),
    matchingConfig: UIMatchingConfigSchema.default({
      fieldConfigurations: {},
      earlyTermination: { enabled: true, threshold: 95 },
      displayThresholds: { highMatchThreshold: 80, partialMatchThreshold: 50 },
    }).describe('Configuration for matching behavior'),
  }).strict().default({
    matchingStrategy: {
      mode: 'balanced',
      normalizationRules: [...ApiMatchNormalizationRuleSchema.options],
    },
    matchingConfig: {
      fieldConfigurations: {},
      earlyTermination: { enabled: true, threshold: 95 },
      displayThresholds: { highMatchThreshold: 80, partialMatchThreshold: 50 },
    },
  }),
  ai: ApiAISettingsSchema.default({
    provider: 'openai',
    model: 'gpt-4o',
  }).describe('AI settings for the user'),
}).strict()
export type UISettings = z.infer<typeof UISettingsSchema>

/**
 * Generate default UI settings using Zod schema defaults
 * This automatically uses all the .default() values defined in the UISettingsSchema
 */
export function makeDefaultUISettings(): UISettings {
  return UISettingsSchema.parse({})
}
