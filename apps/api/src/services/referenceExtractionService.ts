import type {
  AIExtractedReference,
  ExtractionRequest,
  Reference,
  UserAISettings,
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
    if (!extractionRequest.aiSettings) {
      throw new Error('AI settings are required for reference extraction')
    }

    const ai = this.createAIService(extractionRequest.aiSettings)
    const result = await ai.extractReferences(extractionRequest)

    return this.convertToReferences(result.references)
  }

  private createAIService(userAISettings: UserAISettings) {
    if (!userAISettings?.apiKey) {
      throw new Error('API key required: Please provide your own OpenAI API key in the extension settings to use AI-powered features.')
    }

    return AIServiceFactory.createOpenAIService(userAISettings)
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
