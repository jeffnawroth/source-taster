import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

// Zod schema for a single field match detail from AI
export const AIFieldDetailSchema = z.object({
  field: z.string().describe('Field name being compared'),
  match_score: z.number().int().min(0).max(100).describe('Match score from 0-100'),
})

// Zod schema for verification response - object with fieldDetails array
export const VerificationResponseSchema = z.object({
  fieldDetails: z.array(AIFieldDetailSchema).describe('Array of field match scores'),
})

// Generate JSON Schema for verification
export const verificationJsonSchema = {
  name: 'field_verification',
  schema: zodToJsonSchema(VerificationResponseSchema, {
    $refStrategy: 'none', // Inline all schemas for OpenAI compatibility
  }),
}
