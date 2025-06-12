// src/stores/aiStore.ts

import type { PublicationMetadata, ReferenceMetadata, VerificationResult } from '../types'
import { useMemoize } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import { extractReferencesMetadata, verifyReferenceAgainstPublications } from '../services/aiService'

export const useAiStore = defineStore('ai', () => {
  const isExtractingReferences = ref(false)

  const memoizedExtractReferencesMetadata = useMemoize(
    async (prompt: string): Promise<ReferenceMetadata[] | null> => {
      isExtractingReferences.value = true
      try {
        return await extractReferencesMetadata(prompt)
      }
      finally {
        isExtractingReferences.value = false
      }
    },
  )

  const memoizedVerifyReferenceAgainstPublications = useMemoize(
    async (
      referenceMetadata: ReferenceMetadata,
      publicationsMetadata: PublicationMetadata[],
    ): Promise<VerificationResult | null> => {
      return await verifyReferenceAgainstPublications(referenceMetadata, publicationsMetadata)
    },
    {
      getKey: (referenceMetadata, publicationsMetadata) =>
        `${JSON.stringify(referenceMetadata)}-${JSON.stringify(publicationsMetadata)}`,
    },
  )

  return {
    extractReferencesMetadata: memoizedExtractReferencesMetadata,
    verifyReferenceAgainstPublications: memoizedVerifyReferenceAgainstPublications,
    isExtractingReferences,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAiStore, import.meta.hot))
}
