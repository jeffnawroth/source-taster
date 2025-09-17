import type { AIModel, AIProvider, UserAISettings } from '@source-taster/types'

const DEFAULT_AI_PROVIDER: AIProvider = 'openai'
const DEFAULT_AI_MODEL: AIModel = 'gpt-4o'
/**
 * Default AI settings for the extension
 * Users must provide their own API key - no server-side keys available
 */
export const DEFAULT_AI_SETTINGS: UserAISettings = {
  provider: DEFAULT_AI_PROVIDER,
  apiKey: '',
  model: DEFAULT_AI_MODEL,
}
