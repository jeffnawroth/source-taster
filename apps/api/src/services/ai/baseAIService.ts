import type { OpenAIConfig } from '@source-taster/types'
import type { ResponseFormatJSONSchema } from 'openai/resources/shared.mjs'
import { OpenAI } from 'openai'
import { buildInstructionsFromActionTypes } from '../../utils/instructionGenerator'

/**
 * Base AI service with common functionality for all AI providers
 * Handles provider-specific API differences and fallback strategies
 */
export abstract class BaseAIService {
  protected client: OpenAI
  protected config: OpenAIConfig

  constructor(config: OpenAIConfig) {
    this.config = config
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl, // Support for different providers
      maxRetries: config.maxRetries,
      timeout: config.timeout,
    })
  }

  /**
   * Make an OpenAI-compatible API call with automatic fallback for providers
   * that don't support structured json_schema responses
   */
  protected async callOpenAI(
    systemMessage: string,
    userMessage: string,
    schema: ResponseFormatJSONSchema.JSONSchema,
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    try {
      // Try with structured JSON schema first (OpenAI, Anthropic, Google)
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
    catch (error: any) {
      // Fallback for providers that don't support json_schema (DeepSeek, etc.)
      if (error?.error?.type === 'invalid_request_error'
        && error?.error?.message?.includes('response_format')) {
        console.warn(`Provider ${this.config.model} doesn't support json_schema, falling back to json_object with schema instructions`)

        // Add JSON schema instruction to system message
        const enhancedSystemMessage = `${systemMessage}

IMPORTANT: You must respond with valid JSON that exactly matches this schema:
${JSON.stringify(schema, null, 2)}

Return only the JSON object, no additional text or formatting.`

        return await this.client.chat.completions.create({
          model: this.config.model,
          temperature: this.config.temperature,
          messages: [
            { role: 'system', content: enhancedSystemMessage },
            { role: 'user', content: userMessage },
          ],
          response_format: { type: 'json_object' }, // Basic JSON format
        })
      }

      // Re-throw other errors
      throw error
    }
  }

  /**
   * Parse and validate OpenAI response content
   */
  protected parseOpenAIResponse<T>(
    response: OpenAI.Chat.Completions.ChatCompletion,
    schema: any,
  ): T {
    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in AI response')
    }

    let parsedResponse
    try {
      parsedResponse = JSON.parse(content)
    }
    catch {
      console.error('Failed to parse AI response as JSON:', content)
      throw new Error('Invalid JSON response from AI service')
    }

    const validatedResponse = schema.parse(parsedResponse) as T
    return validatedResponse
  }

  /**
   * Build system message with base instructions and specific mode instructions
   */
  protected buildSystemMessage(
    baseMessage: string,
    actionTypes: any[],
    rulesMap: Record<string, any>,
    modePrefix: string,
    fallbackMessage: string,
  ): string {
    const modeInstructions = this.buildInstructions(actionTypes, rulesMap, modePrefix, fallbackMessage)
    return `${baseMessage}\n\n${modeInstructions}`
  }

  /**
   * Build instructions from action types using the instruction generator
   */
  protected buildInstructions(
    actionTypes: any[],
    rulesMap: Record<string, any>,
    modePrefix: string,
    fallbackMessage: string,
  ): string {
    return buildInstructionsFromActionTypes(
      actionTypes,
      rulesMap,
      modePrefix,
      fallbackMessage,
    )
  }

  /**
   * Generic error handler for AI operations
   */
  protected handleAIError<T>(error: any, emptyResult: T, operationType: string): T {
    if (error.name === 'ZodError') {
      console.error(`${operationType} validation error:`, error.errors)
      console.warn(`Returning empty result due to validation error`)
      return emptyResult
    }

    console.error(`AI ${operationType} error:`, error)
    throw new Error(`Failed to ${operationType}: ${error.message}`)
  }

  /**
   * Generic AI operation template method
   */
  protected async performAIOperation<T>(
    systemMessage: string,
    userMessage: string,
    schema: { jsonSchema: ResponseFormatJSONSchema.JSONSchema, responseSchema: any },
    emptyResult: T,
    operationType: string,
  ): Promise<T> {
    try {
      const response = await this.callOpenAI(systemMessage, userMessage, schema.jsonSchema)
      return this.parseOpenAIResponse(response, schema.responseSchema) as T
    }
    catch (error: any) {
      return this.handleAIError(error, emptyResult, operationType)
    }
  }
}
