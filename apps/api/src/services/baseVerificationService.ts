import type {
  ExternalSource,
  FieldMatchDetail,
  FieldWeights,
  MatchDetails,
  Reference,
} from '@source-taster/types'
import type { AIFieldMatchDetail } from '../types/verification'
import { AIServiceFactory } from './ai/aiServiceFactory'

export abstract class BaseVerificationService {
  constructor() {

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
   * Field weights must be provided by the frontend
   */
  protected getFieldWeightsForAvailableFields(
    availableFields: string[],
    fieldWeights: FieldWeights,
  ): Record<string, number> {
    const weights: Record<string, number> = {}

    for (const field of availableFields) {
      const weight = fieldWeights[field as keyof FieldWeights]
      if (typeof weight === 'number') {
        weights[field] = weight
      }
    }

    return weights
  }

  /**
   * Verify a reference against a source using AI
   * Field weights must be provided by the caller
   */
  protected async verifyWithAI(
    reference: Reference,
    source: ExternalSource,
    fieldWeights: FieldWeights,
  ): Promise<{ details: MatchDetails }> {
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
      // Use provided field weights
      const weights = this.getFieldWeightsForAvailableFields(availableFields, fieldWeights)

      // Response has fieldDetails array with { field, match_score } objects
      const fieldDetails: FieldMatchDetail[] = response.fieldDetails.map((detail: AIFieldMatchDetail) => ({
        field: detail.field,
        match_score: detail.match_score,
        weight: weights[detail.field] || 0,
      }))

      // Calculate the overall score ourselves
      const overallScore = this.calculateOverallScore(fieldDetails)

      // Create match details from AI response with our calculated score
      const aiMatchDetails: MatchDetails = {
        overallScore,
        fieldDetails,
      }

      return {
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
