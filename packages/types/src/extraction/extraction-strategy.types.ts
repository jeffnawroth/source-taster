/**
 * Extraction modes and custom settings configuration
 */

import z from 'zod'
import { ModeSchema } from '../common/mode'

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

export type ExtractionActionType = z.infer<typeof ExtractionActionTypeSchema>
export type ExtractionStrategy = z.infer<typeof ExtractionStrategySchema>
