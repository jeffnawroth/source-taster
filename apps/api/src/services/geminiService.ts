import type { ContentListUnion, GenerateContentConfig } from '@google/genai'
import process from 'node:process'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

/**
 * Extracts identifiers (DOI or ISSN) from text using Gemini
 *
 * @param model - The Gemini model to use
 * @param text - The text to extract identifiers from
 * @param type - The type of identifier to extract ('doi' or 'issn')
 * @returns An array of the extracted identifiers
 */
export async function extractWithGemini(model: string, contents: ContentListUnion, config: GenerateContentConfig) {
  const response = await ai.models.generateContent({
    model,
    contents,
    config,
  })

  const result = response.text ? JSON.parse(response.text) : {}
  return result
}
