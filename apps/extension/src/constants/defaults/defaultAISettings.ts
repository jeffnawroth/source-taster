import type { UserAISettings } from '@source-taster/types'

/**
 * Default AI settings for the extension
 * Users must provide their own API key - no server-side keys available
 */
export const DEFAULT_AI_SETTINGS: UserAISettings = {
  apiKey: '',
  model: 'gpt-4o',
}
