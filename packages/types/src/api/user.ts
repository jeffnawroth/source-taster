import { z } from 'zod'
import { ApiAIProviderSchema } from './ai'
import { createApiResponseSchema } from './api'

// ----- Request -----
export const ApiUserAISecretsRequestSchema = z.object({
  provider: ApiAIProviderSchema,
  apiKey: z.string().min(1),
}).strict()
export type ApiUserAISecretsRequest = z.infer<typeof ApiUserAISecretsRequestSchema>

// ----- Save Response -----
export const ApiUserAISecretsDataSchema = z.object({
  saved: z.literal(true),
}).strict()
export type ApiUserAISecretsData = z.infer<typeof ApiUserAISecretsDataSchema>

export const ApiUserAISecretsResponseSchema = createApiResponseSchema(ApiUserAISecretsDataSchema)
export type ApiUserAISecretsResponse = z.infer<typeof ApiUserAISecretsResponseSchema>

// ----- Info Response -----
export const ApiUserAISecretsInfoDataSchema = z.object({
  hasApiKey: z.boolean(),
  provider: ApiAIProviderSchema.optional(),
}).strict()
export type ApiUserAISecretsInfoData = z.infer<typeof ApiUserAISecretsInfoDataSchema>

export const ApiUserAISecretsInfoResponseSchema
  = createApiResponseSchema(ApiUserAISecretsInfoDataSchema)
export type ApiUserAISecretsInfoResponse =
  z.infer<typeof ApiUserAISecretsInfoResponseSchema>

// ----- Delete Response -----
export const ApiUserAISecretsDeleteDataSchema = z.object({
  deleted: z.literal(true),
}).strict()
export type ApiUserAISecretsDeleteData = z.infer<typeof ApiUserAISecretsDeleteDataSchema>

export const ApiUserAISecretsDeleteResponseSchema
  = createApiResponseSchema(ApiUserAISecretsDeleteDataSchema)
export type ApiUserAISecretsDeleteResponse =
  z.infer<typeof ApiUserAISecretsDeleteResponseSchema>
