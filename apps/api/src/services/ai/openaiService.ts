import type { AIExtractionResponse, AIService, AIVerificationResponse, ExtractionSettings, OpenAIConfig } from '@source-taster/types'
import { ExtractionService } from './extractionService'
import { VerificationService } from './verificationService'

export class OpenAIService implements AIService {
  private extractionService: ExtractionService
  private verificationService: VerificationService

  constructor(config: OpenAIConfig) {
    this.extractionService = new ExtractionService(config)
    this.verificationService = new VerificationService(config)
  }

  async extractReferences(text: string, extractionSettings?: ExtractionSettings): Promise<AIExtractionResponse> {
    return this.extractionService.extractReferences(text, extractionSettings)
  }

  async verifyMatch(prompt: string): Promise<AIVerificationResponse> {
    return this.verificationService.verifyMatch(prompt)
  }
}
