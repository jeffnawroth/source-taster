import z from 'zod'
import { ApiAISettingsSchema, DEFAULT_AI_SETTINGS } from '../api'
import { ApiExtractExtractionSettingsSchema, DEFAULT_EXTRACTION_CONFIG } from '../api/extract'
import { ApiMatchConfigSchema, ApiMatchMatchingStrategySchema, DEFAULT_MATCHING_CONFIG, DEFAULT_MATCHING_STRATEGY } from '../api/match'

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

// Database Configuration
export const UIDatabaseConfigSchema = z.object({
  name: z.string().describe('Database name'),
  enabled: z.boolean().describe('Whether this database is enabled for searches'),
  priority: z.number().min(1).describe('Search priority (lower number = higher priority)'),
}).strict()
export type UIDatabaseConfig = z.infer<typeof UIDatabaseConfigSchema>

export const UIDatabasesSettingsSchema = z.array(UIDatabaseConfigSchema).describe('Database configurations')
export type UIDatabasesSettings = z.infer<typeof UIDatabasesSettingsSchema>

export const DEFAULT_DATABASES_SETTINGS: UIDatabasesSettings = [
  { name: 'openalex', enabled: true, priority: 1 },
  { name: 'crossref', enabled: true, priority: 2 },
  { name: 'semanticscholar', enabled: true, priority: 3 },
  { name: 'europepmc', enabled: false, priority: 4 },
  { name: 'arxiv', enabled: false, priority: 5 },
] as const

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

export const DEFAULT_UI_AI_EXTRACTION_USE = false

export const DEFAULT_UI_EXTRACTION_SETTINGS = {
  extractionConfig: { ...DEFAULT_EXTRACTION_CONFIG },
  useAi: DEFAULT_UI_AI_EXTRACTION_USE,
}

export const UISettingsSchema = z.object({
  theme: UIThemeSchema.default(DEFAULT_UI_THEME).describe('UI theme preference'),
  locale: UILocaleSchema.default(DEFAULT_UI_LOCALE).describe('UI language/locale'),
  databases: UIDatabasesSettingsSchema
    .default(DEFAULT_DATABASES_SETTINGS)
    .describe('Database configurations and priorities'),
  extract: ApiExtractExtractionSettingsSchema.safeExtend({
    useAi: z.boolean().describe('Whether to use AI for extraction'),
  }).default(DEFAULT_UI_EXTRACTION_SETTINGS).describe('Extraction settings for the user'),
  matching: z.object({
    matchingStrategy: ApiMatchMatchingStrategySchema
      .default(DEFAULT_MATCHING_STRATEGY)
      .describe('Strategy for matching behavior'),

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
