import type { AIMatchingResponse, MatchingSettings, MatchingStrategy, OpenAIConfig } from '@source-taster/types'
import type { ReferenceMetadataFields } from 'node_modules/@source-taster/types/dist/reference/reference.constants'
import { OpenAI } from 'openai'
import { createMatchingSchema } from '../../types/matching'

export class MatchingService {
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

  async matchFields(prompt: string, matchingSettings: MatchingSettings, availableFields: ReferenceMetadataFields[]): Promise<AIMatchingResponse> {
    let systemMessage = `You are an expert bibliographic matching assistant. Your task is to provide field-by-field matching scores.

CRITICAL INSTRUCTIONS:
- ONLY evaluate the fields explicitly listed in "Available fields for matching" in the user prompt
- Do NOT evaluate any other fields, even if they exist in the data
- Only evaluate fields that are present in both reference and source
- This prevents unfair penalties when source databases have incomplete metadata`

    const modeInstructions = this.getMatchingInstructions(matchingSettings.matchingStrategy)
    systemMessage += `\n\n${modeInstructions}`

    // Create dynamic schema based on available fields
    const { MatchingResponseSchema: DynamicMatchingResponseSchema, jsonSchema } = createMatchingSchema(availableFields)

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        temperature: this.config.temperature,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: jsonSchema,
        },
      })

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

      // Convert to AIMatchingResponse format
      return {
        fieldDetails: validatedResponse.fieldDetails.map(field => ({
          field: field.field as any, // Cast to proper FieldMatchDetail field type
          match_score: field.match_score,
        })),
      }
    }
    catch (error: any) {
      if (error.name === 'ZodError') {
        console.error('Matching validation error:', error.errors)
        // Return empty fieldDetails array as fallback
        console.warn('Returning empty fieldDetails array due to validation error')
        return { fieldDetails: [] }
      }

      console.error('OpenAI matchFields error:', error)
      throw new Error(`Failed to match fields: ${error.message}`)
    }
  }

  private getMatchingInstructions(matchingStrategy: MatchingStrategy): string {
  // Use the rules that are already filtered by the frontend
    const activeRules = matchingStrategy.rules

    // If no rules are active, return empty instructions (AI should do nothing)
    if (activeRules.length === 0) {
      return 'Compare fields as they are without modifications.'
    }

    // Build instructions from active rules
    const instructions: string[] = [
      'IMPORTANT: Apply the following rules when comparing fields. Do NOT apply any other rules beyond what is explicitly listed below. The field score should be given after applying the rules:',
    ]

    for (const rule of activeRules) {
      instructions.push(`• ${rule.aiInstruction.prompt}`)
      if (rule.aiInstruction.example) {
        instructions.push(`  Example: ${rule.aiInstruction.example}`)
      }
    }
    return instructions.join('\n')
  }
}
