import type { AIService, OpenAIConfig } from '../interfaces/index.js'
import { OpenAI } from 'openai'
import { extractionJsonSchema, type ExtractionResponse, ExtractionResponseSchema } from '../schemas/reference.js'
import { verificationJsonSchema, type VerificationResponse, VerificationResponseSchema } from '../schemas/verification.js'

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

  async extractReferences(text: string): Promise<ExtractionResponse> {
    const systemMessage = `You are an expert bibliographic reference extraction assistant. Your task is to identify and parse academic references from text.

IMPORTANT INSTRUCTIONS:
1. Only extract actual references/citations, not text content
2. For authors: If you can identify first/last names, use the object format; otherwise use string format
3. Be precise with field extraction - only include data you're confident about
4. For dates: Extract year as number, other date parts as strings
5. For source info: Distinguish between journal articles, books, chapters, etc.
6. Include DOI, PMID, ISBN, ISSN when present
7. If no references found, return empty array`

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

  async verifyMatch(prompt: string): Promise<VerificationResponse> {
    const systemMessage = `You are an expert bibliographic verification assistant. Your task is to analyze a verification prompt and provide detailed matching analysis.

INSTRUCTIONS:
1. Parse the provided prompt and extract comparison data
2. Evaluate field-by-field matches between reference and source
3. Provide confidence scores for each field comparison (0-100)
4. Return structured JSON with fieldDetails array
5. Each field detail must include: field name, reference_value, source_value, match_score
6. Use semantic similarity and bibliographic standards for scoring`

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
