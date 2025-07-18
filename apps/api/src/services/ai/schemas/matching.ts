import type { FieldWeights } from '@source-taster/types'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

// This Record type forces us to list ALL FieldWeights keys - TypeScript error if any missing!
const validFieldMapping: Record<keyof FieldWeights, keyof FieldWeights> = {
  title: 'title',
  authors: 'authors',
  year: 'year',
  doi: 'doi',
  isbn: 'isbn',
  issn: 'issn',
  pmid: 'pmid',
  pmcid: 'pmcid',
  arxivId: 'arxivId',
  containerTitle: 'containerTitle',
  volume: 'volume',
  issue: 'issue',
  pages: 'pages',
  publisher: 'publisher',
  url: 'url',
  sourceType: 'sourceType',
  conference: 'conference',
  institution: 'institution',
  edition: 'edition',
  articleNumber: 'articleNumber',
  subtitle: 'subtitle',
}

// Extract all keys - now guaranteed to include ALL FieldWeights fields
const validFields = Object.keys(validFieldMapping) as [keyof FieldWeights, ...(keyof FieldWeights)[]]

// Zod schema for a single field match detail from AI
export const AIMatchFieldDetailSchema = z.object({
  field: z.enum(validFields).describe('Field name being compared (must be from FieldWeights)'),
  match_score: z.number().int().min(0).max(100).describe('Match score from 0-100'),
})

// Zod schema for matching response - object with fieldDetails array
export const MatchingResponseSchema = z.object({
  fieldDetails: z.array(AIMatchFieldDetailSchema).describe('Array of field match scores'),
})

// Generate JSON Schema for matching
export const matchingJsonSchema = {
  name: 'field_matching',
  schema: zodToJsonSchema(MatchingResponseSchema, {
    $refStrategy: 'none', // Inline all schemas for OpenAI compatibility
  }),
}
