import type { FullPaper, GetGraphPaperRelevanceSearchRequest } from '../clients/semanticscholar-client'
import type { ReferenceMetadata } from '../types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { Configuration, PaperDataApi } from '../clients/semanticscholar-client'

const config = new Configuration({
  basePath: 'https://api.semanticscholar.org/graph/v1',
})

export const useSemanticScholarStore = defineStore('semantic-scholar', () => {
  const client = new PaperDataApi(config)

  async function searchPaper(query: GetGraphPaperRelevanceSearchRequest) {
    try {
      const response = await client.getGraphPaperRelevanceSearch(query)

      return response.data || []
    }
    catch (error) {
      console.error('Semantic Scholar API Error:', error)
      return []
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

    return paper[0] || null
  }

  return { searchSemanticScholarWork }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSemanticScholarStore, import.meta.hot))
}
