import type { AIExtractionResponse, ExtractionSettings, OpenAIConfig } from '@source-taster/types'
import { OpenAI } from 'openai'
import { getExtractionInstructions } from './extractionInstructions'
import { createDynamicExtractionSchema } from './schemas/reference'

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

  async extractReferences(text: string, extractionSettings: ExtractionSettings): Promise<AIExtractionResponse> {
    let systemMessage = `You are an expert bibliographic reference extraction assistant. Your task is to identify and parse academic references from text. 
    When you extract references, you MUST track every change you make in the "processingResults" array.`

    // Add extraction mode instructions
    const modeInstructions = getExtractionInstructions(extractionSettings.processingStrategy)
    systemMessage += `\n\n${modeInstructions}`

    const userMessage = `Extract all bibliographic references from the following text. Return structured data according to the schema:

${text}`

    // Use dynamic schema based on extraction settings
    const schema = createDynamicExtractionSchema(extractionSettings)

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
          json_schema: schema,
        },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content in OpenAI response')
      }

      let parsedResponse: AIExtractionResponse
      try {
        parsedResponse = JSON.parse(content)
      }
      catch {
        console.error('Failed to parse OpenAI response as JSON:', content)
        throw new Error('Invalid JSON response from OpenAI')
      }

      // Transform the response to match the expected structure
      const transformedResponse: AIExtractionResponse = {
        references: parsedResponse.references?.map((ref: any) => ({
          originalText: ref.originalText,
          metadata: {
            title: ref.metadata?.title,
            authors: ref.metadata?.authors,
            date: ref.metadata?.date || {},
            source: ref.metadata?.source || {},
            identifiers: ref.metadata?.identifiers,
          },
          processingResults: ref.processingResults || [],
        })) || [],
      }

      return transformedResponse
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
}
