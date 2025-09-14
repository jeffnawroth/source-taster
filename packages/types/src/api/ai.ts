/**
 * AI service interfaces and configuration types
 */
import z from 'zod'

export const ApiAIProviderSchema = z.enum(['openai', 'anthropic', 'google', 'deepseek'])
export type ApiAIProvider = z.infer<typeof ApiAIProviderSchema>

export const ApiOpenAIModelSchema = z.enum(['gpt-4o'])
export type ApiOpenAIModel = z.infer<typeof ApiOpenAIModelSchema>

export const ApiAnthropicModelSchema = z.enum(['claude-opus-4-1', 'claude-sonnet-4-0', 'claude-3-5-haiku-latest'])
export type ApiAnthropicModel = z.infer<typeof ApiAnthropicModelSchema>

export const ApiGoogleModelSchema = z.enum(['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'])
export type ApiGoogleModel = z.infer<typeof ApiGoogleModelSchema>

export const ApiDeepSeekModelSchema = z.enum(['deepseek-chat', 'deepseek-reasoner'])
export type ApiDeepSeekModel = z.infer<typeof ApiDeepSeekModelSchema>

export const ApiAIModelSchema = z.union([
  ApiOpenAIModelSchema,
  ApiAnthropicModelSchema,
  ApiGoogleModelSchema,
  ApiDeepSeekModelSchema,
])
export type ApiAIModel = z.infer<typeof ApiAIModelSchema>

export const ApiAISettingsSchema = z.object({
  provider: ApiAIProviderSchema.default('openai'),
  model: ApiAIModelSchema.default('gpt-4o'),
}).strict()
export type ApiAISettings = z.infer<typeof ApiAISettingsSchema>
export const DEFAULT_AI_SETTINGS: ApiAISettings = { provider: 'openai', model: 'gpt-4o' }

// const ApiAISettingsOpenAISchema = z.object({
//   provider: z.literal('openai'),
//   model: ApiOpenAIModelSchema,
// }).strict()
// export type ApiAISettingsOpenAI = z.infer<typeof ApiAISettingsOpenAISchema>

// const ApiAISettingsAnthropicSchema = z.object({
//   provider: z.literal('anthropic'),
//   model: ApiAnthropicModelSchema,
// }).strict()
// export type ApiAISettingsAnthropic = z.infer<typeof ApiAISettingsAnthropicSchema>

// const ApiAISettingsGoogleSchema = z.object({
//   provider: z.literal('google'),
//   model: ApiGoogleModelSchema,
// }).strict()
// export type ApiAISettingsGoogle = z.infer<typeof ApiAISettingsGoogleSchema>

// const ApiAISettingsDeepSeekSchema = z.object({
//   provider: z.literal('deepseek'),
//   model: ApiDeepSeekModelSchema,
// }).strict()
// export type ApiAISettingsDeepSeek = z.infer<typeof ApiAISettingsDeepSeekSchema>

// export const ApiAISettingsSchema = z.discriminatedUnion('provider', [
//   ApiAISettingsOpenAISchema,
//   ApiAISettingsAnthropicSchema,
//   ApiAISettingsGoogleSchema,
//   ApiAISettingsDeepSeekSchema,
// ])
// export type ApiAISettings = z.infer<typeof ApiAISettingsSchema>

// export const ApiAIModelSchema = z.union([
//   ApiOpenAIModelSchema,
//   ApiAnthropicModelSchema,
//   ApiGoogleModelSchema,
//   ApiDeepSeekModelSchema,
// ])

// export const ApiAISettingsSchema = z.object({
//   provider: ApiAIProviderSchema,
//   model: ApiAIModelSchema,
// }).strict()
// export type ApiAIRequest = z.infer<typeof ApiAISettingsSchema>

/**
 * Response from AI service containing extracted references (without IDs)
 * This is converted to the public ExtractionResponse before sending to frontend
 */
// export const AIExtractionResponseSchema = z.object({
//   references: z.array(LLMExtractReferenceSchema).describe('Array of extracted references'),
// })

// export type AIExtractionResponse = z.infer<typeof AIExtractionResponseSchema>

/**
 * Interface for AI service implementations
 * Defines the contract that all AI services must implement
 */
// export interface AIService {
//   extractReferences: (extractionRequest: ApiExtractRequest) => Promise<LLMExtractPayload>
// }

/**
 * AI Provider types
 */
// export const AI_PROVIDERS = {
//   openai: 'OpenAI',
//   anthropic: 'Anthropic (Claude)',
//   google: 'Google (Gemini)',
//   deepseek: 'DeepSeek',
// } as const

// export type AIProvider = keyof typeof AI_PROVIDERS

/**
 * Available models per provider (keys only - descriptions come from i18n)
 */
// export const PROVIDER_MODELS = {
// openai: ['o3', 'gpt-4o', 'o3-mini'],
// anthropic: ['claude-opus-4-20250514', 'claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
// google: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'],
// deepseek: ['deepseek-chat', 'deepseek-reasoner'],
// } as const

// Union type of all possible models across all providers
// export type AIModel =
//   | typeof PROVIDER_MODELS['openai'][number]
//   | typeof PROVIDER_MODELS['anthropic'][number]
//   | typeof PROVIDER_MODELS['google'][number]
//   | typeof PROVIDER_MODELS['deepseek'][number]

/**
 * User AI settings for the extension
 */
// export interface UserAISettings {
//   /** Selected AI provider */
//   provider: ApiAi
//   /** User's API key for the selected provider */
//   apiKey: string
//   /** Selected model for the provider */
//   model: AIModel
// }

/**
 * Provider endpoints and configuration
 */

// export const OPENAI_MODELS_SCHEMA = z.enum(PROVIDER_MODELS.openai)
// export const ANTHROPIC_MODELS_SCHEMA = z.enum(PROVIDER_MODELS.anthropic)
// export const GOOGLE_MODELS_SCHEMA = z.enum(PROVIDER_MODELS.google)
// export const DEEPSEEK_MODELS_SCHEMA = z.enum(PROVIDER_MODELS.deepseek)

// Union schema for all models
// export const AI_MODEL_SCHEMA = z.union([
//   OPENAI_MODELS_SCHEMA,
//   ANTHROPIC_MODELS_SCHEMA,
//   GOOGLE_MODELS_SCHEMA,
//   DEEPSEEK_MODELS_SCHEMA,
// ])

export const PROVIDER_LABELS: Record<ApiAIProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic (Claude)',
  google: 'Google (Gemini)',
  deepseek: 'DeepSeek',
} as const

// 2) Modelle je Provider (aus den Zod-Enums abgeleitet)
export const PROVIDER_MODELS = {
  openai: ApiOpenAIModelSchema.options, // readonly tuple → string[]
  anthropic: ApiAnthropicModelSchema.options,
  google: ApiGoogleModelSchema.options,
  deepseek: ApiDeepSeekModelSchema.options,
} as const satisfies Record<ApiAIProvider, readonly ApiAIModel[]>

// Optional hilfreich für UI:
export const PROVIDERS: readonly ApiAIProvider[] = ApiAIProviderSchema.options
