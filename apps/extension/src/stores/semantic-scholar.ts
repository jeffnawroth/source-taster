import type { FullPaper, GetGraphPaperRelevanceSearchRequest } from '../clients/semanticscholar-client'
import type { ReferenceMetadata } from '../types'
import fetchRetry from 'fetch-retry'
import PQueue from 'p-queue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
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
  const isLoading = ref(false)

  // Create request queue with concurrency control
  // Only allow 1 request at a time with 1 second interval between requests
  const queue = new PQueue({
    concurrency: 1,
    interval: 1000,
    intervalCap: 1, // Only 1 task per interval
    autoStart: true,
  })

  // Wrap API calls in the queue
  async function queuedSearchPaper(query: GetGraphPaperRelevanceSearchRequest) {
    return queue.add(async () => {
      try {
        const response = await client.getGraphPaperRelevanceSearch(query)
        return response.data || []
      }
      catch (error) {
        console.error('Semantic Scholar API Error:', error)
        return []
      }
    })
  }

  async function searchPaper(query: GetGraphPaperRelevanceSearchRequest) {
    isLoading.value = true
    try {
      return await queuedSearchPaper(query)
    }
    finally {
      isLoading.value = false
    }
  }

  // Search for a paper using Semantic Scholar API and return the first result if available
  async function searchSemanticScholarWork(meta: ReferenceMetadata): Promise<FullPaper | null> {
    const query = meta.title || ''
    const fields = 'title,authors,year,publicationDate,journal,url'
    const limit = 1

    const paper = await searchPaper({
      query,
      limit,
      fields,
    })

    return Array.isArray(paper) && paper.length > 0 ? paper[0] : null
  }

  // Get queue status for UI feedback
  function getQueueStatus() {
    return {
      size: queue.size,
      pending: queue.pending,
      isPaused: queue.isPaused,
    }
  }

  return {
    searchSemanticScholarWork,
    isLoading,
    getQueueStatus,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSemanticScholarStore, import.meta.hot))
}
