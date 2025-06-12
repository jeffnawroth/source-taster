// src/stores/europePmcStore.ts

import type { PublicationMetadata, ReferenceMetadata } from '../types'
import { useMemoize } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { searchEuropePmcPublication } from '../services/europePmcService'

export const useEuropePmcStore = defineStore('europe-pmc', () => {
  const searchPublication = useMemoize(
    async (referenceMetadata: ReferenceMetadata): Promise<PublicationMetadata | null> => {
      try {
        return await searchEuropePmcPublication(referenceMetadata)
      }
      catch (error) {
        console.error('Europe PMC Store Error:', error)
        return null
      }
    },
  )

  return {
    searchPublication,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEuropePmcStore, import.meta.hot))
}
