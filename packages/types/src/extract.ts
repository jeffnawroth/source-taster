import z from 'zod'
import { UserAISettingsSchema } from './ai'
import { createApiResponseSchema } from './api'
import { CSLVariableSchema } from './reference'

// ----- Request -----

export const ApiExtractExtractionConfigSchema = z.object({
  variables: z.array(CSLVariableSchema).nonempty().describe('CSL variables to extract'),
}).strict()

export type ApiExtractExtractionSettings = z.infer<typeof ApiExtractExtractionSettingsSchema>

export const ApiExtractExtractionSettingsSchema = z.object({
  extractionConfig: ApiExtractExtractionConfigSchema.describe('Configuration for field extraction'),
}).strict()

export type ApiExtractExtractionConfig = z.infer<typeof ApiExtractExtractionConfigSchema>

export const ApiExtractRequestSchema = z.object({
  text: z.string().min(1).describe('The text to extract references from'),
  extractionSettings: ApiExtractExtractionSettingsSchema.describe('User-configurable extraction settings'),
  aiSettings: UserAISettingsSchema.describe('User AI configuration'),
}).strict()

export type ApiExtractRequest = z.infer<typeof ApiExtractRequestSchema>

// ----- Response -----

export const ApiExtractReferenceSchema = z.object({
  id: z.string().min(1).describe('Unique identifier for the reference'),
  originalText: z.string().describe('The raw reference text as it appeared in the source'),
  metadata: CSLVariableSchema.describe('Extracted bibliographic metadata'),
}).strict()

export type ApiExtractReference = z.infer<typeof ApiExtractReferenceSchema>

export const ApiExtractDataSchema = z.object({
  references: z.array(ApiExtractReferenceSchema),
}).strict()

export type ApiExtractData = z.infer<typeof ApiExtractDataSchema>

export const APIExtractResponseSchema = createApiResponseSchema(ApiExtractDataSchema)
export type APIExtractResponse = z.infer<typeof APIExtractResponseSchema>
