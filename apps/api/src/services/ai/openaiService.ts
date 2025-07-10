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
    const systemMessage = `You are an expert bibliographic verification assistant. Your task is to provide field-by-field matching scores.
    
IMPORTANT RULES:
- Only evaluate fields that are present in both reference and source
- This prevents unfair penalties when source databases have incomplete metadata

Scoring Guidelines for each field (0-100):
• Title: 100=identical, 90=very similar, 70=similar core meaning, 50=related, 0=completely different
• Authors: 100=all match exactly, 80=most surnames match, 60=some match, 40=few match, 0=none match
• Year: 100=exact match, 0=different (no partial scoring for year)
• DOI: 100=identical, 0=different (no partial scoring for DOI)
• ContainerTitle: 100=identical, 90=same journal different format, 70=abbreviated vs full name, 0=different
• Volume: 100=exact match, 0=different (no partial scoring)
• Issue: 100=exact match, 0=different (no partial scoring)
• Pages: 100=identical, 90=same range different format, 70=overlapping ranges, 0=different
• ArxivId: 100=identical, 0=different (no partial scoring for arXiv IDs)
• PMID: 100=identical, 0=different (no partial scoring for PubMed IDs)
• PMCID: 100=identical, 0=different (no partial scoring for PMC IDs)
• ISBN: 100=identical, 0=different (no partial scoring for ISBNs)
• ISSN: 100=identical, 0=different (no partial scoring for ISSNs)

${prompt}`

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
