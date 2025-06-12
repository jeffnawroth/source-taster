// src/stores/aiStore.ts

import type { PublicationMetadata, ReferenceMetadata, VerificationResult, WebsiteMetadata, WebsiteVerificationResult } from '../types'
import { useMemoize } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import { selectedAiModel } from '../logic'
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

  const extractWebsiteMetadata = useMemoize(
    async (input: string): Promise<WebsiteMetadata | null> => {
      isExtractingReferences.value = true
      try {
        const res = await fetch(`${baseUrl}/extract-metadata-website`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: selectedAiModel.value.service,
            model: selectedAiModel.value.value,
            input,
          }),
        })
        if (!res.ok)
          return null
        const data = await res.json()
        // hier unwrappen:
        return data.metadata as WebsiteMetadata
      }
      catch {
        return null
      }
      finally {
        isExtractingReferences.value = false
      }
    },
  )

  const verifyAgainstWebsite = useMemoize(
    async (
      referenceMetadata: ReferenceMetadata,
      websiteMetadata: WebsiteMetadata,
    ): Promise<WebsiteVerificationResult | null> => {
      try {
        const res = await fetch(
          `${baseUrl}/verify-metadata-match-website`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service: selectedAiModel.value.service,
              model: selectedAiModel.value.value,
              referenceMetadata,
              websiteMetadata,
            }),
          },
        )
        if (!res.ok)
          return null
        return await res.json()
      }
      catch {
        return null
      }
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
    verifyAgainstWebsite,
    extractWebsiteMetadata,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAiStore, import.meta.hot))
}
