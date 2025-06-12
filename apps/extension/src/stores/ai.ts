import type { PublicationMetadata, ReferenceMetadata, VerificationResult, WebsiteMetadata, WebsiteVerificationResult } from '../types'
import { useMemoize } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { selectedAiModel } from '../logic'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

export const useAiStore = defineStore('ai', () => {
  const isExtractingReferences = ref(false)

  /**
   * Extract references metadata from a given prompt using the AI model.
   * @param prompt - The input text from which to extract references metadata.
   * @returns A promise that resolves to an array of ReferenceMetadata or null if an error occurs.
   */
  const extractReferencesMetadata = useMemoize(
    async (prompt: string): Promise<ReferenceMetadata[] | null> => {
      isExtractingReferences.value = true
      try {
        const response = await fetch(`${baseUrl}/extract-metadata`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service: selectedAiModel.value.service,
            model: selectedAiModel.value.value,
            input: prompt,
          }),
        })

        if (!response.ok) {
          return null
        }

        const data = await response.json()
        return data
      }
      catch {
        return null
      }
      finally {
        isExtractingReferences.value = false
      }
    },
  )

  /**
   * Verify the reference metadata against the publications metadata using the AI model.
   * @param referenceMetadata - The reference metadata to verify.
   * @param publicationsMetadata - The publications metadata to verify against.
   * @returns A promise that resolves to a VerificationResult or null if an error occurs.
   */
  const verifyReferenceAgainstPublications = useMemoize(
    async (
      referenceMetadata: ReferenceMetadata,
      publicationsMetadata: PublicationMetadata[],
    ): Promise<VerificationResult | null> => {
      try {
        const response = await fetch(`${baseUrl}/verify-metadata-match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: selectedAiModel.value.service,
            model: selectedAiModel.value.value,
            referenceMetadata,
            publicationsMetadata,
          }),
        })

        if (!response.ok) {
          return null
        }

        return await response.json()
      }
      catch {
        return null
      }
    },
    {
      getKey: (referenceMetadata, publicationMetadata) => {
        return `${JSON.stringify(referenceMetadata)}-${JSON.stringify(publicationMetadata)}`
      },
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
    extractReferencesMetadata,
    verifyReferenceAgainstPublications,
    isExtractingReferences,
    verifyAgainstWebsite,
    extractWebsiteMetadata,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAiStore, import.meta.hot))
}
