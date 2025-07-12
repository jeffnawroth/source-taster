import type {
  AIExtractedReference,
  Reference,
} from '@source-taster/types'
import crypto from 'node:crypto'
import { AIServiceFactory } from './ai/aiServiceFactory'

export class ReferenceExtractionService {
  async extractReferences(
    text: string,
  ): Promise<Reference[]> {
    const ai = AIServiceFactory.createOpenAIService()

    try {
      const result = await ai.extractReferences(text)

      // Convert the AI response to our Reference format with unique IDs
      return result.references.map((ref: AIExtractedReference) => ({
        id: crypto.randomUUID(),
        originalText: ref.originalText,
        metadata: ref.metadata,
      }))
    }
    catch (error) {
      console.error('Failed to extract references:', error)
      return []
    }
  }
}
