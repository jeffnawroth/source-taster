import z from 'zod'
import { ApiAISettingsSchema } from '../api/ai'

export const UIMatchingEarlyTerminationSchema = z.object({
  enabled: z.boolean().describe('Whether early termination is enabled'),
  threshold: z.number().min(0).max(100).describe('Score threshold for early termination (0-100)'),
}).strict()
export type UIMatchingEarlyTermination = z.infer<typeof UIMatchingEarlyTerminationSchema>

export const UIMatchingDisplayThresholdsSchema = z.object({
  highMatchThreshold: z.number().min(0).max(100).describe('Minimum score for high match'),
  partialMatchThreshold: z.number().min(0).max(100).describe('Minimum score for partial match'),
}).strict().refine(v => v.partialMatchThreshold <= v.highMatchThreshold, {
  message: 'partialMatchThreshold must be ≤ highMatchThreshold',
  path: ['partialMatchThreshold'],
})
export type UIMatchingDisplayThresholds = z.infer<typeof UIMatchingDisplayThresholdsSchema>

export const UISettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).describe('UI theme preference'),
  matching: z.object({
    earlyTermination: UIMatchingEarlyTerminationSchema.default({ enabled: true, threshold: 95 }).describe('Early termination settings'),
    displayThresholds: UIMatchingDisplayThresholdsSchema.default({
      highMatchThreshold: 80,
      partialMatchThreshold: 50,
    }).describe('Thresholds for displaying match quality'),
  }).strict(),
  ai: ApiAISettingsSchema.optional().describe('AI settings for the user'),
}).strict()

// export const MatchQualitySchema = z.enum(['exact', 'high', 'none']).describe('Match quality classification')
