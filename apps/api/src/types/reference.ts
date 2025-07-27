import type { ExtractionSettings, ReferenceMetadataFields } from '@source-taster/types'
import { AIExtractedReferenceSchema, AIExtractionResponseSchema, DateInfoSchema, ExternalIdentifiersSchema, ReferenceMetadataSchema, SourceInfoSchema } from '@source-taster/types'
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
function createDynamicNestedSchemas(fields: ReferenceMetadataFields[]) {
  return {
    DynamicExternalIdentifiersSchema: createConditionalSchema(fields, ExternalIdentifiersSchema),
    DynamicSourceInfoSchema: createConditionalSchema(fields, SourceInfoSchema),
    DynamicDateInfoSchema: createConditionalSchema(fields, DateInfoSchema),
  }
}

// Build the metadata shape with conditional nested objects
function buildMetadataShape(fields: ReferenceMetadataFields[], dynamicSchemas: ReturnType<typeof createDynamicNestedSchemas>) {
  const baseMetadataConditional = createConditionalSchema(fields, ReferenceMetadataSchema)
  const metadataShape: Record<string, z.ZodTypeAny> = { ...baseMetadataConditional.shape }

  const hasDateFields = hasAnyFieldsEnabled(fields, DateInfoSchema)
  const hasSourceFields = hasAnyFieldsEnabled(fields, SourceInfoSchema)
  const hasIdentifierFields = hasAnyFieldsEnabled(fields, ExternalIdentifiersSchema)

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
  const { fields } = extractionSettings.extractionConfig

  // If no fields are enabled, return a schema that only allows empty metadata
  // if (enabledFields.length === 0) {
  //   const EmptyMetadataSchema = z.object({}).strict().describe('No fields requested for extraction')

  //   const EmptyReferenceSchema = AIExtractedReferenceSchema.extend({
  //     metadata: EmptyMetadataSchema.describe('Empty metadata - no fields requested'),
  //   })

  //   const EmptyExtractionResponseSchema = AIExtractionResponseSchema.extend({
  //     references: z.array(EmptyReferenceSchema).describe('Array of references with empty metadata'),
  //   })

  //   return {
  //     name: 'reference_extraction',
  //     schema: zodToJsonSchema(EmptyExtractionResponseSchema, {
  //       $refStrategy: 'none',
  //     }),
  //   }
  // }

  const dynamicSchemas = createDynamicNestedSchemas(fields)
  const DynamicReferenceMetadataSchema = buildMetadataShape(fields, dynamicSchemas)

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
