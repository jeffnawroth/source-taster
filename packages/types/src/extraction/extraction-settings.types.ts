/**
 * Main extraction settings configuration
 * Combines extraction modes, custom options, and field selections
 */

import z from 'zod'
import { ModeSchema } from '../common'
import { CSLVariableSchema } from '../reference'

export const ExtractionConfigSchema = z.object({
  variables: z.array(CSLVariableSchema).describe('CSL variables to extract'),
})

export const ExtractionActionTypeSchema = z.enum([
  'normalize-spelling',
  'normalize-typography',
  'normalize-title-case',
  'normalize-identifiers',
  'normalize-characters',
  'normalize-whitespace',
]).describe('Extraction rule action type')

export const ExtractionStrategySchema = z.object({
  mode: ModeSchema.describe('Extraction mode for extraction'),
  actionTypes: z.array(ExtractionActionTypeSchema).describe('Extraction action types to apply'),
})

export const ExtractionSettingsSchema = z.object({
  extractionStrategy: ExtractionStrategySchema.describe('Strategy for extraction text'),
  extractionConfig: ExtractionConfigSchema.describe('Configuration for field extraction'),
})

export type ExtractionActionType = z.infer<typeof ExtractionActionTypeSchema>
export type ExtractionStrategy = z.infer<typeof ExtractionStrategySchema>
export type ExtractionConfig = z.infer<typeof ExtractionConfigSchema>
export type ExtractionSettings = z.infer<typeof ExtractionSettingsSchema>
