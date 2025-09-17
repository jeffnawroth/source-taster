/**
 * AI service interfaces and configuration types
 */
import z from 'zod'

export const ApiAIProviderSchema = z.enum(['openai', 'anthropic', 'google', 'deepseek'])
export type ApiAIProvider = z.infer<typeof ApiAIProviderSchema>

export const ApiOpenAIModelSchema = z.enum(['gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-4.1'])
export type ApiOpenAIModel = z.infer<typeof ApiOpenAIModelSchema>

export const ApiAnthropicModelSchema = z.enum(['claude-opus-4-1', 'claude-sonnet-4-0', 'claude-3-5-haiku-latest'])
export type ApiAnthropicModel = z.infer<typeof ApiAnthropicModelSchema>

export const ApiGoogleModelSchema = z.enum(['gemini-2.5-pro', 'gemini-2.5-flash'])
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
  model: ApiAIModelSchema.default('gpt-4.1'),
}).strict()
export type ApiAISettings = z.infer<typeof ApiAISettingsSchema>
export const DEFAULT_AI_SETTINGS: ApiAISettings = { provider: 'openai', model: 'gpt-4.1' }

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
