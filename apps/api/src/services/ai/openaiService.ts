import type { AIExtractionResponse, AIMatchingResponse, AIService, ExtractionRequest, MatchingSettings, OpenAIConfig } from '@source-taster/types'
import { ExtractionService } from './extractionService'
import { MatchingService } from './matchingService'

export class OpenAIService implements AIService {
  private extractionService: ExtractionService
  private matchingService: MatchingService

  constructor(config: OpenAIConfig) {
    this.extractionService = new ExtractionService(config)
    this.matchingService = new MatchingService(config)
  }

  async extractReferences(extractionRequest: ExtractionRequest): Promise<AIExtractionResponse> {
    return this.extractionService.extractReferences(extractionRequest)
  }

  async matchFields(prompt: string, matchingSettings: MatchingSettings): Promise<AIMatchingResponse> {
    return this.matchingService.matchFields(prompt, matchingSettings)
  }
}
