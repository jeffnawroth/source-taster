import type { Work } from '../clients/crossref-client'
import type { FullPaper } from '../clients/semanticscholar-client'
import type { ReferenceMetadata, VerificationResult } from '../types'
import { useMemoize } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import { selectedAiModel } from '../logic'
import { useAppStore } from './app'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

export const useAiStore = defineStore('ai', () => {
  // GENERATE CONTENT
  const { isLoading } = storeToRefs(useAppStore())

  // if the AI model is used to generate content or extract DOIs from text
  const isAiUsed = ref(false)

  // Memoized extraction function to avoid duplicate API calls for the same prompt
  const memoizedExtract = useMemoize(
    async (prompt: string, service: string, model: string): Promise<ReferenceMetadata[]> => {
      isLoading.value = true
      isAiUsed.value = false
      try {
        const response = await fetch(`${baseUrl}/extract-metadata`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service,
            model,
            input: prompt,
          }),
        })

        if (!response.ok) {
          return Promise.reject(response)
        }

        isAiUsed.value = true

        const data = await response.json()
        return data || []
      }
      catch (error) {
        console.error('Error with AI extraction', error)
        return []
      }
      finally {
        isLoading.value = false
      }
    },
  )

  async function extractUsingAi(prompt: string): Promise<ReferenceMetadata[]> {
    return memoizedExtract(
      prompt,
      selectedAiModel.value.service,
      selectedAiModel.value.value,
    )
  }

  // Memoized verification function
  const memoizedVerify = useMemoize(
    async (
      referenceMetadata: ReferenceMetadata,
      crossrefWork: Work | null,
      semanticScholarWork: FullPaper | null,
      service: string,
      model: string,
    ): Promise<VerificationResult> => {
      try {
        const response = await fetch(`${baseUrl}/verify-metadata-match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service,
            model,
            referenceMetadata,
            works: { crossrefWork, semanticScholarWork },
          }),
        })

        if (!response.ok)
          return Promise.reject(new Error(`AI verification failed: ${response.status} ${response.statusText}`))

        return await response.json()
      }
      catch (error) {
        console.error('Error with AI verification', error)
        return {
          match: false,
          reason: 'AI verification failed',
        }
      }
    },
    {
      // Create a stable cache key from the combined data
      getKey: (meta, crossref, semantic, service, model) => {
        const metaKey = meta.title || meta.doi || ''
        const crossrefKey = crossref?.dOI || ''
        const semanticKey = semantic?.paperId || ''
        return `${metaKey}-${crossrefKey}-${semanticKey}-${service}-${model}`
      },
    },
  )

  async function verifyMatchWithAI(
    referenceMetadata: ReferenceMetadata,
    works: { crossrefWork: Work | null, semanticScholarWork: FullPaper | null },
  ): Promise<VerificationResult> {
    return memoizedVerify(
      referenceMetadata,
      works.crossrefWork,
      works.semanticScholarWork,
      selectedAiModel.value.service,
      selectedAiModel.value.value,
    )
  }

  return {
    extractUsingAi,
    isAiUsed,
    verifyMatchWithAI,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAiStore, import.meta.hot))
}
