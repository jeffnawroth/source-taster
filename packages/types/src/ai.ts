/**
 * AI service interfaces and configuration types
 */

import type { ExtractionRequest } from './extraction'
import type { APIMatchingSettings, FieldMatchDetail } from './matching'
import type { ReferenceMetadataFields } from './reference/reference.constants'
import z from 'zod'
import { AIExtractedReferenceSchema } from './reference'

/**
 * Response from AI matching service
 * Contains field-level match scores for each reference
 */
export interface AIMatchingResponse {
  /** Array of field match details */
  fieldDetails: FieldMatchDetail[]
}

/**
 * Response from AI service containing extracted references (without IDs)
 * This is converted to the public ExtractionResponse before sending to frontend
 */
export const AIExtractionResponseSchema = z.object({
  references: z.array(AIExtractedReferenceSchema).describe('Array of extracted references'),
})

export type AIExtractionResponse = z.infer<typeof AIExtractionResponseSchema>

/**
 * Interface for AI service implementations
 * Defines the contract that all AI services must implement
 */
export interface AIService {
  extractReferences: (extractionRequest: ExtractionRequest) => Promise<AIExtractionResponse>
  matchFields: (prompt: string, matchingSettings: APIMatchingSettings, availableFields: ReferenceMetadataFields[]) => Promise<AIMatchingResponse>
}

/**
 * AI Provider types
 */
export const AI_PROVIDERS = {
  openai: 'OpenAI',
  anthropic: 'Anthropic (Claude)',
  google: 'Google (Gemini)',
} as const

export type AIProvider = keyof typeof AI_PROVIDERS

/**
 * Available models per provider (keys only - descriptions come from i18n)
 */
export const PROVIDER_MODELS = {
  openai: ['o3', 'gpt-4o', 'o3-mini'],
  anthropic: ['claude-4-opus', 'claude-4-sonnet', 'claude-3-5-haiku'],
  google: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'],
} as const

// Union type of all possible models across all providers
export type AIModel =
  | typeof PROVIDER_MODELS['openai'][number]
  | typeof PROVIDER_MODELS['anthropic'][number]
  | typeof PROVIDER_MODELS['google'][number]

/**
 * User AI settings for the extension
 */
export interface UserAISettings {
  /** Selected AI provider */
  provider: AIProvider
  /** User's API key for the selected provider */
  apiKey: string
  /** Selected model for the provider */
  model: AIModel
}

/**
 * Provider endpoints and configuration
 */
export const PROVIDER_CONFIG = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    name: 'OpenAI',
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1',
    name: 'Anthropic',
  },
  google: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    name: 'Google AI (Gemini)',
  },
} as const

/**
 * Zod schemas for validation
 */
export const AI_PROVIDER_SCHEMA = z.enum(['openai', 'anthropic', 'google'])

export const OPENAI_MODELS_SCHEMA = z.enum(PROVIDER_MODELS.openai)
export const ANTHROPIC_MODELS_SCHEMA = z.enum(PROVIDER_MODELS.anthropic)
export const GOOGLE_MODELS_SCHEMA = z.enum(PROVIDER_MODELS.google)

// Union schema for all models
export const AI_MODEL_SCHEMA = z.union([
  OPENAI_MODELS_SCHEMA,
  ANTHROPIC_MODELS_SCHEMA,
  GOOGLE_MODELS_SCHEMA,
])

/**
 * User AI settings schema
 */
export const UserAISettingsSchema = z.object({
  provider: AI_PROVIDER_SCHEMA,
  apiKey: z.string().min(1),
  model: AI_MODEL_SCHEMA, // Type-safe model validation
})

/**
 * Configuration interface for OpenAI-compatible service
 * Now supports multiple providers through baseUrl
 */
export interface OpenAIConfig {
  apiKey: string
  model: string
  baseUrl?: string // For provider compatibility
  maxRetries: number
  timeout: number
  temperature: number
}
