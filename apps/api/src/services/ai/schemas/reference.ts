import {
  AIExtractedReferenceSchema,
  AIExtractionResponseSchema,
  DateInfoSchema,
  ExternalIdentifiersSchema,
  type ExtractionSettings,
  ReferenceMetadataSchema,
  SourceInfoSchema,
} from '@source-taster/types'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

// Helper function to create conditional schema fields based on enabled fields
function createConditionalSchema<T extends z.ZodRawShape>(
  enabledFields: string[],
  baseSchema: z.ZodObject<T>,
): z.ZodObject<any> {
  const shape = baseSchema.shape
  const conditionalShape: Record<string, z.ZodTypeAny> = {}

  for (const [fieldName, schema] of Object.entries(shape)) {
    if (enabledFields.includes(fieldName)) {
      conditionalShape[fieldName] = schema
    }
  }

  return z.object(conditionalShape)
}

// Create dynamic schema based on extraction settings
export function createDynamicExtractionSchema(extractionSettings: ExtractionSettings) {
  const enabledFields = extractionSettings.extractionConfig

  // Create conditional schemas from existing base schemas
  const DynamicExternalIdentifiersSchema = createConditionalSchema(enabledFields, ExternalIdentifiersSchema)
  const DynamicSourceInfoSchema = createConditionalSchema(enabledFields, SourceInfoSchema)
  const DynamicDateInfoSchema = createConditionalSchema(enabledFields, DateInfoSchema)

  // Create dynamic metadata schema by applying conditional logic to the base schema
  const baseMetadataConditional = createConditionalSchema(enabledFields, ReferenceMetadataSchema)

  // Override nested objects with their dynamic versions if any of their fields are enabled
  const metadataShape: Record<string, z.ZodTypeAny> = { ...baseMetadataConditional.shape }

  const hasDateFields = enabledFields.some(field => Object.keys(DateInfoSchema.shape).includes(field))
  const hasSourceFields = enabledFields.some(field => Object.keys(SourceInfoSchema.shape).includes(field))
  const hasIdentifierFields = enabledFields.some(field => Object.keys(ExternalIdentifiersSchema.shape).includes(field))

  if (hasDateFields) {
    metadataShape.date = DynamicDateInfoSchema.optional().describe('Date information')
  }

  if (hasSourceFields) {
    metadataShape.source = DynamicSourceInfoSchema.optional().describe('Source information')
  }

  if (hasIdentifierFields) {
    metadataShape.identifiers = DynamicExternalIdentifiersSchema.optional().describe('External database identifiers')
  }

  const DynamicReferenceMetadataSchema = z.object(metadataShape)

  // Create dynamic reference schema by overriding the metadata part of AIExtractedReferenceSchema
  const DynamicReferenceSchema = AIExtractedReferenceSchema.extend({
    metadata: DynamicReferenceMetadataSchema.describe('Parsed bibliographic information'),
  })

  // Create dynamic extraction response schema by overriding the references array
  const DynamicExtractionResponseSchema = AIExtractionResponseSchema.extend({
    references: z.array(DynamicReferenceSchema).describe('Array of extracted references'),
  })

  return {
    name: 'reference_extraction',
    schema: zodToJsonSchema(DynamicExtractionResponseSchema, {
      $refStrategy: 'none',
    }),
  }
}
