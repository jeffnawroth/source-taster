import type { ApiExtractExtractionSettings, ApiExtractRequest, LLMExtractPayload, OpenAIConfig } from '@source-taster/types'
import { createDynamicExtractionSchema } from '../../utils/dynamicExtractionSchema.js'
import { systemMessage, userMessage } from '../../utils/extraction-prompt.js'
import { BaseAIProvider } from './baseAIProvider.js'

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
