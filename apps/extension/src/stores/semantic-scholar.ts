import type { FullPaper } from '../clients/semanticscholar-client'
import type { ReferenceMetadata } from '../types'
import { useMemoize } from '@vueuse/core'
import fetchRetry from 'fetch-retry'
import PQueue from 'p-queue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { Configuration, PaperDataApi } from '../clients/semanticscholar-client'

// Enhance fetch with retry capability
const fetchWithRetry = fetchRetry(fetch, {
  retries: 3,
  retryDelay: attempt => 2 ** attempt * 1000 + Math.random() * 1000,
  retryOn: [429, 500, 503],
})

// Override the fetch implementation used by the API client
const config = new Configuration({
  basePath: 'https://api.semanticscholar.org/graph/v1',
  fetchApi: fetchWithRetry,
})

export const useSemanticScholarStore = defineStore('semantic-scholar', () => {
  const client = new PaperDataApi(config)

  // Create request queue with concurrency control
  // Only allow 1 request at a time with 1 second interval between requests
  const queue = new PQueue({
    concurrency: 1,
    interval: 1000,
    intervalCap: 1, // Only 1 task per interval
    autoStart: true,
  })

  // Memoized paper search function - caches results by query string
  const memoizedSearchPaper = useMemoize(
    async (queryString: string, fields: string, limit: number) => {
      return await queue.add(async () => {
        try {
          const response = await client.getGraphPaperRelevanceSearch({
            query: queryString,
            fields,
            limit,
          })
          return response.data || []
        }
        catch (error) {
          console.error('Semantic Scholar API Error:', error)
          return []
        }
      })
    },
  )

  // Search for a paper using Semantic Scholar API and return the first result if available
  const searchSemanticScholarWork = useMemoize(
    async (meta: ReferenceMetadata): Promise<FullPaper | null> => {
      const query = meta.title || ''
      if (!query.trim())
        return null

      const fields = 'title,authors,year,publicationDate,journal,url'
      const limit = 1

      const paper = await memoizedSearchPaper(query, fields, limit)
      return Array.isArray(paper) && paper.length > 0 ? paper[0] : null
    },
    {
      getKey: (meta: ReferenceMetadata) => meta.title || '',
    },
  )

  // Get queue status for UI feedback
  function getQueueStatus() {
    return {
      size: queue.size,
      pending: queue.pending,
      isPaused: queue.isPaused,
    }
  }

  // Clear memoization caches
  function clearCache() {
    memoizedSearchPaper.cache.clear()
    searchSemanticScholarWork.cache.clear()
  }

  return {
    searchSemanticScholarWork,
    getQueueStatus,
    clearCache,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSemanticScholarStore, import.meta.hot))
}
