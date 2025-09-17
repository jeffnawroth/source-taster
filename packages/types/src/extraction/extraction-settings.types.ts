/**
 * Main extraction settings configuration
 * Combines extraction modes, custom options, and field selections
 */

import z from 'zod'
import { ModeSchema } from '../common'
import { NormalizationRuleSchema } from '../normalization'
import { CSLVariableSchema } from '../reference'

export const ExtractionConfigSchema = z.object({
  variables: z.array(CSLVariableSchema).describe('CSL variables to extract'),
})

export const ExtractionStrategySchema = z.object({
  mode: ModeSchema.describe('Extraction mode for extraction'),
  normalizationRules: z.array(NormalizationRuleSchema).describe('Extraction action types to apply'),
})

export const ExtractionSettingsSchema = z.object({
  extractionStrategy: ExtractionStrategySchema.describe('Strategy for extraction text'),
  extractionConfig: ExtractionConfigSchema.describe('Configuration for field extraction'),
})

export type ExtractionStrategy = z.infer<typeof ExtractionStrategySchema>
export type ExtractionConfig = z.infer<typeof ExtractionConfigSchema>
export type ExtractionSettings = z.infer<typeof ExtractionSettingsSchema>
