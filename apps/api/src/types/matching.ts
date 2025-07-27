import type { ReferenceMetadataFields } from '@source-taster/types'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

/**
 * Create dynamic matching schema based on available fields
 */
export function createMatchingSchema(availableFields: ReferenceMetadataFields[]) {
  const AIMatchFieldDetailSchema = z.object({
    field: z.enum(availableFields as [ReferenceMetadataFields, ...ReferenceMetadataFields[]]).describe('Field name being compared'),
    match_score: z.number().int().min(0).max(100).describe('Match score from 0-100'),
  })

  const MatchingResponseSchema = z.object({
    fieldDetails: z.array(AIMatchFieldDetailSchema).describe('Array of field match scores'),
  })

  return {
    AIMatchFieldDetailSchema,
    MatchingResponseSchema,
    jsonSchema: {
      name: 'field_matching',
      schema: zodToJsonSchema(MatchingResponseSchema, {
        $refStrategy: 'none',
      }),
    },
  }
}
