import { extractWithGemini } from '../services/geminiService'
import { extractWithOpenAI } from '../services/openaiService'

export async function extractDOIWithModel(service: string, model: string, text: string) {
  switch (service) {
    case 'openai':
      return await extractWithOpenAI(model, text)
    case 'gemini':
      return await extractWithGemini(model, text)
    default:
      throw new Error('Unsupported service')
  }
}
