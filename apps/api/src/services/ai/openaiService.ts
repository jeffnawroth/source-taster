import type { AIExtractionResponse, AIService, ExtractionRequest, OpenAIConfig,

} from '@source-taster/types'
import { ExtractionService } from './extractionService'
// import { MatchingService } from './matchingService'

export class OpenAIService implements AIService {
  private extractionService: ExtractionService

  constructor(config: OpenAIConfig) {
    this.extractionService = new ExtractionService(config)
  }

  async extractReferences(extractionRequest: ExtractionRequest): Promise<AIExtractionResponse> {
    return this.extractionService.extractReferences(extractionRequest)
  }
}
