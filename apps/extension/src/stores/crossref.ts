// src/stores/crossrefStore.ts

import type { PublicationMetadata, ReferenceMetadata } from '../types'
import { useMemoize } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { searchCrossrefPublication } from '../services/crossrefService'

export const useCrossrefStore = defineStore('crossref', () => {
  const searchPublication = useMemoize(
    async (referenceMetadata: ReferenceMetadata): Promise<PublicationMetadata | null> => {
      try {
        return await searchCrossrefPublication(referenceMetadata)
      }
      catch (error) {
        console.error('Crossref Store Error:', error)
        return null
      }
    },
  )

  return {
    searchPublication,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCrossrefStore, import.meta.hot))
}
