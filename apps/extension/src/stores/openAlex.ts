import type { PublicationMetadata, ReferenceMetadata } from '../types'
import { useMemoize } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { OpenAlexApi } from '../clients/open-alex'
import { mapOpenAlexToPublication } from '../utils/metadataMapper'

export const useOpenAlexStore = defineStore('openAlex', () => {
  const client = new OpenAlexApi()

  /**
   * Searches for a work in the OpenAlex API using the provided reference metadata.
   * @param referenceMetadata The metadata of the reference to search for.
   * @returns The publication metadata if found, or null if not found.
   */
  const searchPublication = useMemoize(
    async (referenceMetadata: ReferenceMetadata): Promise<PublicationMetadata | null> => {
      if (!referenceMetadata.title) {
        return null
      }

      const search = referenceMetadata.title
      const filter = referenceMetadata.year ? `publication_year:${referenceMetadata.year}` : undefined
      const page = 1
      const perPage = 1
      const select = 'biblio,title,doi,publication_year,id,authorships,primary_location'

      try {
        const works = await client.getWorks({
          search,
          filter,
          perPage,
          page,
          mailto: import.meta.env.VITE_MAILTO,
          userAgent: import.meta.env.VITE_USER_AGENT,
          select,

        })

        if (!works.results?.length) {
          return null
        }

        const mappedResponse = mapOpenAlexToPublication(works.results[0])
        return mappedResponse
      }
      catch (error) {
        console.error('OpenAlex API Error:', error)
        return null
      }
    },
  )

  return {
    searchPublication,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOpenAlexStore, import.meta.hot))
}
