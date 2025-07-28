import type {
  AIExtractedReference,
  ExtractionRequest,
  Reference,
} from '@source-taster/types'
import crypto from 'node:crypto'
import { AIServiceFactory } from './ai/aiServiceFactory'

export class ReferenceExtractionService {
  async extractReferences(
    extractionRequest: ExtractionRequest,
  ): Promise<Reference[]> {
    try {
      return await this.performAIExtraction(
        extractionRequest,
      )
    }
    catch (error) {
      return this.handleExtractionFailure(error)
    }
  }

  private async performAIExtraction(
    extractionRequest: ExtractionRequest,
  ): Promise<Reference[]> {
    const ai = this.createAIService()
    const result = await ai.extractReferences(extractionRequest)

    return this.convertToReferences(result.references)
  }

  private createAIService() {
    return AIServiceFactory.createOpenAIService()
  }

  private convertToReferences(aiReferences: AIExtractedReference[]): Reference[] {
    return aiReferences.map((ref: AIExtractedReference) => this.createReference(ref))
  }

  private createReference(aiRef: AIExtractedReference): Reference {
    return {
      id: this.generateUniqueId(),
      originalText: aiRef.originalText,
      metadata: aiRef.metadata,
      extractionResults: aiRef.extractionResults || [],
    }
  }

  private generateUniqueId(): string {
    return crypto.randomUUID()
  }

  private handleExtractionFailure(error: unknown): Reference[] {
    console.error('Failed to extract references:', error)
    return []
  }
}
