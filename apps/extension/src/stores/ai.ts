import { acceptHMRUpdate, defineStore } from 'pinia'
import { selectedAiModel } from '../logic'
import { useAppStore } from './app'

export const useAiStore = defineStore('ai', () => {
  // GENERATE CONTENT
  const { isLoading } = storeToRefs(useAppStore())

  // if the AI model is used to generate content or extract DOIs from text
  const isAiUsed = ref(false)

  async function extractUsingAi(prompt: string, type: 'doi' | 'issn'): Promise<string[]> {
    isLoading.value = true
    isAiUsed.value = false
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL
      const response = await fetch(`${baseUrl}` + '/extract-identifier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: selectedAiModel.value.service,
          model: selectedAiModel.value.value,
          text: prompt,
          type,
        }),
      })

      if (!response.ok) {
        throw new Error(`AI extraction failed `)
      }

      isAiUsed.value = true

      const data = await response.json()
      return data || []
    }
    finally {
      isLoading.value = false
    }
  }

  return { extractUsingAi, isAiUsed }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAiStore, import.meta.hot))
}
