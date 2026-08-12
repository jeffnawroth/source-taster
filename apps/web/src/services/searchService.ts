import type { ApiSearchData, ApiSearchReference, ApiSearchResult, ApiSearchSource } from '@source-taster/types'
import { apiClient } from './apiClient'

const SEARCH_DATABASES: ApiSearchSource[] = ['openalex', 'crossref', 'semanticscholar', 'europepmc', 'arxiv']

export async function searchReferences(references: ApiSearchReference[]): Promise<ApiSearchData> {
  const merged = new Map<string, ApiSearchResult>()
  let lastError: unknown = null

  for (const database of SEARCH_DATABASES) {
    try {
      const data = await apiClient(`/v1/search/${database}`, {
        method: 'POST',
        body: JSON.stringify({ references }),
      }) as ApiSearchData
      for (const result of data.results) {
        const existing = merged.get(result.referenceId)
        merged.set(result.referenceId, {
          referenceId: result.referenceId,
          candidates: existing ? [...existing.candidates, ...result.candidates] : result.candidates,
        })
      }
    }
    catch (e) {
      lastError = e
      console.error(`[search] database "${database}" failed`, e)
    }
  }

  if (merged.size === 0 && lastError)
    throw lastError

  return { results: [...merged.values()] }
}
