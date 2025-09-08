import z from 'zod'
import { CSLItemWithoutIdSchema } from './csl-json.zod'

export const LLMExtractReferenceSchema = z.object({
  originalText: z.string().describe('The raw reference text as it appeared in the source'),
  metadata: CSLItemWithoutIdSchema.describe('Extracted bibliographic metadata'),
}).strict()

export type LLMExtractReference = z.infer<typeof LLMExtractReferenceSchema>

export const LLMExtractPayloadSchema = z.object({
  references: z.array(LLMExtractReferenceSchema).describe('Array of extracted references'),
}).strict()

export type LLMExtractPayload = z.infer<typeof LLMExtractPayloadSchema>
