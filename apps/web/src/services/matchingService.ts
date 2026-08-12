import type { ApiMatchCandidate, ApiMatchData, ApiMatchReference } from '@source-taster/types'
import { apiClient } from './apiClient'

export async function matchReference(reference: ApiMatchReference, candidates: ApiMatchCandidate[]): Promise<ApiMatchData> {
  return apiClient('/v1/match', { method: 'POST', body: JSON.stringify({ reference, candidates }) }) as Promise<ApiMatchData>
}
