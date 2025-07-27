import type { FieldWeights } from '@source-taster/types'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

// Extract all keys from FieldWeights - guaranteed to include ALL fields
const validFields = Object.keys({} as FieldWeights) as [keyof FieldWeights, ...(keyof FieldWeights)[]]

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
