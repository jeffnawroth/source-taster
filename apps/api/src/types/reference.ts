import type { ExtractionSettings } from '@source-taster/types'
import type { ResponseFormatJSONSchema } from 'openai/resources/shared.mjs'
import { AIExtractedReferenceSchema, AIExtractionResponseSchema, CSLItemSchema } from '@source-taster/types'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

// Helper function to create conditional schema fields based on enabled fields
function createConditionalCSLSchema(enabledFields: string[]): z.ZodType<any> {
  const cslShape = CSLItemSchema.shape
  const conditionalShape: Record<string, z.ZodTypeAny> = {}

  // Always include required CSL fields
  // Don't include the 'id' variable
  conditionalShape.type = cslShape.type

  // Add optional fields based on user selection
  for (const [fieldName, schema] of Object.entries(cslShape)) {
    if (fieldName !== 'id' && fieldName !== 'type' && enabledFields.includes(fieldName)) {
      conditionalShape[fieldName] = schema
    }
  }

  return z.object(conditionalShape)
}

// Create dynamic schema based on extraction settings
export function createDynamicExtractionSchema(extractionSettings: ExtractionSettings) {
  const { variables } = extractionSettings.extractionConfig

  // Create dynamic CSL schema based on enabled variables/fields
  const DynamicCSLItemSchema = createConditionalCSLSchema(variables)

  const DynamicCSLReferenceSchema = AIExtractedReferenceSchema.extend({
    metadata: DynamicCSLItemSchema.describe('Extracted reference metadata in CSL-JSON format with selected fields'),
  })

  const DynamicCSLExtractionResponseSchema = AIExtractionResponseSchema.extend({
    references: z.array(DynamicCSLReferenceSchema).describe('Array of extracted references with dynamic CSL metadata'),
  })

  return {
    DynamicExtractionResponseSchema: DynamicCSLExtractionResponseSchema,
    jsonSchema: {
      name: 'reference_extraction',
      schema: zodToJsonSchema(DynamicCSLExtractionResponseSchema, {
        $refStrategy: 'none',
      }),
    } as ResponseFormatJSONSchema.JSONSchema,
  }
}
