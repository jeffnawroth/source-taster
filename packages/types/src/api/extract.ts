import z from 'zod'
import { CSLItemSchema, CSLVariableWithoutIdSchema } from '../app/csl-json.zod'
import { ApiAISettingsSchema, DEFAULT_AI_SETTINGS } from './ai'
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
export const DEFAULT_EXTRACTION_CONFIG: ApiExtractExtractionConfig = {
  variables: [...CSLVariableWithoutIdSchema.options],
} as const as ApiExtractExtractionConfig
// Settings (Objekt, Default = { extractionConfig: { variables: all } })
export const ApiExtractExtractionSettingsSchema = z.object({
  extractionConfig: ApiExtractExtractionConfigSchema
    .default(DEFAULT_EXTRACTION_CONFIG)
    .describe('Configuration for field extraction'),
}).strict()
export type ApiExtractExtractionSettings = z.infer<typeof ApiExtractExtractionSettingsSchema>
export const DEFAULT_EXTRACTION_SETTINGS: ApiExtractExtractionSettings = {
  extractionConfig: { ...DEFAULT_EXTRACTION_CONFIG },
} as const as ApiExtractExtractionSettings

// Request (extractionSettings hat Default → Feld ist effektiv optional)
export const ApiExtractRequestSchema = z.object({
  text: z.string().min(1).describe('The text to extract references from'),
  extractionSettings: ApiExtractExtractionSettingsSchema
    .default(DEFAULT_EXTRACTION_SETTINGS)
    .describe('User-configurable extraction settings'),
  aiSettings: ApiAISettingsSchema.default(DEFAULT_AI_SETTINGS).describe('User AI configuration'),
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
