import type {
  Reference,
} from '@source-taster/types'
import crypto from 'node:crypto'
import { AIServiceFactory } from './ai/aiServiceFactory'

export class ReferenceExtractionService {
  async extractReferences(
    text: string,
    _model?: string,
  ): Promise<Reference[]> {
    const ai = AIServiceFactory.createOpenAIService()

    try {
      // Use the new Zod-based extraction method
      const result = await ai.extractReferences(text)

      // Convert the Zod-validated response to our Reference format
      return result.references.map((ref: any) => ({
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
