import type {
  ExternalSource,
  MatchDetails,
  Reference,
  SourceEvaluation,
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
        verificationDetails: {
          sourcesFound: [],
        },
      }
    }

    // Verify with AI using the best available sources
    if (!aiService) {
      throw new Error('AI service is required for verification')
    }

    // Evaluate all sources and find the best one based on AI scoring
    const sourceEvaluations: SourceEvaluation[] = []

    // Evaluate each source with AI
    for (const source of sources) {
      const matchResult = await this.verifyWithAI(reference, source, aiService)
      sourceEvaluations.push({
        source,
        matchDetails: matchResult.details,
        isMatch: matchResult.isMatch,
      })
    }

    // Sort by overall score (highest first)
    sourceEvaluations.sort((a, b) => b.matchDetails.overallScore - a.matchDetails.overallScore)

    // Check if the best source is verified (has a high enough score for verification)
    const bestEvaluation = sourceEvaluations[0]

    if (bestEvaluation.isMatch) {
      return {
        referenceId: reference.id,
        isVerified: true,
        matchedSource: bestEvaluation.source,
        verificationDetails: {
          sourcesFound: sources,
          matchDetails: bestEvaluation.matchDetails,
          allSourceEvaluations: sourceEvaluations,
        },
      }
    }

    // If no source matched sufficiently, return the best scoring one anyway
    return {
      referenceId: reference.id,
      isVerified: false,
      matchedSource: bestEvaluation.source, // Now truly the best source based on score
      verificationDetails: {
        sourcesFound: sources,
        matchDetails: bestEvaluation.matchDetails,
        allSourceEvaluations: sourceEvaluations,
      },
    }
  }

  private async verifyWithAI(
    reference: Reference,
    source: ExternalSource,
    aiService: 'openai' | 'gemini',
  ): Promise<{ isMatch: boolean, details: MatchDetails }> {
    const ai = AIServiceFactory.create(aiService)

    const prompt = `You are a system that compares two objects to determine whether they refer to the same scholarly work. You will receive two inputs:
1. reference: Metadata extracted from a free-form reference string. This data may be incomplete or slightly inaccurate.
2. source: Structured object, containing authoritative bibliographic information.

Your task is to assess whether the Source describes the same publication as Reference and provide detailed match information.

Compare each field systematically:
• Title: Use tolerant matching for formatting differences, punctuation, and capitalization
• Authors: Focus on surname matching, allow for variations and order differences
• Year: Must match exactly if both are present
• DOI: Must be identical if both are present
• Journal: Use tolerant matching for abbreviations and formatting

Return your analysis in this JSON format:
{
  "isMatch": true/false,
  "titleMatch": true/false,
  "authorsMatch": true/false,
  "yearMatch": true/false,
  "doiMatch": true/false,
  "journalMatch": true/false,
  "overallScore": 0-100
}

Reference:
${JSON.stringify(reference.metadata, null, 2)}

Source:
${JSON.stringify(source.metadata, null, 2)}`

    const response = await ai.verifyMatch(prompt)

    try {
      const result = JSON.parse(response)
      return {
        isMatch: result.isMatch === true,
        details: {
          titleMatch: result.titleMatch || false,
          authorsMatch: result.authorsMatch || false,
          yearMatch: result.yearMatch || false,
          doiMatch: result.doiMatch || false,
          journalMatch: result.journalMatch || false,
          overallScore: result.overallScore || 0,
        },
      }
    }
    catch {
      return {
        isMatch: false,
        details: {
          titleMatch: false,
          authorsMatch: false,
          yearMatch: false,
          doiMatch: false,
          journalMatch: false,
          overallScore: 0,
        },
      }
    }
  }
}
