import z from 'zod'
import { createApiResponseSchema } from '../api'

// ----- Request -----
export const ApiAnystyleParseRequestSchema = z.object({
  input: z.array(z.string().min(1)).nonempty().describe('Array of raw reference strings to parse'),
}).strict()
export type ApiAnystyleParseRequest = z.infer<typeof ApiAnystyleParseRequestSchema>

// ----- Response -----
export const ApiAnystyleTokenLabelSchema = z.enum([
  'author',
  'citation-number',
  'collection-title',
  'container-title',
  'date',
  'director',
  'doi',
  'edition',
  'editor',
  'genre',
  'isbn',
  'journal',
  'location',
  'medium',
  'note',
  'other',
  'pages',
  'producer',
  'publisher',
  'source',
  'title',
  'translator',
  'url',
  'volume',
])
export type ApiAnystyleTokenLabel = z.infer<typeof ApiAnystyleTokenLabelSchema>

export const ApiAnystyleTokenSchema = z.tuple([ApiAnystyleTokenLabelSchema, z.string()])
export type ApiAnystyleToken = z.infer<typeof ApiAnystyleTokenSchema>

export const ApiAnystyleTokenSequenceSchema = z.array(ApiAnystyleTokenSchema).describe('A sequence of tokens representing one parsed reference')
export type ApiAnystyleTokenSequence = z.infer<typeof ApiAnystyleTokenSequenceSchema>

export const ApiAnystyleParseDataSchema = z.object({
  modelUsed: z.string().min(1),
  tokens: z.array(ApiAnystyleTokenSequenceSchema).describe('Array of token sequences, where each sequence is an array of [label, token] pairs'),
}).strict()
export type ApiAnystyleParseData = z.infer<typeof ApiAnystyleParseDataSchema>

export const ApiAnystyleParseResponseSchema = createApiResponseSchema(ApiAnystyleParseDataSchema)
export type ApiAnystyleParseResponse = z.infer<typeof ApiAnystyleParseResponseSchema>
