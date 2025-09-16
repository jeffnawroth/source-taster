import type { AIService, ApiExtractRequest, LLMExtractPayload, OpenAIConfig } from '@source-taster/types'
import { ExtractionService } from './extractionService.js'
// import { MatchingService } from './matchingService'

export class OpenAIExtractionProvider implements AIService {
  private extractionService: ExtractionService

  constructor(config: OpenAIConfig) {
    this.extractionService = new ExtractionService(config)
  }

  async extractReferences(extractionRequest: ApiExtractRequest): Promise<LLMExtractPayload> {
    return this.extractionService.extractReferences(extractionRequest)
  }
}
