import type {
  ExternalSource,
  Reference,
  VerificationResult,
  WebsiteVerificationResult,
} from '@source-taster/types'
import { AIServiceFactory } from './ai/aiServiceFactory'
import { CrossrefService } from './databases/crossrefService'
import { OpenAlexService } from './databases/openAlexService'
import { WebScrapingService } from './webScrapingService'

export class DatabaseVerificationService {
  private openAlex = new OpenAlexService()
  private crossref = new CrossrefService()
  private webScraper = new WebScrapingService()

  async verifyReferences(
    references: Reference[],
    databases: string[],
    verificationMethod: 'ai' | 'exact' | 'fuzzy',
    aiService?: 'openai' | 'gemini',
  ): Promise<VerificationResult[]> {
    const results: VerificationResult[] = []

    for (const reference of references) {
      const result = await this.verifyReference(
        reference,
        databases,
        verificationMethod,
        aiService,
      )
      results.push(result)
    }

    return results
  }

  private async verifyReference(
    reference: Reference,
    databases: string[],
    verificationMethod: 'ai' | 'exact' | 'fuzzy',
    aiService?: 'openai' | 'gemini',
  ): Promise<VerificationResult> {
    const sources: ExternalSource[] = []

    // Search in databases
    if (databases.includes('openalex')) {
      const openAlexResults = await this.openAlex.search(reference.metadata)
      sources.push(...openAlexResults)
    }

    if (databases.includes('crossref')) {
      const crossrefResults = await this.crossref.search(reference.metadata)
      sources.push(...crossrefResults)
    }

    // Find best match
    const bestMatch = this.findBestMatch(sources)

    if (!bestMatch) {
      return {
        referenceId: reference.id,
        isVerified: false,
        confidence: 0,
        verificationMethod,
        checkedDatabases: databases,
        discrepancies: ['No matching source found'],
      }
    }

    // Verify with AI if requested
    if (verificationMethod === 'ai' && aiService) {
      const aiVerification = await this.verifyWithAI(
        reference,
        bestMatch,
        aiService,
      )

      return {
        referenceId: reference.id,
        isVerified: aiVerification.confidence > 0.7,
        confidence: aiVerification.confidence,
        matchedSource: bestMatch,
        discrepancies: aiVerification.discrepancies,
        verificationMethod,
        checkedDatabases: databases,
      }
    }

    // Simple exact/fuzzy matching
    const confidence = this.calculateMatchConfidence(reference, bestMatch)

    return {
      referenceId: reference.id,
      isVerified: confidence > 0.8,
      confidence,
      matchedSource: bestMatch,
      verificationMethod,
      checkedDatabases: databases,
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

  private findBestMatch(sources: ExternalSource[]): ExternalSource | null {
    if (sources.length === 0)
      return null

    // Sort by confidence and return the best match
    return sources.sort((a, b) => b.confidence - a.confidence)[0]
  }

  private calculateMatchConfidence(reference: Reference, source: ExternalSource): number {
    // Simple matching algorithm - can be improved
    let score = 0
    let checks = 0

    if (reference.metadata.title && source.metadata.title) {
      const titleSimilarity = this.calculateStringSimilarity(
        reference.metadata.title,
        source.metadata.title,
      )
      score += titleSimilarity
      checks++
    }

    if (reference.metadata.doi && source.metadata.doi) {
      score += reference.metadata.doi === source.metadata.doi ? 1 : 0
      checks++
    }

    return checks > 0 ? score / checks : 0
  }

  private async verifyWithAI(
    reference: Reference,
    source: ExternalSource,
    aiService: 'openai' | 'gemini',
  ): Promise<{ confidence: number, discrepancies: string[] }> {
    const ai = AIServiceFactory.create(aiService)

    const prompt = `
Compare these two academic references and determine if they refer to the same work:

Reference 1 (Original):
${JSON.stringify(reference.metadata, null, 2)}

Reference 2 (Database):
${JSON.stringify(source.metadata, null, 2)}

Respond with JSON:
{
  "confidence": 0.0-1.0,
  "discrepancies": ["list of differences found"]
}
    `

    const response = await ai.generateText(prompt)

    try {
      return JSON.parse(response)
    }
    catch {
      return { confidence: 0, discrepancies: ['AI verification failed'] }
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
