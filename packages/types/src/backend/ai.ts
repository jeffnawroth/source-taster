import type { ApiExtractRequest } from '../api'
import type { LLMExtractPayload } from './llm'
import { z } from 'zod'

export const OpenAIConfigSchema = z.object({
  apiKey: z.string().min(1),
  model: z.string().min(1),
  baseUrl: z.string().url().optional().describe('Optional override of the API base URL'),
  maxRetries: z.number().int().min(0).default(3),
  timeout: z.number().int().min(100).default(30_000).describe('Request timeout in ms'),
  temperature: z.number().min(0).max(2).default(0.7),
}).strict()
export type OpenAIConfig = z.infer<typeof OpenAIConfigSchema>

export interface AIService {
  extractReferences: (extractionRequest: ApiExtractRequest) => Promise<LLMExtractPayload>
}

export const PROVIDER_CONFIG = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    name: 'OpenAI',
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1/',
    name: 'Anthropic',
  },
  google: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    name: 'Google AI (Gemini)',
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    name: 'DeepSeek',
  },
} as const
