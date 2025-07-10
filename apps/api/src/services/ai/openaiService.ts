import type { AIService, OpenAIConfig } from '@/api/types/ai'
import type { AIExtractionResponse } from '@/api/types/extraction'
import type { AIVerificationResponse } from '@/api/types/verification'
import { OpenAI } from 'openai'
import { extractionJsonSchema, ExtractionResponseSchema } from './schemas/reference'
import { verificationJsonSchema, VerificationResponseSchema } from './schemas/verification.js'

export class OpenAIService implements AIService {
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

  async extractReferences(text: string): Promise<AIExtractionResponse> {
    const systemMessage = `You are an expert bibliographic reference extraction assistant. Your task is to identify and parse academic references from text.`

    const userMessage = `Extract all bibliographic references from the following text. Return structured data according to the schema:

${text}`

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        temperature: this.config.temperature,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: extractionJsonSchema,
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
        console.error('Failed to parse OpenAI response as JSON:', content)
        throw new Error('Invalid JSON response from OpenAI')
      }

      // Validate response with Zod
      const validatedResponse = ExtractionResponseSchema.parse(parsedResponse)

      return validatedResponse
    }
    catch (error: any) {
      if (error.name === 'ZodError') {
        console.error('Validation error:', error.errors)
        // Return empty references array as fallback
        console.warn('Returning empty references array due to validation error')
        return { references: [] }
      }

      console.error('OpenAI extraction error:', error)
      throw new Error(`Failed to extract references: ${error.message}`)
    }
  }

  async verifyMatch(prompt: string): Promise<AIVerificationResponse> {
    const systemMessage = `You are an expert bibliographic verification assistant. Your task is to analyze a verification prompt and provide field-by-field matching scores.

INSTRUCTIONS:
1. Parse the provided prompt and extract comparison data between a reference and source
2. Evaluate field-by-field matches using bibliographic standards
3. Provide match scores for each field (0-100 scale)
4. Return an object with 'fieldDetails' array containing objects with 'field' and 'match_score'
5. Use semantic similarity and bibliographic standards for scoring
6. Focus on key fields: title, authors, year, doi, isbn, containerTitle, volume, issue, pages

SCORING GUIDELINES:
- 100: Perfect match
- 80-99: Very close match (minor differences)
- 60-79: Good match (some differences)
- 40-59: Partial match (significant differences)
- 20-39: Poor match (major differences)
- 0-19: No match`

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
          json_schema: verificationJsonSchema,
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
        console.error('Failed to parse OpenAI verification response as JSON:', content)
        throw new Error('Invalid JSON response from OpenAI verification')
      }

      // Validate response with Zod
      const validatedResponse = VerificationResponseSchema.parse(parsedResponse)

      return validatedResponse
    }
    catch (error: any) {
      if (error.name === 'ZodError') {
        console.error('Verification validation error:', error.errors)
        // Return empty fieldDetails array as fallback
        console.warn('Returning empty fieldDetails array due to validation error')
        return { fieldDetails: [] }
      }

      console.error('OpenAI verifyMatch error:', error)
      throw new Error(`Failed to verify match: ${error.message}`)
    }
  }
}
