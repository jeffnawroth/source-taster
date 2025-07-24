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

// Check if any fields from a schema are enabled
function hasAnyFieldsEnabled(enabledFields: string[], schema: z.ZodObject<any>): boolean {
  return enabledFields.some(field => Object.keys(schema.shape).includes(field))
}

// Create dynamic nested schemas for date, source, and identifiers
function createDynamicNestedSchemas(enabledFields: string[]) {
  return {
    DynamicExternalIdentifiersSchema: createConditionalSchema(enabledFields, ExternalIdentifiersSchema),
    DynamicSourceInfoSchema: createConditionalSchema(enabledFields, SourceInfoSchema),
    DynamicDateInfoSchema: createConditionalSchema(enabledFields, DateInfoSchema),
  }
}

// Build the metadata shape with conditional nested objects
function buildMetadataShape(enabledFields: string[], dynamicSchemas: ReturnType<typeof createDynamicNestedSchemas>) {
  const baseMetadataConditional = createConditionalSchema(enabledFields, ReferenceMetadataSchema)
  const metadataShape: Record<string, z.ZodTypeAny> = { ...baseMetadataConditional.shape }

  const hasDateFields = hasAnyFieldsEnabled(enabledFields, DateInfoSchema)
  const hasSourceFields = hasAnyFieldsEnabled(enabledFields, SourceInfoSchema)
  const hasIdentifierFields = hasAnyFieldsEnabled(enabledFields, ExternalIdentifiersSchema)

  if (hasDateFields) {
    metadataShape.date = dynamicSchemas.DynamicDateInfoSchema.optional().describe('Date information')
  }

  if (hasSourceFields) {
    metadataShape.source = dynamicSchemas.DynamicSourceInfoSchema.optional().describe('Source information')
  }

  if (hasIdentifierFields) {
    metadataShape.identifiers = dynamicSchemas.DynamicExternalIdentifiersSchema.optional().describe('External database identifiers')
  }

  return z.object(metadataShape)
}

// Create dynamic schema based on extraction settings
export function createDynamicExtractionSchema(extractionSettings: ExtractionSettings) {
  const enabledFields = extractionSettings.extractionConfig

  const dynamicSchemas = createDynamicNestedSchemas(enabledFields)
  const DynamicReferenceMetadataSchema = buildMetadataShape(enabledFields, dynamicSchemas)

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
