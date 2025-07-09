import type {
  Reference,
} from '@source-taster/types'
import type { ZodReference } from './ai/schemas/reference'
import crypto from 'node:crypto'
import { AIServiceFactory } from './ai/aiServiceFactory'

export class ReferenceExtractionService {
  async extractReferences(
    text: string,
  ): Promise<Reference[]> {
    const ai = AIServiceFactory.createOpenAIService()

    try {
      const result = await ai.extractReferences(text)

      // Convert the Zod-validated response to our Reference format
      return result.references.map((ref: ZodReference) => ({
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
