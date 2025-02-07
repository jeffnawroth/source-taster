import { GoogleGenerativeAI } from '@google/generative-ai'
import { acceptHMRUpdate, defineStore } from 'pinia'

export const useAiStore = defineStore('ai', () => {
  const loading = ref(false)

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  const genAI = computed(() => {
    return new GoogleGenerativeAI(apiKey)
  })

  const model = computed(() => {
    return genAI.value.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: 'You are a system that extracts valid DOIs from a given input text. Your sole purpose is to find all valid DOIs. Return the DOIs as an array of strings without duplicates. If no DOIs are found, return an empty array. Do not include any additional information or explanations.' })
  })

  // Generate content using the AI model
  async function generateContent(prompt: string) {
    try {
      const result = await model.value.generateContent(prompt)
      return result.response.text()
    }
    catch (error: any) {
      if (error.status === 429) {
        console.error('Too many requests. Please try again later.')
      }
      console.error('Error generating content:', error)
      throw error
    }
  }

  // Extract DOIs from text using the AI model
  async function extractDoisUsingAi(text: string) {
    try {
      const prompt = `Extract all valid DOIs from the text below. Return the DOIs as a JSON array of strings without duplicates. If no DOIs are found, return an empty array: ${text}`
      const result = await generateContent(prompt)
      if (result) {
        const cleanedResponse = result.replace(/```json|```/g, '').trim()
        return JSON.parse(cleanedResponse)
      }
      return []
    }
    catch (error) {
      console.error('Error extracting DOIs from text using ai:', error)
      throw error
    }
  }
  return { generateContent, extractDoisUsingAi, loading }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAiStore, import.meta.hot))
}
