import type {
  ApiAISettings,
  ApiExtractReference,
  ApiExtractRequest,
  LLMExtractPayload,
  LLMExtractReference,
} from '@source-taster/types'
import crypto from 'node:crypto'
import { AIServiceFactory } from './ai/aiServiceFactory'

export class ReferenceExtractionService {
  constructor(private readonly userId: string) {}

  async extractReferences(extractionRequest: ApiExtractRequest): Promise<ApiExtractReference[]> {
    try {
      return await this.performAIExtraction(extractionRequest)
    }
    catch (error) {
      return this.handleExtractionFailure(error)
    }
  }

  private async performAIExtraction(extractionRequest: ApiExtractRequest): Promise<ApiExtractReference[]> {
    const aiSettings = extractionRequest.aiSettings
    if (!aiSettings) {
      throw new Error('AI settings are required for reference extraction')
    }

    const ai = await this.createAIService(aiSettings)
    const result = await ai.extractReferences(extractionRequest)
    return this.convertToReferences(result)
  }

  private async createAIService(userAISettings: ApiAISettings) {
    return AIServiceFactory.createOpenAIService(this.userId, userAISettings)
  }

  private convertToReferences(aiReferences: LLMExtractPayload): ApiExtractReference[] {
    return aiReferences.references.map((ref: LLMExtractReference) => this.createReference(ref))
  }

  private createReference(aiRef: LLMExtractReference): ApiExtractReference {
    return {
      id: crypto.randomUUID(),
      originalText: aiRef.originalText,
      metadata: { ...aiRef.metadata, id: crypto.randomUUID() },
    }
  }

  private handleExtractionFailure(error: unknown): ApiExtractReference[] {
    console.error('Failed to extract references:', error)
    return []
  }
}
