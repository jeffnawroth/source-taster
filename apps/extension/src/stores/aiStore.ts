// src/stores/aiStore.ts

import type { PublicationMetadata, ReferenceMetadata, VerificationResult, WebsiteMetadata, WebsiteVerificationResult } from '../types'
import { useMemoize } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import { extractReferencesMetadata, extractWebsiteMetadata, verifyAgainstWebsite, verifyReferenceAgainstPublications } from '../services/aiService'

export const useAiStore = defineStore('ai', () => {
  const isExtractingReferences = ref(false)

  const memoizedExtractReferencesMetadata = useMemoize(
    async (prompt: string): Promise<ReferenceMetadata[] | null> => {
      isExtractingReferences.value = true

      const result = await extractReferencesMetadata(prompt)

      isExtractingReferences.value = false
      return result
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

  const memoizedExtractWebsiteMetadata = useMemoize(
    async (input: string): Promise<WebsiteMetadata | null> => {
      return await extractWebsiteMetadata(input)
    },
  )

  const memoizedVerifyAgainstWebsite = useMemoize(
    async (
      referenceMetadata: ReferenceMetadata,
      websiteMetadata: WebsiteMetadata,
    ): Promise<WebsiteVerificationResult | null> => {
      return await verifyAgainstWebsite(referenceMetadata, websiteMetadata)
    },
    {
      getKey: (ref, site) =>
        `${JSON.stringify(ref)}-${site.url}`,
    },
  )

  return {
    extractReferencesMetadata: memoizedExtractReferencesMetadata,
    verifyReferenceAgainstPublications: memoizedVerifyReferenceAgainstPublications,
    isExtractingReferences,
    verifyAgainstWebsite: memoizedVerifyAgainstWebsite,
    extractWebsiteMetadata: memoizedExtractWebsiteMetadata,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAiStore, import.meta.hot))
}
