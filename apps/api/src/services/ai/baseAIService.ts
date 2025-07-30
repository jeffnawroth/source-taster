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
      return await this.makeStructuredAPICall(systemMessage, userMessage, schema)
    }
    catch (error: any) {
      if (this.isJsonSchemaUnsupportedError(error)) {
        return await this.makeUnstructuredAPICall(systemMessage, userMessage, schema)
      }
      throw error
    }
  }

  /**
   * Make structured API call with json_schema support
   */
  private async makeStructuredAPICall(
    systemMessage: string,
    userMessage: string,
    schema: ResponseFormatJSONSchema.JSONSchema,
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    return await this.client.chat.completions.create({
      model: this.config.model,
      temperature: this.config.temperature,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
        { role: 'assistant', content: JSON.stringify(schema) }, // Show expected structure

      ],
      response_format: {
        type: 'json_schema',
        json_schema: schema,
      },
    })
  }

  /**
   * Make unstructured API call with json_object fallback
   */
  private async makeUnstructuredAPICall(
    systemMessage: string,
    userMessage: string,
    schema: ResponseFormatJSONSchema.JSONSchema,
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    console.warn(`Provider ${this.config.model} doesn't support json_schema, falling back to json_object with schema instructions`)

    const enhancedSystemMessage = this.enhanceSystemMessageWithSchema(systemMessage, schema)

    return await this.client.chat.completions.create({
      model: this.config.model,
      temperature: this.config.temperature,
      messages: [
        { role: 'system', content: enhancedSystemMessage },
        { role: 'user', content: userMessage },
        { role: 'assistant', content: JSON.stringify(schema) }, // Show expected structure
      ],
      response_format: { type: 'json_object' },
    })
  }

  /**
   * Check if error indicates json_schema is unsupported
   */
  private isJsonSchemaUnsupportedError(error: any): boolean {
    return error?.error?.type === 'invalid_request_error'
      && error?.error?.message?.includes('response_format')
  }

  /**
   * Enhance system message with schema instructions for fallback
   */
  private enhanceSystemMessageWithSchema(
    systemMessage: string,
    schema: ResponseFormatJSONSchema.JSONSchema,
  ): string {
    return `${systemMessage}

CRITICAL: You MUST respond with ONLY a valid JSON object that exactly matches this schema:
${JSON.stringify(schema, null, 2)}

DO NOT include any explanatory text, markdown formatting, or code blocks.
DO NOT add any preamble or conclusion.
Your response should be ONLY the JSON object starting with { and ending with }.`
  }

  /**
   * Parse and validate OpenAI response content
   */
  protected parseOpenAIResponse<T>(
    response: OpenAI.Chat.Completions.ChatCompletion,
    schema: any,
  ): T {
    const content = this.extractResponseContent(response)
    const parsedResponse = this.parseJSONContent(content)
    return this.validateResponse<T>(parsedResponse, schema)
  }

  /**
   * Extract content from OpenAI response
   */
  private extractResponseContent(response: OpenAI.Chat.Completions.ChatCompletion): string {
    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in AI response')
    }
    return content
  }

  /**
   * Parse JSON content with error handling
   */
  private parseJSONContent(content: string): any {
    try {
      // First try direct parsing
      return JSON.parse(content)
    }
    catch {
      // If direct parsing fails, try extracting JSON from markdown or explanatory text
      try {
        const extractedJSON = this.extractJSONFromMarkdown(content)
        return JSON.parse(extractedJSON)
      }
      catch {
        console.error('Failed to parse AI response as JSON:', content)
        throw new Error('Invalid JSON response from AI service')
      }
    }
  }

  /**
   * Validate parsed response against schema
   */
  private validateResponse<T>(parsedResponse: any, schema: any): T {
    return schema.parse(parsedResponse) as T
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
   * Execute AI operation without error handling - pure business logic
   */
  protected async executeAIOperation<T>(
    systemMessage: string,
    userMessage: string,
    schema: { jsonSchema: ResponseFormatJSONSchema.JSONSchema, responseSchema: any },
  ): Promise<T> {
    const response = await this.callOpenAI(systemMessage, userMessage, schema.jsonSchema)
    return this.parseOpenAIResponse(response, schema.responseSchema) as T
  }

  /**
   * Template method for AI operations with error handling
   */
  protected async performAIOperation<T>(
    systemMessage: string,
    userMessage: string,
    schema: { jsonSchema: ResponseFormatJSONSchema.JSONSchema, responseSchema: any },
    emptyResult: T,
    operationType: string,
  ): Promise<T> {
    try {
      return await this.executeAIOperation(systemMessage, userMessage, schema)
    }
    catch (error: any) {
      return this.handleAIError(error, emptyResult, operationType)
    }
  }

  /**
   * Extract JSON from markdown code blocks or mixed text
   */
  private extractJSONFromMarkdown(content: string): string {
    // Try to extract from ```json code blocks first
    const jsonBlockMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
    if (jsonBlockMatch) {
      return jsonBlockMatch[1].trim()
    }

    // Try to find JSON object boundaries in the text
    const firstBrace = content.indexOf('{')
    const lastBrace = content.lastIndexOf('}')

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return content.substring(firstBrace, lastBrace + 1)
    }

    // If no clear boundaries found, return the content as-is
    return content.trim()
  }
}
