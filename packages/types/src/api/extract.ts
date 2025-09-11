import z from 'zod'
import { CSLItemSchema, CSLVariableWithoutIdSchema } from '../app/csl-json.zod'
import { ApiAISettingsSchema } from './ai'
import { createApiResponseSchema } from './api'

// ----- Request -----

// Config (Array der Felder, Default = alle Enum-Optionen)
export const ApiExtractExtractionConfigSchema = z.object({
  variables: z.array(CSLVariableWithoutIdSchema)
    .nonempty()
    .refine(v => !v.includes('id' as any), { message: '"id" is not selectable' })
    .default([...CSLVariableWithoutIdSchema.options])
    .describe('CSL variables to extract'),
}).strict()
export type ApiExtractExtractionConfig = z.infer<typeof ApiExtractExtractionConfigSchema>

// Settings (Objekt, Default = { extractionConfig: { variables: all } })
export const ApiExtractExtractionSettingsSchema = z.object({
  extractionConfig: ApiExtractExtractionConfigSchema
    .default({ variables: [...CSLVariableWithoutIdSchema.options] })
    .describe('Configuration for field extraction'),
}).strict()
export type ApiExtractExtractionSettings = z.infer<typeof ApiExtractExtractionSettingsSchema>

// Request (extractionSettings hat Default → Feld ist effektiv optional)
export const ApiExtractRequestSchema = z.object({
  text: z.string().min(1).describe('The text to extract references from'),
  extractionSettings: ApiExtractExtractionSettingsSchema
    .default({ extractionConfig: { variables: [...CSLVariableWithoutIdSchema.options] } })
    .describe('User-configurable extraction settings'),
  aiSettings: ApiAISettingsSchema.describe('User AI configuration'),
}).strict()
export type ApiExtractRequest = z.infer<typeof ApiExtractRequestSchema>

// ----- Response -----

export const ApiExtractReferenceSchema = z.object({
  id: z.uuid().describe('Unique identifier for the extracted reference'),
  originalText: z.string().describe('The raw reference text as it appeared in the source'),
  metadata: CSLItemSchema.describe('Extracted bibliographic metadata'),
}).strict()

export type ApiExtractReference = z.infer<typeof ApiExtractReferenceSchema>

export const ApiExtractDataSchema = z.object({
  references: z.array(ApiExtractReferenceSchema),
}).strict()

export type ApiExtractData = z.infer<typeof ApiExtractDataSchema>

export const ApiExtractResponseSchema = createApiResponseSchema(ApiExtractDataSchema)
export type ApiExtractResponse = z.infer<typeof ApiExtractResponseSchema>
