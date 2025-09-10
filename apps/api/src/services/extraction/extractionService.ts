import type { ApiExtractExtractionSettings, ApiExtractRequest, LLMExtractPayload, OpenAIConfig } from '@source-taster/types'
import { systemMessage, userMessage } from '@/api/extraction-prompt'
import { createDynamicExtractionSchema } from '@/api/utils/dynamicExtractionSchema'
import { BaseAIProvider } from './baseAIProvider'

export class ExtractionService extends BaseAIProvider {
  constructor(config: OpenAIConfig) {
    super(config)
  }

  async extractReferences(extractionRequest: ApiExtractRequest): Promise<LLMExtractPayload> {
    const schema = this.createExtractionSchema(extractionRequest.extractionSettings)
    const userMsg = userMessage(extractionRequest.text)

    return this.performAIOperation(
      systemMessage,
      userMsg,
      schema,
    )
  }

  private createExtractionSchema(extractionSettings: ApiExtractExtractionSettings) {
    const schema = createDynamicExtractionSchema(extractionSettings)
    return {
      jsonSchema: schema.jsonSchema,
      responseSchema: schema.DynamicExtractionResponseSchema,
    }
  }
}
