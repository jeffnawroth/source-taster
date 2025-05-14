import type { EuropePmcPublicationsResponse, ReferenceMetadata } from '../types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { Configuration, EuropePMCArticlesRESTfulAPIApi } from '../clients/europe-pmc'

const config = new Configuration({
  basePath: 'https://www.ebi.ac.uk/europepmc/webservices/rest',
})

export const useEuropePmcStore = defineStore('europe-pmc', () => {
  const client = new EuropePMCArticlesRESTfulAPIApi(config)

  async function searchArticle(referenceMetadata: ReferenceMetadata) {
    if (!referenceMetadata.title) {
      return null
    }

    try {
      const response = await client.search({
        query: referenceMetadata.title,
        pageSize: 1,
        format: 'json',
        email: import.meta.env.VITE_MAILTO,
      }) as EuropePmcPublicationsResponse

      return response.resultList?.result?.[0] || null
    }

    catch (error) {
      console.error('Europe PMC API Error:', error)
      return null
    }
  }

  return { searchArticle }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEuropePmcStore, import.meta.hot))
}
