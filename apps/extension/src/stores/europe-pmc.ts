import type { EuropePmcPublicationsResponse, PublicationMetadata, ReferenceMetadata } from '../types'
import { useMemoize } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { Configuration, EuropePMCArticlesRESTfulAPIApi } from '../clients/europe-pmc'
import { mapEuropePMCToPublication } from '../utils/metadataMapper'

const config = new Configuration({
  basePath: 'https://www.ebi.ac.uk/europepmc/webservices/rest',
})

export const useEuropePmcStore = defineStore('europe-pmc', () => {
  const client = new EuropePMCArticlesRESTfulAPIApi(config)

  /**
   * Searches for a publication in the Europe PMC API using the provided reference metadata.
   * @param referenceMetadata The metadata of the reference to search for.
   * @returns The publication metadata if found, or null if not found.
   */
  const searchPublication = useMemoize(
    async (referenceMetadata: ReferenceMetadata): Promise<PublicationMetadata | null> => {
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

        if (!response.resultList?.result?.length) {
          return null
        }

        const mappedResponse = mapEuropePMCToPublication(response.resultList?.result?.[0])
        return mappedResponse
      }

      catch (error) {
        console.error('Europe PMC API Error:', error)
        return null
      }
    },
  )

  return { searchPublication }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEuropePmcStore, import.meta.hot))
}
