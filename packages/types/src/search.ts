import z from 'zod'
import { createApiResponseSchema } from './api'
import { CSLItemSchema } from './reference'

// ----- Request -----
export const APISearchReferenceInputSchema = z.object({
  id: z.string().min(1).describe('Unique identifier for the reference'),
  metadata: CSLItemSchema.describe('Bibliographic metadata for the reference'),
}).strict()

export type APISearchReferenceInput = z.infer<typeof APISearchReferenceInputSchema>

export const ApiSearchRequestSchema = z.object({
  references: z.array(APISearchReferenceInputSchema).min(1).describe('Array of references to search for'),
}).strict()

export type ApiSearchRequest = z.infer<typeof ApiSearchRequestSchema>

// ----- Response -----

export const APISearchSourceSchema = z.enum([
  'openalex',
  'crossref',
  'semanticscholar',
  'europepmc',
  'arxiv',
])

export type APISearchSource = z.infer<typeof APISearchSourceSchema>

export const APISearchCandidateSchema = z.object({
  id: z.string().min(1).describe('Unique identifier in the external database'),
  source: APISearchSourceSchema.describe('Which database this source comes from'),
  metadata: CSLItemSchema.describe('Bibliographic metadata from the database'),
  url: z.string().url().optional().describe('Canonical URL to access this source in the database'),
}).strict()

export type APISearchCandidate = z.infer<typeof APISearchCandidateSchema>

export const APISearchResultSchema = z.object({
  referenceId: z.string().min(1),
  candidates: z.array(APISearchCandidateSchema),
}).strict()

export type APISearchResult = z.infer<typeof APISearchResultSchema>

export const APISearchDataSchema = z.object({
  results: z.array(APISearchResultSchema),
}).strict()

export type APISearchData = z.infer<typeof APISearchDataSchema>

export const APISearchResponseSchema = createApiResponseSchema(APISearchDataSchema)
export type APISearchResponse = z.infer<typeof APISearchResponseSchema>
