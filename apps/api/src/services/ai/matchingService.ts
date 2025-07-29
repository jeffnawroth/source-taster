import type { AIMatchingResponse, APIMatchingSettings, MatchingActionType, OpenAIConfig } from '@source-taster/types'
import type { ReferenceMetadataFields } from 'node_modules/@source-taster/types/dist/reference/reference.constants'
import type { ResponseFormatJSONSchema } from 'openai/resources/shared.mjs'
import type { ZodSchema } from 'zod'
import { OpenAI } from 'openai'
import { MATCHING_RULES_MAP } from '../../constants/matchingRules'
import { createMatchingSchema } from '../../types/matching'
import { buildInstructionsFromActionTypes } from '../../utils/instructionGenerator'

export class MatchingService {
  private client: OpenAI
  private config: OpenAIConfig

  constructor(config: OpenAIConfig) {
    this.config = config
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl, // Support for different providers
      maxRetries: config.maxRetries,
      timeout: config.timeout,
    })
  }

  async matchFields(
    prompt: string,
    matchingSettings: APIMatchingSettings,
    availableFields: ReferenceMetadataFields[],
  ): Promise<AIMatchingResponse> {
    const systemMessage = this.buildSystemMessage(matchingSettings, availableFields)
    const schema = createMatchingSchema(availableFields)

    try {
      const response = await this.callOpenAI(systemMessage, prompt, schema.jsonSchema)
      return this.parseOpenAIResponse(response, schema.MatchingResponseSchema)
    }
    catch (error: any) {
      return this.handleMatchingError(error)
    }
  }

  private buildSystemMessage(
    matchingSettings: APIMatchingSettings,
    availableFields: ReferenceMetadataFields[],
  ): string {
    const baseMessage = `You are an expert bibliographic matching assistant. Your task is to provide field-by-field matching scores.

CRITICAL INSTRUCTIONS:
- You MUST evaluate ALL of the ${availableFields.length} available fields provided in the prompt
- Return EXACTLY ${availableFields.length} field evaluations - one for each field listed in the prompt
- Evaluate each field independently, even if other fields don't match
- A DOI match does NOT mean you can skip evaluating title, authors, etc.
- Each field gets its own individual score from 0-100 based on how well that specific field matches
- If a field is missing in either reference or source, give it a score of 0
- Do NOT skip any of the ${availableFields.length} required fields in your response`

    const modeInstructions = this.getMatchingInstructions(matchingSettings.matchingStrategy.actionTypes)
    return `${baseMessage}\n\n${modeInstructions}`
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

  private parseOpenAIResponse(response: OpenAI.Chat.Completions.ChatCompletion, DynamicMatchingResponseSchema: ZodSchema): AIMatchingResponse {
    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    let parsedResponse
    try {
      parsedResponse = JSON.parse(content)
    }
    catch {
      console.error('Failed to parse OpenAI matching response as JSON:', content)
      throw new Error('Invalid JSON response from OpenAI matching')
    }

    // Validate response with dynamic Zod schema
    const validatedResponse = DynamicMatchingResponseSchema.parse(parsedResponse) as AIMatchingResponse
    return validatedResponse
  }

  private handleMatchingError(error: any): AIMatchingResponse {
    if (error.name === 'ZodError') {
      console.error('Matching validation error:', error.errors)
      console.warn('Returning empty fieldDetails array due to validation error')
      return { fieldDetails: [] }
    }

    console.error('OpenAI matchFields error:', error)
    throw new Error(`Failed to match fields: ${error.message}`)
  }

  private getMatchingInstructions(actionTypes: MatchingActionType[]): string {
    return buildInstructionsFromActionTypes(
      actionTypes,
      MATCHING_RULES_MAP,
      'IMPORTANT: Apply the following rules when comparing fields. Do NOT apply any other rules beyond what is explicitly listed below. The field score should be given after applying the rules:',
      'Compare fields as they are without modifications.',
    )
  }
}
