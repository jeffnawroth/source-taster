/**
 * Core reference and metadata types
 */

import z from 'zod'
import { CSLItemSchema } from './csl-json.zod'

export const AIExtractedReferenceSchema = z.object({
  originalText: z.string().describe('The raw reference text as it appeared in the source document'),
  metadata: CSLItemSchema.describe('Parsed/extracted bibliographic information'),
})

export const ReferenceSchema = AIExtractedReferenceSchema.extend({
  id: z.string().describe('Unique identifier for this reference'),

})

export type Reference = z.infer<typeof ReferenceSchema>
export type AIExtractedReference = z.infer<typeof AIExtractedReferenceSchema>
