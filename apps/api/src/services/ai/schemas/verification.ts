import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

// Zod schema for verification response
export const FieldDetailSchema = z.object({
  field: z.string().describe('Field name being compared'),
  reference_value: z.any().describe('Value from reference'),
  source_value: z.any().describe('Value from source'),
  match_score: z.number().int().min(0).max(100).describe('Match score from 0-100'),
})

export const VerificationResponseSchema = z.object({
  fieldDetails: z.array(FieldDetailSchema).describe('Detailed scoring information for each field'),
})

// Generate JSON Schema for verification
export const verificationJsonSchema = {
  name: 'field_verification',
  schema: zodToJsonSchema(VerificationResponseSchema, {
    $refStrategy: 'none', // Inline all schemas for OpenAI compatibility
  }),
}

// Export verification types
export type VerificationResponse = z.infer<typeof VerificationResponseSchema>
export type FieldDetail = z.infer<typeof FieldDetailSchema>
