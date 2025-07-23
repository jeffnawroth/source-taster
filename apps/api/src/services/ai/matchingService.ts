import type { AIMatchingResponse, MatchingSettings, OpenAIConfig } from '@source-taster/types'
import { MatchingToleranceMode } from '@source-taster/types'
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

  async matchFields(prompt: string, matchingSettings?: MatchingSettings): Promise<AIMatchingResponse> {
    const systemMessage = this.generateSystemMessage(matchingSettings?.toleranceSettings.mode || MatchingToleranceMode.BALANCED)

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

  /**
   * Generate system message based on matching mode
   */
  private generateSystemMessage(mode: MatchingToleranceMode): string {
    const baseInstructions = `You are an expert bibliographic matching assistant. Your task is to provide field-by-field matching scores.
    
CRITICAL INSTRUCTIONS:
- ONLY evaluate the fields explicitly listed in "Available fields for matching" in the user prompt
- Do NOT evaluate any other fields, even if they exist in the data
- Only evaluate fields that are present in both reference and source
- This prevents unfair penalties when source databases have incomplete metadata`

    switch (mode) {
      case MatchingToleranceMode.STRICT:
        return `${baseInstructions}

STRICT MATCHING MODE - Exact matches only:
• Every character, capitalization, and format must match precisely
• No tolerance for punctuation differences
• No tolerance for whitespace variations
• No tolerance for character normalization (umlauts, accents)
• Author names must match exact format (First Last vs Last, First = NO MATCH)
• Journal abbreviations vs full names = NO MATCH
• Page format variations (123-145 vs 123-45) = NO MATCH

Scoring Guidelines for each field (0 or 100 only):
• Title: 100=exactly identical including punctuation/case, 0=any difference
• Authors: 100=all names match exactly in same format, 0=any difference
• Year: 100=exact match, 0=different
• DOI: 100=identical, 0=different
• ContainerTitle: 100=exactly identical including case/punctuation, 0=any difference
• Volume/Issue/Pages: 100=exact match, 0=any difference
• All other fields: 100=exactly identical, 0=any difference`

      case MatchingToleranceMode.TOLERANT:
        return `${baseInstructions}

TOLERANT MATCHING MODE - Semantic matching allowed:
• Focus on semantic meaning over exact formatting
• Allow significant format and style variations
• Use fuzzy matching for text comparisons
• Be generous with scoring partial matches
• Allow for OCR errors and transcription mistakes

Scoring Guidelines for each field (0-100):
• Title: 100=same meaning, 90=very similar meaning, 80=similar core concepts, 70=related topics, 60=some overlap, 50=minimal similarity, 0=completely different
• Authors: 100=all authors semantically match, 85=most match with variations, 70=majority match, 55=some match, 40=few match, 25=minimal overlap, 0=no matches
• Year: 100=exact, 90=±1 year, 80=±2 years, 70=±3 years, 0=more than 3 years difference
• DOI: 100=identical, 0=different (no partial scoring for identifiers)
• ContainerTitle: 100=same journal, 95=abbreviation vs full name, 90=similar journals, 80=related publications, 70=same field, 0=different
• Volume/Issue: 100=exact, 90=off by 1, 80=off by 2, 0=more than 2 different
• Pages: 100=exact range, 95=overlapping ranges, 90=adjacent ranges, 85=same article different format, 0=no overlap
• All identifiers (PMID, ISBN, etc.): 100=identical, 0=different
• Publisher: 100=identical, 95=same publisher different format, 85=subsidiary/parent company, 75=related publishers, 0=different
• Conference/Institution: Similar semantic matching as above`

      case MatchingToleranceMode.BALANCED:
      default:
        return `${baseInstructions}

BALANCED MATCHING MODE - Case-insensitive with format flexibility:
• Allow case differences (Title vs title vs TITLE)
• Allow minor punctuation differences (commas, periods, hyphens)
• Allow whitespace variations and character normalization
• Allow common format variations (author names, journal abbreviations, page formats)
• Balance between precision and recall

Scoring Guidelines for each field (0-100):
• Title: 100=identical meaning, 90=very similar, 70=similar core meaning, 50=related, 30=some overlap, 0=completely different
• Authors: 100=all match (allowing format variations), 80=most surnames match, 60=some match, 40=few match, 20=minimal overlap, 0=none match
• Year: 100=exact match, 0=different (no partial scoring for year)
• DOI: 100=identical, 0=different (no partial scoring for DOI)
• ContainerTitle: 100=identical meaning, 90=same journal different format, 70=abbreviated vs full name, 50=similar journals, 0=different
• Volume: 100=exact match, 0=different (no partial scoring)
• Issue: 100=exact match, 0=different (no partial scoring)
• Pages: 100=identical, 90=same range different format (123-145 vs 123-45), 70=overlapping ranges, 0=different
• ArxivId/PMID/PMCID/ISBN/ISSN: 100=identical, 0=different (no partial scoring for identifiers)
• Publisher: 100=identical, 90=same publisher different format, 70=related publishers, 0=different
• URL: 100=identical, 90=same URL different protocol/format, 0=different
• SourceType: 100=identical, 0=different (no partial scoring)
• Conference: 100=identical, 90=same conference different format, 70=related conferences, 0=different
• Institution: 100=identical, 90=same institution different format, 70=related institutions, 0=different
• Edition: 100=identical, 0=different (no partial scoring)
• ArticleNumber: 100=identical, 0=different (no partial scoring)
• Subtitle: 100=identical, 90=very similar, 70=similar meaning, 50=related, 0=different`
    }
  }
}
