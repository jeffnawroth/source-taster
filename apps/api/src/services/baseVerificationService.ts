import type {
  ExternalSource,
  FieldMatchDetail,
  MatchDetails,
  Reference,
} from '@source-taster/types'
import type { AIFieldMatchDetail, FieldWeights } from '../types/verification'
import { AIServiceFactory } from './ai/aiServiceFactory'

export abstract class BaseVerificationService {
  // Default field weights - title and authors are most important
  protected readonly defaultFieldWeights: FieldWeights

  constructor(fieldWeights?: FieldWeights) {
    this.defaultFieldWeights = fieldWeights || {
      title: 30, // Most important - 30%
      authors: 25, // Very important - 25%
      year: 8, // Moderately important - 8%
      doi: 12, // Important when available - 12%
      containerTitle: 10, // Moderately important - 10%
      volume: 2, // Less important - 2%
      issue: 1, // Less important - 1%
      pages: 2, // Less important - 2%
      arxivId: 8, // Important for preprints - 8%
      pmid: 6, // Important for medical literature - 6%
      pmcid: 6, // Important for medical literature - 6%
      isbn: 4, // Important for books - 4%
      issn: 3, // Important for journals - 3%
    }
  }

  /**
   * Get the fields that should be evaluated for matching
   * Only evaluate fields that are present in both reference and source
   * This prevents unfair penalties when source data is incomplete
   */
  protected getAvailableFields(reference: Reference, source: ExternalSource): string[] {
    const fields: string[] = []

    // Only evaluate fields that are present in both reference and source
    if (reference.metadata.title && source.metadata.title) {
      fields.push('title')
    }
    if (reference.metadata.authors && reference.metadata.authors.length > 0
      && source.metadata.authors && source.metadata.authors.length > 0) {
      fields.push('authors')
    }
    if (reference.metadata.date.year && source.metadata.date.year)
      fields.push('year')

    // Identifier fields
    if (reference.metadata.identifiers?.doi && source.metadata.identifiers?.doi)
      fields.push('doi')
    if (reference.metadata.identifiers?.arxivId && source.metadata.identifiers?.arxivId)
      fields.push('arxivId')
    if (reference.metadata.identifiers?.pmid && source.metadata.identifiers?.pmid)
      fields.push('pmid')
    if (reference.metadata.identifiers?.pmcid && source.metadata.identifiers?.pmcid)
      fields.push('pmcid')
    if (reference.metadata.identifiers?.isbn && source.metadata.identifiers?.isbn)
      fields.push('isbn')
    if (reference.metadata.identifiers?.issn && source.metadata.identifiers?.issn)
      fields.push('issn')

    // Source fields
    if (reference.metadata.source.containerTitle && source.metadata.source.containerTitle)
      fields.push('containerTitle')
    if (reference.metadata.source.volume && source.metadata.source.volume)
      fields.push('volume')
    if (reference.metadata.source.issue && source.metadata.source.issue)
      fields.push('issue')
    if (reference.metadata.source.pages && source.metadata.source.pages)
      fields.push('pages')

    return fields
  }

  /**
   * Get field weights for all fields that should be evaluated
   * This includes core fields from reference even if missing in source
   */
  protected getFieldWeightsForAvailableFields(availableFields: string[]): Record<string, number> {
    const weights: Record<string, number> = {}

    for (const field of availableFields) {
      const weight = this.defaultFieldWeights[field as keyof FieldWeights]
      if (typeof weight === 'number') {
        weights[field] = weight
      }
    }

    return weights
  }

  /**
   * Verify a reference against a source using AI
   */
  protected async verifyWithAI(
    reference: Reference,
    source: ExternalSource,
  ): Promise<{ isMatch: boolean, details: MatchDetails }> {
    const ai = AIServiceFactory.createOpenAIService()

    // Get the fields that should be evaluated
    const availableFields = this.getAvailableFields(reference, source)

    const prompt = `

Available fields for verification:
${availableFields.join(', ')}

Reference:
${JSON.stringify(reference.metadata, null, 2)}

Source:
${JSON.stringify(source.metadata, null, 2)}`

    const response = await ai.verifyMatch(prompt)

    try {
      // Get field weights for the fields that were actually evaluated
      const fieldWeights = this.getFieldWeightsForAvailableFields(availableFields)

      // Response has fieldDetails array with { field, match_score } objects
      const fieldDetails: FieldMatchDetail[] = response.fieldDetails.map((detail: AIFieldMatchDetail) => ({
        field: detail.field,
        match_score: detail.match_score,
        weight: fieldWeights[detail.field] || 0,
      }))

      // Calculate the overall score ourselves
      const overallScore = this.calculateOverallScore(fieldDetails)

      // Create match details from AI response with our calculated score
      const aiMatchDetails: MatchDetails = {
        overallScore,
        fieldDetails,
      }

      // Use overall score for determining match (can be adjusted with thresholds later)
      const isMatch = overallScore >= 75 // Default threshold for now

      return {
        isMatch,
        details: aiMatchDetails,
      }
    }
    catch {
      // Fallback if AI response parsing fails
      const fallbackMatchDetails: MatchDetails = {
        overallScore: 0,
        fieldDetails: [],
      }

      return {
        isMatch: false,
        details: fallbackMatchDetails,
      }
    }
  }

  /**
   * Calculate the overall weighted score from field details
   */
  protected calculateOverallScore(fieldDetails: FieldMatchDetail[]): number {
    if (fieldDetails.length === 0)
      return 0

    let totalWeightedScore = 0
    let totalWeight = 0

    for (const detail of fieldDetails) {
      totalWeightedScore += detail.match_score * detail.weight
      totalWeight += detail.weight
    }

    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0
  }
}
