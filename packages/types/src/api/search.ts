import z from 'zod'
import { createApiResponseSchema } from '../api/index.js'
import { CSLItemSchema } from '../app/index.js'

// ----- Request -----
export const ApiSearchReferenceSchema = z.object({
  id: z.uuid().describe('Unique identifier for the reference'),
  metadata: CSLItemSchema.describe('Bibliographic metadata for the reference'),
}).strict()

export type ApiSearchReference = z.infer<typeof ApiSearchReferenceSchema>

export const ApiSearchRequestSchema = z.object({
  references: z.array(ApiSearchReferenceSchema).min(1).describe('Array of references to search for'),
}).strict()

export type ApiSearchRequest = z.infer<typeof ApiSearchRequestSchema>

// ----- Response -----

export const ApiSearchSourceSchema = z.enum([
  'openalex',
  'crossref',
  'semanticscholar',
  'europepmc',
  'arxiv',
])

export type ApiSearchSource = z.infer<typeof ApiSearchSourceSchema>

export const ApiSearchCandidateSchema = z.object({
  id: z.uuid().describe('Unique identifier in the external database'),
  source: ApiSearchSourceSchema.describe('Which database this source comes from'),
  metadata: CSLItemSchema.describe('Bibliographic metadata from the database'),
  url: z.url().optional().describe('Canonical URL to access this source in the database'),
}).strict()

export type ApiSearchCandidate = z.infer<typeof ApiSearchCandidateSchema>

export const ApiSearchResultSchema = z.object({
  referenceId: z.uuid().describe('The ID of the reference this result corresponds to'),
  candidates: z.array(ApiSearchCandidateSchema),
}).strict()

export type ApiSearchResult = z.infer<typeof ApiSearchResultSchema>

export const ApiSearchDataSchema = z.object({
  results: z.array(ApiSearchResultSchema),
}).strict()

export type ApiSearchData = z.infer<typeof ApiSearchDataSchema>

export const ApiSearchResponseSchema = createApiResponseSchema(ApiSearchDataSchema)
export type ApiSearchResponse = z.infer<typeof ApiSearchResponseSchema>
