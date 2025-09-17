import z from 'zod'
import { createApiResponseSchema } from '../api.js'

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
  .describe('A single token with its label')
export type ApiAnystyleToken = z.infer<typeof ApiAnystyleTokenSchema>

export const ApiAnystyleTokenSequenceSchema = z.array(ApiAnystyleTokenSchema)
  .describe('A sequence of tokens representing one parsed reference')
export type ApiAnystyleTokenSequence = z.infer<typeof ApiAnystyleTokenSequenceSchema>

export const ApiAnystyleParsedReferenceSchema = z.object({
  id: z.uuid().describe('Unique identifier for the reference'),
  originalText: z.string().min(1).describe('The original raw reference string'),
  tokens: ApiAnystyleTokenSequenceSchema,
})

export type ApiAnystyleParsedReference = z.infer<typeof ApiAnystyleParsedReferenceSchema>

export const ApiAnystyleParseDataSchema = z.object({
  references: z.array(ApiAnystyleParsedReferenceSchema).describe('Array of parsed references with tokens'),
}).strict()
export type ApiAnystyleParseData = z.infer<typeof ApiAnystyleParseDataSchema>

export const ApiAnystyleParseResponseSchema = createApiResponseSchema(ApiAnystyleParseDataSchema)
export type ApiAnystyleParseResponse = z.infer<typeof ApiAnystyleParseResponseSchema>
