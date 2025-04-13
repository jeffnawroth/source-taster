import { extractWithGemini } from '../services/geminiService'
import { extractWithOpenAI } from '../services/openaiService'

export async function extractISSNWithModel(service: string, model: string, text: string) {
  switch (service) {
    case 'openai':
      return await extractWithOpenAI(model, text, 'issn')
    case 'gemini':
      return await extractWithGemini(model, text, 'issn')
    default:
      throw new Error('Unsupported service')
  }
}
