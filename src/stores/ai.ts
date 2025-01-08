import { GoogleGenerativeAI } from '@google/generative-ai'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { geminiApiKey, requestsMadeThisMinute, requestsMadeToday, tokensUsedThisMintue } from '~/logic'

export const useAiStore = defineStore('ai', () => {
  const apiKeyValid = ref<null | boolean>(null)
  const loading = ref(false)

  const MAX_REQUEST_PER_DAY = ref(1500)
  const MAX_REQUESTS_PER_MINUTE = ref(15)
  const MAX_TOKENS_PER_MINUTE = ref(1000000)

  const genAI = computed(() => {
    return new GoogleGenerativeAI(geminiApiKey.value)
  })

  const model = computed(() => {
    return genAI.value.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: 'You are a system that extracts valid DOIs from a given input text. Your sole purpose is to find all valid DOIs. Return the DOIs as an array of strings without duplicates. If no DOIs are found, return an empty array. Do not include any additional information or explanations.' })
  })

  // Generate content using the AI model
  async function generateContent(prompt: string) {
    try {
      if (requestsMadeThisMinute.value >= MAX_REQUESTS_PER_MINUTE.value || requestsMadeToday.value >= MAX_REQUEST_PER_DAY.value || tokensUsedThisMintue.value >= MAX_TOKENS_PER_MINUTE.value) {
        throw new Error('API request limit reached')
      }

      const result = await model.value.generateContent(prompt)
      requestsMadeThisMinute.value += 1
      requestsMadeToday.value += 1
      tokensUsedThisMintue.value += result.response.usageMetadata?.totalTokenCount || 0

      return result.response.text()
    }
    catch (error) {
      console.error('Error generating content:', error)
    }
  }

  // Extract DOIs from text using the AI model
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

  // Test the API key to see if it is valid
  async function testApiKey() {
    try {
      loading.value = true
      const response = await generateContent('This is just a test to see if the API key is valid.')
      if (response) {
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

  return { generateContent, extractDOIsFromText, testApiKey, apiKeyValid, loading, MAX_REQUESTS_PER_MINUTE, MAX_REQUEST_PER_DAY, MAX_TOKENS_PER_MINUTE }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAiStore, import.meta.hot))
}
