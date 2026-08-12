import type { ApiAISettings, ApiExtractData } from '@source-taster/types'
import { apiClient } from './apiClient'

export async function extractReferences(text: string, aiSettings?: ApiAISettings): Promise<ApiExtractData> {
  const body: Record<string, unknown> = { text }
  if (aiSettings)
    body.aiSettings = aiSettings
  return apiClient('/v1/extract', { method: 'POST', body: JSON.stringify(body) }) as Promise<ApiExtractData>
}
