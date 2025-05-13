import type { WorkSchema } from '../clients/open-alex'
import type { ReferenceMetadata } from '../types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { OpenAlexApi } from '../clients/open-alex'

export const useOpenAlexStore = defineStore('openAlex', () => {
  const client = new OpenAlexApi()

  async function searchWork(referenceMetadata: ReferenceMetadata): Promise<WorkSchema | null> {
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

      return works.results[0] || null
    }
    catch (error) {
      console.error('OpenAlex API Error:', error)
      return null
    }
  }

  return {
    searchWork,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOpenAlexStore, import.meta.hot))
}
