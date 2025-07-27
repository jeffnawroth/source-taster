/**
 * API types for extraction requests and responses
 */

import z from 'zod'
import { ReferenceSchema } from '../reference'
import { ExtractionSettingsSchema } from './extraction-settings.types'

export const ExtractionRequestSchema = z.object({
  text: z.string().min(1).describe('The text to extract references from'),
  extractionSettings: ExtractionSettingsSchema.describe('User-configurable extraction settings'),
})

// Extraction Response Schema
export const ExtractionResponseSchema = z.object({
  references: z.array(ReferenceSchema).describe('List of extracted references'),
})

export type ExtractionResponse = z.infer<typeof ExtractionResponseSchema>
export type ExtractionRequest = z.infer<typeof ExtractionRequestSchema>
