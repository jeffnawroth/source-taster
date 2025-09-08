import type { AIService, ApiExtractRequest, LLMExtractPayload, OpenAIConfig,

} from '@source-taster/types'
import { ExtractionService } from './extractionService'
// import { MatchingService } from './matchingService'

export class OpenAIService implements AIService {
  private extractionService: ExtractionService

  constructor(config: OpenAIConfig) {
    this.extractionService = new ExtractionService(config)
  }

  async extractReferences(extractionRequest: ApiExtractRequest): Promise<LLMExtractPayload> {
    return this.extractionService.extractReferences(extractionRequest)
  }
}
