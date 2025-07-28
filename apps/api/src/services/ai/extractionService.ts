import type { AIExtractionResponse, ExtractionRequest, ExtractionStrategy, OpenAIConfig } from '@source-taster/types'
import type { ResponseFormatJSONSchema } from 'openai/resources/shared.mjs'
import type { ZodSchema } from 'zod'
import { OpenAI } from 'openai'
import { createDynamicExtractionSchema } from '@/api/types/reference'
import { EXTRACTION_RULES_MAP } from '../../constants/extractionRules'
import { buildInstructionsFromActionTypes } from '../../utils/instructionGenerator'

export class ExtractionService {
  private client: OpenAI
  private config: OpenAIConfig

  constructor(config: OpenAIConfig) {
    this.config = config
    this.client = new OpenAI({
      apiKey: config.apiKey,
      maxRetries: config.maxRetries,
      timeout: config.timeout,
    })
  }

  async extractReferences(extractionRequest: ExtractionRequest): Promise<AIExtractionResponse> {
    const systemMessage = this.buildSystemMessage(extractionRequest.extractionSettings.extractionStrategy)
    const userMessage = this.buildUserMessage(extractionRequest.text)
    const schema = createDynamicExtractionSchema(extractionRequest.extractionSettings)

    try {
      const response = await this.callOpenAI(systemMessage, userMessage, schema.jsonSchema)
      return this.parseOpenAIResponse(response, schema.DynamicExtractionResponseSchema)
    }
    catch (error: any) {
      return this.handleExtractionError(error)
    }
  }

  private buildSystemMessage(extractionStrategy: ExtractionStrategy): string {
    const baseMessage = `You are an expert bibliographic reference extraction assistant. Your task is to identify and parse academic references from text. 
    When you extract references, you MUST track every change you make in the "extractionResults" array.`

    const modeInstructions = this.getExtractionInstructions(extractionStrategy)
    return `${baseMessage}\n\n${modeInstructions}`
  }

  private buildUserMessage(text: string): string {
    return `Extract all bibliographic references from the following text. Return structured data according to the schema:

${text}`
  }

  private async callOpenAI(systemMessage: string, userMessage: string, schema: ResponseFormatJSONSchema.JSONSchema) {
    return await this.client.chat.completions.create({
      model: this.config.model,
      temperature: this.config.temperature,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: schema,
      },
    })
  }

  private parseOpenAIResponse(response: OpenAI.Chat.Completions.ChatCompletion, DynamicExtractionResponseSchema: ZodSchema): AIExtractionResponse {
    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    let parsedResponse
    try {
      parsedResponse = JSON.parse(content)
    }
    catch {
      console.error('Failed to parse OpenAI response as JSON:', content)
      throw new Error('Invalid JSON response from OpenAI')
    }

    const validatedResponse = DynamicExtractionResponseSchema.parse(parsedResponse) as AIExtractionResponse
    return validatedResponse
  }

  private handleExtractionError(error: any): AIExtractionResponse {
    if (error.name === 'ZodError') {
      console.error('Validation error:', error.errors)
      console.warn('Returning empty references array due to validation error')
      return { references: [] }
    }

    console.error('OpenAI extraction error:', error)
    throw new Error(`Failed to extract references: ${error.message}`)
  }

  private getExtractionInstructions(extractionStrategy: ExtractionStrategy): string {
    return buildInstructionsFromActionTypes(
      extractionStrategy.actionTypes,
      EXTRACTION_RULES_MAP,
      'IMPORTANT: Only perform the following specific modifications. Do NOT make any other changes beyond what is explicitly listed below:',
      'Extract exactly as written in the source without any modifications.',
    )
  }
}
