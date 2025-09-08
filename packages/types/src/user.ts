import z from 'zod'

export const MatchQualitySchema = z.enum(['exact', 'high', 'none']).describe('Match quality classification')

export const MatchQualityThresholdsSchema = z.object({
  highMatchThreshold: z.number().min(0).max(100).describe('Minimum score for high match'),
  partialMatchThreshold: z.number().min(0).max(100).describe('Minimum score for partial match'),
})

export const EarlyTerminationConfigSchema = z.object({
  enabled: z.boolean().describe('Whether early termination is enabled'),
  threshold: z.number().min(0).max(100).describe('Score threshold for early termination (0-100)'),
})

export type MatchQuality = z.infer<typeof MatchQualitySchema>
export type MatchQualityThresholds = z.infer<typeof MatchQualityThresholdsSchema>
export type EarlyTerminationConfig = z.infer<typeof EarlyTerminationConfigSchema>
