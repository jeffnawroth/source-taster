import z from 'zod'
import { ApiExtractExtractionSettingsSchema, DEFAULT_EXTRACTION_CONFIG } from '../api/extract.js'
import { ApiAISettingsSchema, DEFAULT_AI_SETTINGS } from '../api/index.js'
import { ApiMatchConfigSchema, ApiMatchMatchingStrategySchema, DEFAULT_MATCHING_CONFIG, DEFAULT_MATCHING_STRATEGY } from '../api/match.js'

export const UIMatchingEarlyTerminationSchema = z.object({
  enabled: z.boolean().describe('Whether early termination is enabled'),
  threshold: z.number().min(0).max(100).describe('Score threshold for early termination (0-100)'),
}).strict()
export type UIMatchingEarlyTermination = z.infer<typeof UIMatchingEarlyTerminationSchema>
export const DEFAULT_EARLY_TERMINATION: UIMatchingEarlyTermination = {
  enabled: true,
  threshold: 85,
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
export const UISearchDatabaseConfigSchema = z.object({
  id: z.uuid().describe('Unique identifier for the database configuration'),
  name: z.string().describe('Database name'),
  enabled: z.boolean().describe('Whether this database is enabled for searches'),
  priority: z.number().min(1).describe('Search priority (lower number = higher priority)'),
}).strict()
export type UISearchDatabaseConfig = z.infer<typeof UISearchDatabaseConfigSchema>

export const UIDatabasesSettingsSchema = z.array(UISearchDatabaseConfigSchema).describe('Database configurations')
export type UIDatabasesSettings = z.infer<typeof UIDatabasesSettingsSchema>

export const DEFAULT_DATABASES_SETTINGS: UIDatabasesSettings = [
  { id: crypto.randomUUID(), name: 'openalex', enabled: true, priority: 1 },
  { id: crypto.randomUUID(), name: 'crossref', enabled: true, priority: 2 },
  { id: crypto.randomUUID(), name: 'semanticscholar', enabled: true, priority: 3 },
  { id: crypto.randomUUID(), name: 'europepmc', enabled: false, priority: 4 },
  { id: crypto.randomUUID(), name: 'arxiv', enabled: false, priority: 5 },
] as const

export const UISearchSettingsSchema = z.object({
  databases: UIDatabasesSettingsSchema.describe('Database configurations and priorities'),
}).strict()

export const DEFAULT_UI_SEARCH_SETTINGS: UISearchSettings = {
  databases: DEFAULT_DATABASES_SETTINGS,
} as const
export type UISearchSettings = z.infer<typeof UISearchSettingsSchema>

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
}

export const UISettingsSchema = z.object({
  theme: UIThemeSchema.default(DEFAULT_UI_THEME).describe('UI theme preference'),
  locale: UILocaleSchema.default(DEFAULT_UI_LOCALE).describe('UI language/locale'),
  search: UISearchSettingsSchema
    .default(DEFAULT_UI_SEARCH_SETTINGS)
    .describe('Search settings for the user'),
  extract: ApiExtractExtractionSettingsSchema.default(DEFAULT_UI_EXTRACTION_SETTINGS).describe('Extraction settings for the user'),
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
    .safeExtend({
      canUseAI: z.boolean().describe('Whether AI can be used (has API key and provider configured)'),
    })
    .default({ ...DEFAULT_AI_SETTINGS, canUseAI: false })
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
