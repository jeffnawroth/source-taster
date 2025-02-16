import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAppStore } from './app'

export const useAiStore = defineStore('ai', () => {
  // GENERATE CONTENT
  const { isLoading } = storeToRefs(useAppStore())

  // if the AI model is used to generate content or extract DOIs from text
  const isAiUsed = ref(false)

  async function generateContent(prompt: string) {
    isLoading.value = true
    isAiUsed.value = false
    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: prompt,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      isAiUsed.value = true

      return response.json()
    }
    finally {
      isLoading.value = false
    }
  }

  // Extract DOIs from text using the AI model
  async function extractDoisUsingAi(text: string) {
    const prompt = `Extract all valid DOIs from the text below. Return the DOIs as a JSON array of strings without duplicates. If no DOIs are found, return an empty array: ${text}`
    const response = await generateContent(prompt)

    const cleanedResponse = response.text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleanedResponse)
  }
  return { extractDoisUsingAi, isAiUsed }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAiStore, import.meta.hot))
}
