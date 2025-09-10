import type { ApiExtractExtractionSettings, ApiExtractRequest, LLMExtractPayload, OpenAIConfig } from '@source-taster/types'
import { createDynamicExtractionSchema } from '@/api/utils/dynamicExtractionSchema'
import { createSystemMessage, userMessage } from '@/api/utils/extraction-prompt'
import { BaseAIProvider } from './baseAIProvider'

export class ExtractionService extends BaseAIProvider {
  constructor(config: OpenAIConfig) {
    super(config)
  }

  async extractReferences(extractionRequest: ApiExtractRequest): Promise<LLMExtractPayload> {
    const schema = this.createExtractionSchema(extractionRequest.extractionSettings)
    const systemMessage = createSystemMessage(schema.jsonSchema.schema)
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
