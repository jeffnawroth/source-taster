import type {
  ExternalSource,
  Reference,
  VerificationResult,
} from '@source-taster/types'
import { AIServiceFactory } from './ai/aiServiceFactory'
import { CrossrefService } from './databases/crossrefService'
import { EuropePmcService } from './databases/europePmcService'
import { OpenAlexService } from './databases/openAlexService'

export class DatabaseVerificationService {
  private openAlex = new OpenAlexService()
  private crossref = new CrossrefService()
  private europePmc = new EuropePmcService()

  async verifyReferences(
    references: Reference[],
    aiService?: 'openai' | 'gemini',
  ): Promise<VerificationResult[]> {
    const results: VerificationResult[] = []

    for (const reference of references) {
      const result = await this.verifyReference(
        reference,
        aiService,
      )
      results.push(result)
    }

    return results
  }

  private async verifyReference(
    reference: Reference,
    aiService?: 'openai' | 'gemini',
  ): Promise<VerificationResult> {
    // Search in all databases in parallel for better performance
    const [openAlexResult, crossrefResult, europePmcResult] = await Promise.allSettled([
      this.openAlex.search(reference.metadata),
      this.crossref.search(reference.metadata),
      this.europePmc.search(reference.metadata),
    ])

    // Extract successful results
    const sources: ExternalSource[] = []

    if (openAlexResult.status === 'fulfilled' && openAlexResult.value) {
      sources.push(openAlexResult.value)
    }

    if (crossrefResult.status === 'fulfilled' && crossrefResult.value) {
      sources.push(crossrefResult.value)
    }

    if (europePmcResult.status === 'fulfilled' && europePmcResult.value) {
      sources.push(europePmcResult.value)
    }

    // If no sources found, return unverified
    if (sources.length === 0) {
      return {
        referenceId: reference.id,
        isVerified: false,
      }
    }

    // Verify with AI using the best available sources
    if (!aiService) {
      throw new Error('AI service is required for verification')
    }

    // Try to verify against each source until we find a match
    for (const source of sources) {
      const isVerified = await this.verifyWithAI(reference, source, aiService)

      if (isVerified) {
        return {
          referenceId: reference.id,
          isVerified: true,
          matchedSource: source,
        }
      }
    }

    // If no source matched, return the best source anyway for reference
    return {
      referenceId: reference.id,
      isVerified: false,
      matchedSource: sources[0], // Use the first (presumably best) source
    }
  }

  private async verifyWithAI(
    reference: Reference,
    source: ExternalSource,
    aiService: 'openai' | 'gemini',
  ): Promise<boolean> {
    const ai = AIServiceFactory.create(aiService)

    const prompt = `You are a system that compares two objects to determine whether they refer to the same scholarly work. You will receive two inputs:
1. reference: Metadata extracted from a free-form reference string. This data may be incomplete or slightly inaccurate.
2. source: Structured object, containing authoritative bibliographic information.

Your task is to assess whether the Source describes the same publication as Reference.

Follow these steps:
• Title Comparison: Compare Reference.title with source.title. Use a tolerant matching strategy that accounts for minor formatting differences, punctuation, and capitalization.
• Author Comparison: Compare Reference.authors with source.authors (array of author names). Focus on matching surnames, allowing for slight variations or order differences.
• Year Comparison: Compare Reference.year with source.year strictly: they must match exactly.
• DOI: If both Reference.doi and source.doi are present, compare them directly (they should be identical for a perfect match).
• Journal Comparison: Compare Reference.journal with source.journal, if available.
• Volume, Issue, Pages: Compare Reference.volume, Reference.issue, Reference.pages with source.volume, source.issue, source.pages, if present.

Be tolerant of minor mismatches but look for strong agreement across multiple fields. A strong match is sufficient.

At the end of your analysis, return a clear evaluation in the following format:
{
  "isMatch": true/false
}

Reference:
${JSON.stringify(reference.metadata, null, 2)}

Source:
${JSON.stringify(source.metadata, null, 2)}`

    const response = await ai.verifyMatch(prompt)

    try {
      const result = JSON.parse(response)
      return result.isMatch === true
    }
    catch {
      return false
    }
  }
}
