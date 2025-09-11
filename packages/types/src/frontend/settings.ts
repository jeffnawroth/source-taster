import z from 'zod'
import { ApiExtractExtractionSettingsSchema, ApiMatchConfigSchema, ApiMatchMatchingStrategySchema, DEFAULT_MATCHING_CONFIG, DEFAULT_MATCHING_STRATEGY } from '../api'
import { ApiAISettingsSchema, DEFAULT_AI_SETTINGS } from '../api/ai'
import { CommonCSLVariableSchema } from '../app'

export const UIMatchingEarlyTerminationSchema = z.object({
  enabled: z.boolean().describe('Whether early termination is enabled'),
  threshold: z.number().min(0).max(100).describe('Score threshold for early termination (0-100)'),
}).strict()
export type UIMatchingEarlyTermination = z.infer<typeof UIMatchingEarlyTerminationSchema>
export const DEFAULT_EARLY_TERMINATION: UIMatchingEarlyTermination = {
  enabled: true,
  threshold: 95,
} as const

export const UIMatchingDisplayThresholdsSchema = z.object({
  strongMatchThreshold: z.number().min(0).max(100).describe('Minimum score for strong match'),
  possibleMatchThreshold: z.number().min(0).max(100).describe('Minimum score for possible match'),
}).strict().refine(v => v.possibleMatchThreshold <= v.strongMatchThreshold, {
  message: 'possibleMatchThreshold must be ≤ strongMatchThreshold',
  path: ['possibleMatchThreshold'],
})
export type UIMatchingDisplayThresholds = z.infer<typeof UIMatchingDisplayThresholdsSchema>
export const DEFAULT_DISPLAY_THRESHOLDS: UIMatchingDisplayThresholds = {
  strongMatchThreshold: 85,
  possibleMatchThreshold: 50,
} as const

export const UIThemeSchema = z.enum(['light', 'dark', 'system']).describe('UI theme preference')
export type UITheme = z.infer<typeof UIThemeSchema>
export const DEFAULT_UI_THEME: UITheme = 'system' as const

export const UILocaleSchema = z.enum(['en', 'de']).describe('UI language/locale')
export type UILocale = z.infer<typeof UILocaleSchema>
export const DEFAULT_UI_LOCALE: UILocale = 'en' as const

export const DEFAULT_UI_MATCHING_CONFIG = {
  ...DEFAULT_MATCHING_CONFIG,
  earlyTermination: { ...DEFAULT_EARLY_TERMINATION },
  displayThresholds: { ...DEFAULT_DISPLAY_THRESHOLDS },
}

export const DEFAULT_UI_MATCHING_SETTINGS = {
  matchingStrategy: DEFAULT_MATCHING_STRATEGY,
  matchingConfig: DEFAULT_UI_MATCHING_CONFIG,
}

export const UISettingsSchema = z.object({
  theme: UIThemeSchema.default(DEFAULT_UI_THEME).describe('UI theme preference'),
  locale: UILocaleSchema.default(DEFAULT_UI_LOCALE).describe('UI language/locale'),
  extract: ApiExtractExtractionSettingsSchema
    .default({ extractionConfig: { variables: [...CommonCSLVariableSchema.options] } })
    .describe('Extraction settings for the user'),

  matching: z.object({
    matchingStrategy: ApiMatchMatchingStrategySchema
      .default(DEFAULT_MATCHING_STRATEGY)
      .describe('Strategy for matching behavior'),

    // Falls du kein eigenes safeExtend hast, nimm extend:
    matchingConfig: ApiMatchConfigSchema
      .safeExtend({
        earlyTermination: UIMatchingEarlyTerminationSchema,
        displayThresholds: UIMatchingDisplayThresholdsSchema,
      })
      .default(DEFAULT_UI_MATCHING_CONFIG)
      .describe('Configuration for matching behavior'),
  })
    .strict()
    .default(DEFAULT_UI_MATCHING_SETTINGS),

  ai: ApiAISettingsSchema
    .default(DEFAULT_AI_SETTINGS)
    .describe('AI settings for the user'),
}).strict()
export type UISettings = z.infer<typeof UISettingsSchema>

/**
 * Generate default UI settings using Zod schema defaults
 * This automatically uses all the .default() values defined in the UISettingsSchema
 */
export function makeDefaultUISettings(): UISettings {
  return UISettingsSchema.parse({})
}

export const DEFAULT_UI_SETTINGS = makeDefaultUISettings()
