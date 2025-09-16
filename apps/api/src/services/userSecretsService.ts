import type { ApiAIProvider, ApiUserAISecretsInfoData } from '@source-taster/types'
import { ApiAIProviderSchema } from '@source-taster/types'
import { httpBadRequest, httpUpstream } from '../errors/http.js'
import { deleteApiKey, loadApiKey, saveApiKey } from '../secrets/keystore.js'

export class UserSecretsService {
  /**
   * Saves the API key. On error sides (FS/IO/Crypto) we map to Upstream (5xx),
   * business logic errors (e.g. invalid provider) come from validateProvider().
   */
  async saveUserAISecret(userId: string, provider: ApiAIProvider, apiKey: string): Promise<boolean> {
    try {
      await saveApiKey(userId, provider, apiKey)
      return true
    }
    catch (e) {
      throw httpUpstream('Failed to persist API key', 502, e)
    }
  }

  /**
   * Returns flag + provider.
   */
  async getUserAISecretInfo(userId: string, provider: ApiAIProvider): Promise<ApiUserAISecretsInfoData> {
    try {
      const apiKey = await loadApiKey(userId, provider)
      return { hasApiKey: !!apiKey, provider }
    }
    catch (e) {
      throw httpUpstream('Failed to read API key state', 502, e)
    }
  }

  /**
   * Deletes the API key. Returns true even if the key didn't exist (idempotent operation).
   */
  async deleteUserAISecret(userId: string, provider: ApiAIProvider): Promise<boolean> {
    try {
      await deleteApiKey(userId, provider)
      return true
    }
    catch (e) {
      throw httpUpstream('Failed to delete API key', 502, e)
    }
  }

  /**
   * Absichernde Query-Validierung mit freundlicher Fehlermeldung (400).
   */
  validateProvider(providerQuery: string | undefined): ApiAIProvider {
    if (!providerQuery)
      return httpBadRequest('Missing ?provider query parameter') as never

    try {
      return ApiAIProviderSchema.parse(providerQuery)
    }
    catch {
      return httpBadRequest(
        `Invalid provider "${providerQuery}". Must be one of: ${ApiAIProviderSchema.options.join(', ')}`,
      ) as never
    }
  }
}

// Singleton instance
export const userSecretsService = new UserSecretsService()
