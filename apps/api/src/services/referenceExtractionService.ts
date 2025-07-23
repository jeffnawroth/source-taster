import type {
  AIExtractedReference,
  ExtractionSettings,
  Reference,
} from '@source-taster/types'
import crypto from 'node:crypto'
import { AIServiceFactory } from './ai/aiServiceFactory'

export class ReferenceExtractionService {
  async extractReferences(
    text: string,
    extractionSettings: ExtractionSettings,
  ): Promise<Reference[]> {
    const ai = AIServiceFactory.createOpenAIService()

    try {
      const result = await ai.extractReferences(text, extractionSettings)

      // Convert the AI response to our Reference format with unique IDs
      return result.references.map((ref: AIExtractedReference) => ({
        id: crypto.randomUUID(),
        originalText: ref.originalText,
        metadata: ref.metadata,
        processingResults: ref.processingResults || [],
      }))
    }
    catch (error) {
      console.error('Failed to extract references:', error)
      return []
    }
  }
}
