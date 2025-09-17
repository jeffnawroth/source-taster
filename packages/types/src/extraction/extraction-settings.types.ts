/**
 * Main extraction settings configuration
 * Combines extraction modes, custom options, and field selections
 */

import z from 'zod'
import { ExtractionConfigSchema } from './extraction-config.types'
import { ExtractionStrategySchema } from './extraction-strategy.types'

export const ExtractionSettingsSchema = z.object({
  extractionStrategy: ExtractionStrategySchema.describe('Strategy for extraction text'),
  extractionConfig: ExtractionConfigSchema.describe('Configuration for field extraction'),
})

export type ExtractionSettings = z.infer<typeof ExtractionSettingsSchema>
