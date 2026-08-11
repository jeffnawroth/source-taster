import type { ApiAIProvider } from '@source-taster/types'
import { apiClient } from './apiClient'

export async function saveAiSecret(provider: ApiAIProvider, apiKey: string): Promise<unknown> {
  return apiClient('/api/user/ai-secrets', { method: 'POST', body: JSON.stringify({ provider, apiKey }) })
}

export async function getAiSecretInfo(provider: ApiAIProvider): Promise<{ hasApiKey: boolean, provider?: ApiAIProvider }> {
  return apiClient(`/api/user/ai-secrets?provider=${provider}`) as Promise<{ hasApiKey: boolean, provider?: ApiAIProvider }>
}

export async function deleteAiSecret(provider: ApiAIProvider): Promise<unknown> {
  return apiClient(`/api/user/ai-secrets?provider=${provider}`, { method: 'DELETE' })
}
