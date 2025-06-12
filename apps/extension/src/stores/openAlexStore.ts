import type { PublicationMetadata, ReferenceMetadata } from '../types'
import { useMemoize } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { searchPublication as searchPublicationFromService } from '../services/openAlexService'

export const useOpenAlexStore = defineStore('openAlex', () => {
  const searchPublication = useMemoize(
    async (referenceMetadata: ReferenceMetadata): Promise<PublicationMetadata | null> => {
      try {
        return await searchPublicationFromService(referenceMetadata)
      }
      catch (error) {
        console.error('Error searching OpenAlex:', error)
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
