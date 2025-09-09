import type { ApiAIProvider } from '@source-taster/types'
import { ApiAIProviderSchema } from '@source-taster/types'
import { httpBadRequest } from '../errors/http'
import { deleteApiKey, loadApiKey, saveApiKey } from '../secrets/keystore'

export class UserService {
  /**
   * Save API key for a user and provider
   */
  async saveUserAISecret(userId: string, provider: ApiAIProvider, apiKey: string): Promise<boolean> {
    try {
      await saveApiKey(userId, provider, apiKey)
      return true
    }
    catch (error) {
      throw new Error(`Failed to save API key for provider ${provider}: ${error}`)
    }
  }

  /**
   * Get information about user's AI secret for a specific provider
   */
  async getUserAISecretInfo(userId: string, provider: ApiAIProvider): Promise<{
    hasApiKey: boolean
    provider: ApiAIProvider
  }> {
    try {
      const apiKey = await loadApiKey(userId, provider)
      return {
        hasApiKey: !!apiKey,
        provider,
      }
    }
    catch (error) {
      throw new Error(`Failed to check API key for provider ${provider}: ${error}`)
    }
  }

  /**
   * Delete API key for a user and provider
   */
  async deleteUserAISecret(userId: string, provider: ApiAIProvider): Promise<boolean> {
    try {
      await deleteApiKey(userId, provider)
      return true
    }
    catch (error) {
      throw new Error(`Failed to delete API key for provider ${provider}: ${error}`)
    }
  }

  /**
   * Validate and parse provider from query parameter
   */
  validateProvider(providerQuery: string | undefined): ApiAIProvider {
    if (!providerQuery) {
      return httpBadRequest('Missing ?provider query parameter') as never
    }

    try {
      return ApiAIProviderSchema.parse(providerQuery)
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (error) {
      return httpBadRequest(`Invalid provider "${providerQuery}". Must be one of: openai, anthropic, google, deepseek`) as never
    }
  }
}

// Singleton instance for dependency injection
export const userService = new UserService()
