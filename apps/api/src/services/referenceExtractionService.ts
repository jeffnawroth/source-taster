import type {
  ApiExtractReference,
  ApiExtractRequest,
  LLMExtractPayload,
  LLMExtractReference,
} from '@source-taster/types'
import crypto from 'node:crypto'
import { BadRequest } from '../errors/AppError'
import { AIServiceFactory } from './ai/aiServiceFactory'

export class ReferenceExtractionService {
  constructor(private readonly userId: string) {}

  async extractReferences(extractionRequest: ApiExtractRequest): Promise<ApiExtractReference[]> {
    return await this.performAIExtraction(extractionRequest)
  }

  private async performAIExtraction(req: ApiExtractRequest): Promise<ApiExtractReference[]> {
    if (!req.aiSettings)
      throw BadRequest('AI settings are required for reference extraction')

    const ai = await AIServiceFactory.createOpenAIService(this.userId, req.aiSettings)
    const result = await ai.extractReferences(req)
    return this.convertToReferences(result)
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
}
