import type {
  ExternalSource,
  FieldWeights,
  MatchDetails,
  Reference,
  SourceEvaluation,
  VerificationResult,
} from '@source-taster/types'
import process from 'node:process'
import { AIServiceFactory } from './ai/aiServiceFactory'
import { ArxivService } from './databases/arxivService'
import { CrossrefService } from './databases/crossrefService'
import { EuropePmcService } from './databases/europePmcService'
import { OpenAlexService } from './databases/openAlexService'
import { SemanticScholarService } from './databases/semanticScholarService'

export class DatabaseVerificationService {
  private openAlex = new OpenAlexService()
  private crossref = new CrossrefService()
  private europePmc = new EuropePmcService()
  private semanticScholar = new SemanticScholarService(process.env.SEMANTIC_SCHOLAR_API_KEY)
  private arxiv = new ArxivService()

  // Default field weights - title and authors are most important
  private readonly defaultFieldWeights: FieldWeights = {
    title: 35, // Most important - 35%
    authors: 25, // Very important - 25%
    year: 10, // Moderately important - 10%
    doi: 15, // Important when available - 15%
    journal: 10, // Moderately important - 10%
    volume: 2, // Less important - 2%
    issue: 1, // Less important - 1%
    pages: 2, // Less important - 2%
  }

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
    const [openAlexResult, crossrefResult, europePmcResult, semanticScholarResult, arxivResult] = await Promise.allSettled([
      this.openAlex.search(reference.metadata),
      this.crossref.search(reference.metadata),
      this.europePmc.search(reference.metadata),
      this.semanticScholar.search(reference.metadata),
      this.arxiv.search(reference.metadata),
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

    if (semanticScholarResult.status === 'fulfilled' && semanticScholarResult.value) {
      sources.push(semanticScholarResult.value)
    }

    if (arxivResult.status === 'fulfilled' && arxivResult.value) {
      sources.push(arxivResult.value)
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

  /**
   * Get the fields that are actually present in the reference
   */
  private getAvailableFields(reference: Reference): string[] {
    const fields: string[] = []

    if (reference.metadata.title)
      fields.push('title')
    if (reference.metadata.authors && reference.metadata.authors.length > 0)
      fields.push('authors')
    if (reference.metadata.year)
      fields.push('year')
    if (reference.metadata.doi)
      fields.push('doi')
    if (reference.metadata.journal)
      fields.push('journal')
    if (reference.metadata.volume)
      fields.push('volume')
    if (reference.metadata.issue)
      fields.push('issue')
    if (reference.metadata.pages)
      fields.push('pages')

    return fields
  }

  /**
   * Get field weights only for fields that are present in the reference
   */
  private getFieldWeightsForReference(reference: Reference): Record<string, number> {
    const weights: Record<string, number> = {}

    if (reference.metadata.title)
      weights.title = this.defaultFieldWeights.title
    if (reference.metadata.authors && reference.metadata.authors.length > 0)
      weights.authors = this.defaultFieldWeights.authors
    if (reference.metadata.year)
      weights.year = this.defaultFieldWeights.year
    if (reference.metadata.doi)
      weights.doi = this.defaultFieldWeights.doi
    if (reference.metadata.journal)
      weights.journal = this.defaultFieldWeights.journal
    if (reference.metadata.volume)
      weights.volume = this.defaultFieldWeights.volume
    if (reference.metadata.issue)
      weights.issue = this.defaultFieldWeights.issue
    if (reference.metadata.pages)
      weights.pages = this.defaultFieldWeights.pages

    return weights
  }

  private async verifyWithAI(
    reference: Reference,
    source: ExternalSource,
    aiService: 'openai' | 'gemini',
  ): Promise<{ isMatch: boolean, details: MatchDetails }> {
    const ai = AIServiceFactory.create(aiService)

    // Get the fields that are actually present in the reference
    const availableFields = this.getAvailableFields(reference)
    const fieldWeights = this.getFieldWeightsForReference(reference)

    const prompt = `You are a system that compares two objects to determine whether they refer to the same scholarly work. You will receive two inputs:
1. reference: Metadata extracted from a free-form reference string. This data may be incomplete or slightly inaccurate.
2. source: Structured object, containing authoritative bibliographic information.

Your task is to assess whether the Source describes the same publication as Reference and provide detailed match information with precise scoring.

IMPORTANT: Only evaluate fields that are present in the reference. For each field, provide a match_score (0-100) based on similarity.

Field Weights (only for fields present in reference):
${Object.entries(fieldWeights).map(([field, weight]) => `• ${field}: ${weight}%`).join('\n')}

Available fields to evaluate: ${availableFields.join(', ')}

Scoring Guidelines for each field (0-100):
• Title: 100=identical, 90=very similar, 70=similar core meaning, 50=related, 0=completely different
• Authors: 100=all match exactly, 80=most surnames match, 60=some match, 40=few match, 0=none match
• Year: 100=exact match, 0=different (no partial scoring for year)
• DOI: 100=identical, 0=different (no partial scoring for DOI)
• Journal: 100=identical, 90=same journal different format, 70=abbreviated vs full name, 0=different
• Volume: 100=exact match, 0=different (no partial scoring)
• Issue: 100=exact match, 0=different (no partial scoring)
• Pages: 100=identical, 90=same range different format, 70=overlapping ranges, 0=different

Calculate the final weighted score as:
Score = Σ(field_match_score * field_weight) / Σ(field_weights_for_available_fields)

Return your analysis in this JSON format:
{
  "isMatch": true/false,
  "overallScore": 0-100,
  "fieldsEvaluated": ["field1", "field2", ...],
  "fieldDetails": [
    {
      "field": "title",
      "reference_value": "...",
      "source_value": "...",
      "match_score": 0-100,
      "weight": 35
    }
  ]
}

Reference:
${JSON.stringify(reference.metadata, null, 2)}

Source:
${JSON.stringify(source.metadata, null, 2)}`

    const response = await ai.verifyMatch(prompt)

    try {
      const result = JSON.parse(response)

      // Create match details from AI response (AI calculates the weighted score as overallScore)
      const aiMatchDetails: MatchDetails = {
        overallScore: result.overallScore || 0,
        fieldsEvaluated: result.fieldsEvaluated || [],
        fieldDetails: result.fieldDetails || [],
      }

      // Use overall score for determining match (can be adjusted with thresholds later)
      const isMatch = aiMatchDetails.overallScore >= 75 // Default threshold for now

      return {
        isMatch,
        details: aiMatchDetails,
      }
    }
    catch {
      // Fallback if AI response parsing fails
      const fallbackMatchDetails: MatchDetails = {
        overallScore: 0,
        fieldsEvaluated: [],
        fieldDetails: [],
      }

      return {
        isMatch: false,
        details: fallbackMatchDetails,
      }
    }
  }
}
