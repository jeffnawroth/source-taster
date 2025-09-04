/**
 * Core reference and metadata types
 */

import z from 'zod'
import { NormalizationRuleSchema } from '../normalization'
import { CSLItemSchema } from './csl-json.zod'

// AI-related schemas (moved from ai.ts)
export const FieldExtractionResultSchema = z.object({
  fieldPath: z.string().describe('The field path that was extracted (e.g., "metadata.title", "metadata.source.containerTitle")'),
  originalValue: z.string().describe('The original value before extraction'),
  extractedValue: z.union([
    z.string().describe('Simple string value'),
    z.number().describe('Numeric value for fields like year, volume, etc.'),
    // AuthorSchema.describe('Single author object for author fields'),
    // z.array(AuthorSchema).describe('Array of author objects'),
  ]).describe('The value after extraction - can be string, author object, array of strings, or array of author objects'),
  normalizationRules: z.array(NormalizationRuleSchema).describe('Type of normalization rules applied'),
})

export const AIExtractedReferenceSchema = z.object({
  originalText: z.string().describe('The raw reference text as it appeared in the source document'),
  metadata: CSLItemSchema.describe('Parsed/extracted bibliographic information'),
  extractionResults: z.array(FieldExtractionResultSchema).optional().describe('Information about modifications made'),
})

export const ReferenceSchema = AIExtractedReferenceSchema.extend({
  id: z.string().describe('Unique identifier for this reference'),
})

export type Reference = z.infer<typeof ReferenceSchema>
export type FieldExtractionResult = z.infer<typeof FieldExtractionResultSchema>
export type AIExtractedReference = z.infer<typeof AIExtractedReferenceSchema>
