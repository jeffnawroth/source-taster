import { extractWithGemini } from '../services/geminiService'
import { extractWithOpenAI } from '../services/openaiService'

export async function extractWithModel(service: string, model: string, text: string, type: 'doi' | 'issn') {
  switch (service) {
    case 'openai':
      return await extractWithOpenAI(model, text, type)
    case 'gemini':
      return await extractWithGemini(model, text, type)
    default:
      throw new Error('Unsupported service')
  }
}
