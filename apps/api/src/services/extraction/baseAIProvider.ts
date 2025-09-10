import type { OpenAIConfig } from '@source-taster/types'
import type { ResponseFormatJSONSchema } from 'openai/resources/shared.mjs'
import { OpenAI } from 'openai'
import {
  httpBadRequest,
  httpConflict,
  httpForbidden,
  httpRateLimited,
  httpUnauthorized,
  httpUnprocessable,
  httpUpstream,
} from '../../errors/http'

/**
 * Base AI service with common functionality for all AI providers
 * Handles provider-specific API differences and fallback strategies
 */
export abstract class BaseAIProvider {
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
   * High-level call that prefers structured json_schema and falls back to json_object
   * if the provider doesn't support response_format=json_schema.
   */
  protected async callOpenAI(
    systemMessage: string,
    userMessage: string,
    schema: ResponseFormatJSONSchema.JSONSchema,
  ) {
    try {
      return await this.makeStructuredAPICall(systemMessage, userMessage, schema)
    }
    catch (e: any) {
      // Fallback nur, wenn wirklich response_format nicht unterstützt wird
      if (this.isJsonSchemaUnsupportedError(e)) {
        return await this.makeUnstructuredAPICall(systemMessage, userMessage, schema)
      }
      this.mapAIError(e)
    }
  }

  /**
   * Make structured API call with json_schema support
   */
  protected async makeStructuredAPICall(
    systemMessage: string,
    userMessage: string,
    schema: ResponseFormatJSONSchema.JSONSchema,
  ) {
    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ]

      // Optional: Provider-spezifische Anpassungen (z. B. Anthropic via OpenAI-kompatible Gateways)
      if (this.isAnthropicProvider()) {
        messages.push({ role: 'assistant', content: JSON.stringify(schema) })
      }

      return await this.client.chat.completions.create({
        model: this.config.model,
        temperature: this.config.temperature,
        messages,
        response_format: { type: 'json_schema', json_schema: schema },
      })
    }
    catch (e: any) {
      // structured nicht verfügbar? Caller kümmert sich um Fallback
      if (this.isJsonSchemaUnsupportedError(e))
        throw e
      this.mapAIError(e)
    }
  }

  /**
   * Make unstructured API call with json_object fallback
   */
  protected async makeUnstructuredAPICall(
    systemMessage: string,
    userMessage: string,
    schema: ResponseFormatJSONSchema.JSONSchema,
  ) {
    try {
      console.warn(`Provider ${this.config.model} doesn't support json_schema, falling back to json_object with schema instructions`)

      const enhancedSystemMessage = this.enhanceSystemMessageWithSchema(systemMessage, schema)

      return await this.client.chat.completions.create({
        model: this.config.model,
        temperature: this.config.temperature,
        messages: [
          { role: 'system', content: enhancedSystemMessage },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
      })
    }
    catch (e: any) {
      this.mapAIError(e)
    }
  }

  /**
   * Centralized mapping of OpenAI/Upstream errors to HTTPException
   */
  protected mapAIError(e: any) {
    const status: number | undefined
      = e?.status ?? e?.response?.status ?? e?.error?.status

    const code = e?.code ?? e?.error?.code
    const msg: string
      = e?.error?.message ?? e?.message ?? 'Upstream AI error'

    // Häufige Fälle:
    if (status === 400)
      return httpBadRequest(msg, e)
    if (status === 401 || code === 'invalid_api_key')
      return httpUnauthorized('Invalid API key for provider', e)
    if (status === 403)
      return httpForbidden(msg || 'Forbidden', e)
    if (status === 404)
      return httpUpstream('Upstream endpoint not found', 502, e)
    if (status === 409)
      return httpConflict(msg || 'Conflict', e)
    if (status === 422)
      return httpUnprocessable(msg || 'Unprocessable', e)
    if (status === 429)
      return httpRateLimited(msg || 'Upstream rate limited', e)
    if (status && status >= 500)
      return httpUpstream('Upstream server error', 502, e)

    // Spezieller Case: response_format nicht unterstützt — wird vom Caller als Fallback behandelt.
    if (this.isJsonSchemaUnsupportedError(e)) {
      throw e
    }

    // Default: behandle als Upstream-Fehler
    return httpUpstream(msg, 502, e)
  }

  /**
   * Check if the current provider is Anthropic/Claude
   */
  protected isAnthropicProvider(): boolean {
    const baseUrl = this.config.baseUrl?.toLowerCase() || ''
    const model = this.config.model.toLowerCase()
    return baseUrl.includes('anthropic') || baseUrl.includes('claude') || model.startsWith('claude')
  }

  /**
   * Check if error indicates json_schema is unsupported
   */
  protected isJsonSchemaUnsupportedError(error: any): boolean {
    return error?.error?.type === 'invalid_request_error'
      && typeof error?.error?.message === 'string'
      && error.error.message.includes('response_format')
  }

  /**
   * Enhance system message with schema instructions for fallback
   */
  protected enhanceSystemMessageWithSchema(
    systemMessage: string,
    schema: ResponseFormatJSONSchema.JSONSchema,
  ): string {
    // Extract only the actual schema part, not the wrapper with name/description
    const actualSchema = schema.schema || schema

    return `${systemMessage}

CRITICAL: You MUST respond with ONLY a valid JSON object that exactly matches this schema:
${JSON.stringify(actualSchema, null, 2)}

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

  private extractResponseContent(response: OpenAI.Chat.Completions.ChatCompletion): string {
    const content = response.choices[0]?.message?.content
    if (!content) {
      throw httpUpstream('No content in AI response', 502)
    }
    return content
  }

  private parseJSONContent(content: string): any {
    try {
      return JSON.parse(content)
    }
    catch {
      try {
        const extractedJSON = this.extractJSONFromMarkdown(content)
        return JSON.parse(extractedJSON)
      }
      catch {
        httpUpstream('Invalid JSON response from AI service', 502)
      }
    }
  }

  private validateResponse<T>(parsedResponse: any, schema: any): T {
    // Zod-Fehler werden weitergeworfen → app.onError macht 400/validation_error
    return schema.parse(parsedResponse) as T
  }

  /**
   * Template methods for AI operations (kein eigenes Swallowing mehr)
   */
  protected async executeAIOperation<T>(
    systemMessage: string,
    userMessage: string,
    schema: { jsonSchema: ResponseFormatJSONSchema.JSONSchema, responseSchema: any },
  ): Promise<T> {
    const response = await this.callOpenAI(systemMessage, userMessage, schema.jsonSchema)
    if (!response) {
      throw httpUpstream('No response from AI service', 502)
    }
    return this.parseOpenAIResponse(response, schema.responseSchema) as T
  }

  protected async performAIOperation<T>(
    systemMessage: string,
    userMessage: string,
    schema: { jsonSchema: ResponseFormatJSONSchema.JSONSchema, responseSchema: any },
  ): Promise<T> {
    return this.executeAIOperation(systemMessage, userMessage, schema)
  }

  private extractJSONFromMarkdown(content: string): string {
    const jsonBlockMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
    if (jsonBlockMatch)
      return jsonBlockMatch[1].trim()

    const firstBrace = content.indexOf('{')
    const lastBrace = content.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return content.substring(firstBrace, lastBrace + 1)
    }
    return content.trim()
  }
}
