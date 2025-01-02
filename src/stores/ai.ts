import { GoogleGenerativeAI } from '@google/generative-ai'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { geminiApiKey } from '~/logic'

export const useAiStore = defineStore('ai', () => {
  const apiKeyValid = ref<null | boolean>(null)
  const loading = ref(false)

  const genAI = computed(() => {
    return new GoogleGenerativeAI(geminiApiKey.value)
  })

  const model = computed(() => {
    return genAI.value.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: 'You are a system that extracts valid DOIs from a given input text. Your sole purpose is to find all valid DOIs. Return the DOIs as an array of strings without duplicates. If no DOIs are found, return an empty array. Do not include any additional information or explanations.' })
  })

  async function generateContent(prompt: string) {
    try {
      const result = await model.value.generateContent(prompt)
      return result.response.text()
    }
    catch (error) {
      console.error('Error generating content:', error)
    }
  }

  async function extractDOIsFromText(text: string) {
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
    }
  }

  async function testApiKey() {
    try {
      loading.value = true
      const reponse = await model.value.generateContent('This is just a test to see if the API key is valid.')
      if (reponse) {
        apiKeyValid.value = true
      }
    }
    catch (error) {
      console.error('Error testing API key:', error)
      apiKeyValid.value = false
    }
    finally {
      loading.value = false
    }
  }

  return { generateContent, extractDOIsFromText, testApiKey, apiKeyValid, loading }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAiStore, import.meta.hot))
}
