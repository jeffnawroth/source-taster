import type { ApiAIProvider, ApiUserAISecretsInfoData } from '@source-taster/types'
import { ApiAIProviderSchema } from '@source-taster/types'
import { httpBadRequest, httpUpstream } from '../errors/http'
import { deleteApiKey, loadApiKey, saveApiKey } from '../secrets/keystore'

export class UserService {
  /**
   * Speichert den API-Key. Auf Fehlerseiten (FS/IO/Krypto) mappen wir auf Upstream (5xx),
   * fachliche Fehler (z.B. invalid provider) kommen von validateProvider().
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
   * Liefert Flag + Provider zurück.
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
   * Löscht den Key. Rückgabe = true, auch wenn Key nicht existierte (idempotent ok).
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

// Singleton
export const userService = new UserService()
