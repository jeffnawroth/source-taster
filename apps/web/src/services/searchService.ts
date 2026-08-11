import type { ApiSearchData, ApiSearchReference } from '@source-taster/types'
import { apiClient } from './apiClient'

export async function searchReferences(references: ApiSearchReference[]): Promise<ApiSearchData> {
  return apiClient('/api/search', { method: 'POST', body: JSON.stringify({ references }) }) as Promise<ApiSearchData>
}
