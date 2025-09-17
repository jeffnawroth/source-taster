import z from 'zod'
import { DateInfoSchema, ExternalIdentifiersSchema, SourceInfoSchema } from './reference.types'

// Helper function to extract all field names from Zod schemas
function extractFieldNames() {
  const topLevelFields = ['title', 'authors'] as const
  const dateFields = Object.keys(DateInfoSchema.shape) as (keyof typeof DateInfoSchema.shape)[]
  const sourceFields = Object.keys(SourceInfoSchema.shape) as (keyof typeof SourceInfoSchema.shape)[]
  const identifierFields = Object.keys(ExternalIdentifiersSchema.shape) as (keyof typeof ExternalIdentifiersSchema.shape)[]
  return [...topLevelFields, ...dateFields, ...sourceFields, ...identifierFields] as const
}

export const ReferenceMetadataFieldsSchema = z.enum(extractFieldNames())
export type ReferenceMetadataFields = z.infer<typeof ReferenceMetadataFieldsSchema>
