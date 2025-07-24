import {
  AIExtractedReferenceSchema,
  AIExtractionResponseSchema,
  AuthorSchema,
  DateInfoSchema,
  ExternalIdentifiersSchema,
  type ExtractionSettings,
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

  // Create dynamic metadata schema
  const metadataShape: Record<string, z.ZodTypeAny> = {}

  if (enabledFields.includes('title')) {
    metadataShape.title = z.string().optional().describe('Title of the work')
  }

  if (enabledFields.includes('authors')) {
    metadataShape.authors = z.array(z.union([z.string(), AuthorSchema])).optional().describe('List of author names or author objects')
  }

  // Only include nested objects if any of their fields are enabled
  const hasDateFields = enabledFields.some(field => Object.keys(DateInfoSchema.shape).includes(field))
  const hasSourceFields = enabledFields.some(field => Object.keys(SourceInfoSchema.shape).includes(field))
  const hasIdentifierFields = enabledFields.some(field => Object.keys(ExternalIdentifiersSchema.shape).includes(field))

  if (hasDateFields) {
    metadataShape.date = DynamicDateInfoSchema.describe('Date information')
  }

  if (hasSourceFields) {
    metadataShape.source = DynamicSourceInfoSchema.describe('Source information')
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
