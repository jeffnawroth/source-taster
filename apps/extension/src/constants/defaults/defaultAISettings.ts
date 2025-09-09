import type { ApiAIProvider, ApiAISettings, ApiOpenAIModel } from '@source-taster/types'

const DEFAULT_AI_PROVIDER: ApiAIProvider = 'openai'
const DEFAULT_AI_MODEL: ApiOpenAIModel = 'gpt-4o'
/**
 * Default AI settings for the extension
 * Users must provide their own API key - no server-side keys available
 */
export const DEFAULT_AI_SETTINGS: ApiAISettings = {
  provider: DEFAULT_AI_PROVIDER,
  model: DEFAULT_AI_MODEL,
}
