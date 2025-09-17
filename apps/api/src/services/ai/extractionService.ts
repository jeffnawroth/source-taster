import type { AIExtractionResponse, ExtractionRequest, OpenAIConfig } from '@source-taster/types'
import { systemMessage, userMessage } from '@/api/extraction-prompt'
import { createDynamicExtractionSchema } from '@/api/types/reference'
import { BaseAIService } from './baseAIService'

export class ExtractionService extends BaseAIService {
  constructor(config: OpenAIConfig) {
    super(config)
  }

  async extractReferences(extractionRequest: ExtractionRequest): Promise<AIExtractionResponse> {
    const schema = this.createExtractionSchema(extractionRequest.extractionSettings)
    const userMsg = userMessage(extractionRequest.text)

    return this.performAIOperation(
      systemMessage,
      userMsg,
      schema,
      { references: [] }, // empty result
      'extraction',
    )
  }

  private createExtractionSchema(extractionSettings: any) {
    const schema = createDynamicExtractionSchema(extractionSettings)
    return {
      jsonSchema: schema.jsonSchema,
      responseSchema: schema.DynamicExtractionResponseSchema,
    }
  }
}
