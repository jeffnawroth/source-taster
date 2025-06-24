import type {
  ExternalSource,
  Reference,
  VerificationResult,
  WebsiteVerificationResult,
} from '@source-taster/types'
import { AIServiceFactory } from './ai/aiServiceFactory'
import { CrossrefService } from './databases/crossrefService'
import { EuropePmcService } from './databases/europePmcService'
import { OpenAlexService } from './databases/openAlexService'
import { WebScrapingService } from './webScrapingService'

export class DatabaseVerificationService {
  private openAlex = new OpenAlexService()
  private crossref = new CrossrefService()
  private europePmc = new EuropePmcService()
  private webScraper = new WebScrapingService()

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

  async verifyWebsiteReferences(
    references: Reference[],
    aiService?: 'openai' | 'gemini',
  ): Promise<WebsiteVerificationResult[]> {
    const results: WebsiteVerificationResult[] = []

    for (const reference of references) {
      if (reference.metadata.url) {
        const result = await this.verifyWebsite(reference, aiService)
        results.push(result)
      }
    }

    return results
  }

  private async verifyWebsite(
    reference: Reference,
    _aiService?: 'openai' | 'gemini',
  ): Promise<WebsiteVerificationResult> {
    const url = reference.metadata.url!

    try {
      const scrapedData = await this.webScraper.scrapeMetadata(url)

      if (!scrapedData.isAccessible) {
        return {
          referenceId: reference.id,
          url,
          isAccessible: false,
          statusCode: scrapedData.statusCode,
          issues: ['Website not accessible'],
        }
      }

      const contentMatch = this.compareMetadata(
        reference.metadata,
        scrapedData.metadata,
      )

      return {
        referenceId: reference.id,
        url,
        isAccessible: true,
        statusCode: scrapedData.statusCode,
        extractedMetadata: scrapedData.metadata,
        contentMatch,
      }
    }
    catch (error) {
      return {
        referenceId: reference.id,
        url,
        isAccessible: false,
        issues: [error instanceof Error ? error.message : 'Unknown error'],
      }
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
• Year Comparison:
  – If Reference.url is not present (i.e., a normal citation), compare Reference.year with source.year strictly: they must match exactly.
  – If Reference.url is present (i.e., a webpage/PDF fallback), be more lenient:
    • If title and authors match strongly, allow a year mismatch (even if off by 1–2 years or one is null).
    • Only penalize the year if title/authors are weak matches.
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

  private calculateStringSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein distance implementation
    const matrix = Array.from({ length: str2.length + 1 }, () =>
      Array.from({ length: str1.length + 1 }, () => 0))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost,
        )
      }
    }

    const maxLength = Math.max(str1.length, str2.length)
    return maxLength === 0 ? 1 : 1 - matrix[str2.length][str1.length] / maxLength
  }

  private compareMetadata(original: any, scraped: any) {
    const titleMatch = original.title && scraped.title
      ? this.calculateStringSimilarity(original.title, scraped.title)
      : 0

    const authorMatch = original.authors && scraped.authors
      ? this.calculateArraySimilarity(original.authors, scraped.authors)
      : 0

    return {
      titleMatch,
      authorMatch,
      overallMatch: (titleMatch + authorMatch) / 2,
    }
  }

  private calculateArraySimilarity(arr1: string[], arr2: string[]): number {
    if (arr1.length === 0 && arr2.length === 0)
      return 1
    if (arr1.length === 0 || arr2.length === 0)
      return 0

    let matches = 0
    for (const item1 of arr1) {
      for (const item2 of arr2) {
        if (this.calculateStringSimilarity(item1, item2) > 0.8) {
          matches++
          break
        }
      }
    }

    return matches / Math.max(arr1.length, arr2.length)
  }
}
