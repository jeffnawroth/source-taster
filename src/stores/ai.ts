import { GoogleGenerativeAI } from '@google/generative-ai'
import { acceptHMRUpdate, defineStore } from 'pinia'

export const useAiStore = defineStore('ai', () => {
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: 'You are a system that extracts valid DOIs from a given input text. Your sole purpose is to find all valid DOIs (in the format `10.xxxx/xxxxx`). Return the DOIs as an array of strings without duplicates. If no DOIs are found, return an empty array. Do not include any additional information or explanations.' })

  async function generateContent(prompt: string) {
    try {
      const result = await model.generateContent(prompt)
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

  return { generateContent, extractDOIsFromText }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAiStore, import.meta.hot))
}
