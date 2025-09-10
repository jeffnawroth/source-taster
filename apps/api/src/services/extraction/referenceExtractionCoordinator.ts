// src/services/extraction/ReferenceExtractionCoordinator.ts
import type {
  ApiExtractReference,
  ApiExtractRequest,
  LLMExtractPayload,
  LLMExtractReference,
} from '@source-taster/types'
import { generateUUID } from '@/api/utils/generateUUID'
import { httpBadRequest } from '../../errors/http'
import { AIProviderFactory } from './aiProviderFactory'

export class ReferenceExtractionCoordinator {
  constructor(private readonly userId: string) {}

  public async extractReferences(req: ApiExtractRequest): Promise<ApiExtractReference[]> {
    return this.performAIExtraction(req)
  }

  private async performAIExtraction(req: ApiExtractRequest): Promise<ApiExtractReference[]> {
    if (!req.aiSettings) {
      httpBadRequest('AI settings are required for reference extraction')
    }

    const ai = await AIProviderFactory.createOpenAIService(this.userId, req.aiSettings!)
    const result = await ai.extractReferences(req)
    return this.convertToReferences(result)
  }

  private convertToReferences(aiPayload: LLMExtractPayload): ApiExtractReference[] {
    return aiPayload.references.map((ref: LLMExtractReference) => this.createReference(ref))
  }

  private createReference(aiRef: LLMExtractReference): ApiExtractReference {
    return {
      id: generateUUID(),
      originalText: aiRef.originalText,
      metadata: { ...aiRef.metadata, id: generateUUID() },
    }
  }
}
