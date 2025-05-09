import type { Work } from '../clients/crossref-client'
import type { FullPaper } from '../clients/semanticscholar-client'
import type { ReferenceMetadata, VerificationResult } from '../types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { selectedAiModel } from '../logic'
import { useAppStore } from './app'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

export const useAiStore = defineStore('ai', () => {
  // GENERATE CONTENT
  const { isLoading } = storeToRefs(useAppStore())

  // if the AI model is used to generate content or extract DOIs from text
  const isAiUsed = ref(false)

  async function extractUsingAi(prompt: string): Promise<ReferenceMetadata[]> {
    isLoading.value = true
    isAiUsed.value = false
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
  }

  async function verifyMatchWithAI(referenceMetadata: ReferenceMetadata, works: { crossrefWork: Work | null, semanticScholarWork: FullPaper | null }): Promise<VerificationResult> {
    try {
      const response = await fetch(`${baseUrl}/verify-metadata-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: selectedAiModel.value.service,
          model: selectedAiModel.value.value,
          referenceMetadata,
          works,
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
  }

  async function verifyPageMatchWithAI(
    referenceMetadata: ReferenceMetadata,
    pageText: string,
  ): Promise<VerificationResult> {
    try {
      const response = await fetch(`${baseUrl}/verify-metadata-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: selectedAiModel.value.service,
          model: selectedAiModel.value.value,
          referenceMetadata,
          pageText,
        }),
      })
      if (!response.ok) {
        throw new Error(`AI verification failed: ${response.status} ${response.statusText}`)
      }
      return await response.json()
    }
    catch (error) {
      console.error('Error with AI page-verification', error)
      return { match: false, reason: 'AI page-verification failed' }
    }
  }

  return { extractUsingAi, isAiUsed, verifyMatchWithAI, verifyPageMatchWithAI }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAiStore, import.meta.hot))
}
