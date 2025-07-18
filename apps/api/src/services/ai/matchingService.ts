import type { AIMatchingResponse, OpenAIConfig } from '@source-taster/types'
import { OpenAI } from 'openai'
import { matchingJsonSchema, MatchingResponseSchema } from './schemas/matching'

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

  async matchFields(prompt: string): Promise<AIMatchingResponse> {
    const systemMessage = `You are an expert bibliographic matching assistant. Your task is to provide field-by-field matching scores.
    
CRITICAL INSTRUCTIONS:
- ONLY evaluate the fields explicitly listed in "Available fields for matching" in the user prompt
- Do NOT evaluate any other fields, even if they exist in the data
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
• Publisher: 100=identical, 90=same publisher different format, 70=related publishers, 0=different
• URL: 100=identical, 90=same URL different protocol/format, 0=different
• SourceType: 100=identical, 0=different (no partial scoring)
• Conference: 100=identical, 90=same conference different format, 70=related conferences, 0=different
• Institution: 100=identical, 90=same institution different format, 70=related institutions, 0=different
• Edition: 100=identical, 0=different (no partial scoring)
• ArticleNumber: 100=identical, 0=different (no partial scoring)
• Subtitle: 100=identical, 90=very similar, 70=similar meaning, 50=related, 0=different`

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
          json_schema: matchingJsonSchema,
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

      // Validate response with Zod
      const validatedResponse = MatchingResponseSchema.parse(parsedResponse)

      return validatedResponse
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
}
