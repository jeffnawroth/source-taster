import type {
  AIFieldMatchDetail,
  ExternalSource,
  FieldWeights,
  MatchDetails,
  Reference,
} from '@source-taster/types'
import { AIServiceFactory } from './ai/aiServiceFactory'

export abstract class BaseVerificationService {
  constructor() {

  }

  /**
   * Get the fields that should be evaluated for matching
   * Only evaluate fields that are present in both reference and source AND have weight > 0
   * This prevents unfair penalties when source data is incomplete and avoids processing fields that don't contribute to the score
   */
  protected getAvailableFields(reference: Reference, source: ExternalSource, fieldWeights: FieldWeights): string[] {
    const fields: string[] = []

    // Only evaluate fields that are present in both reference and source AND have weight > 0
    if (reference.metadata.title && source.metadata.title && (fieldWeights.title || 0) > 0) {
      fields.push('title')
    }
    if (reference.metadata.authors && reference.metadata.authors.length > 0
      && source.metadata.authors && source.metadata.authors.length > 0 && (fieldWeights.authors || 0) > 0) {
      fields.push('authors')
    }
    if (reference.metadata.date.year && source.metadata.date.year && (fieldWeights.year || 0) > 0)
      fields.push('year')

    // Identifier fields
    if (reference.metadata.identifiers?.doi && source.metadata.identifiers?.doi && (fieldWeights.doi || 0) > 0)
      fields.push('doi')
    if (reference.metadata.identifiers?.arxivId && source.metadata.identifiers?.arxivId && (fieldWeights.arxivId || 0) > 0)
      fields.push('arxivId')
    if (reference.metadata.identifiers?.pmid && source.metadata.identifiers?.pmid && (fieldWeights.pmid || 0) > 0)
      fields.push('pmid')
    if (reference.metadata.identifiers?.pmcid && source.metadata.identifiers?.pmcid && (fieldWeights.pmcid || 0) > 0)
      fields.push('pmcid')
    if (reference.metadata.identifiers?.isbn && source.metadata.identifiers?.isbn && (fieldWeights.isbn || 0) > 0)
      fields.push('isbn')
    if (reference.metadata.identifiers?.issn && source.metadata.identifiers?.issn && (fieldWeights.issn || 0) > 0)
      fields.push('issn')

    // Source fields
    if (reference.metadata.source.containerTitle && source.metadata.source.containerTitle && (fieldWeights.containerTitle || 0) > 0)
      fields.push('containerTitle')
    if (reference.metadata.source.volume && source.metadata.source.volume && (fieldWeights.volume || 0) > 0)
      fields.push('volume')
    if (reference.metadata.source.issue && source.metadata.source.issue && (fieldWeights.issue || 0) > 0)
      fields.push('issue')
    if (reference.metadata.source.pages && source.metadata.source.pages && (fieldWeights.pages || 0) > 0)
      fields.push('pages')
    if (reference.metadata.source.publisher && source.metadata.source.publisher && (fieldWeights.publisher || 0) > 0)
      fields.push('publisher')
    if (reference.metadata.source.url && source.metadata.source.url && (fieldWeights.url || 0) > 0)
      fields.push('url')
    if (reference.metadata.source.sourceType && source.metadata.source.sourceType && (fieldWeights.sourceType || 0) > 0)
      fields.push('sourceType')
    if (reference.metadata.source.conference && source.metadata.source.conference && (fieldWeights.conference || 0) > 0)
      fields.push('conference')
    if (reference.metadata.source.institution && source.metadata.source.institution && (fieldWeights.institution || 0) > 0)
      fields.push('institution')
    if (reference.metadata.source.edition && source.metadata.source.edition && (fieldWeights.edition || 0) > 0)
      fields.push('edition')
    if (reference.metadata.source.articleNumber && source.metadata.source.articleNumber && (fieldWeights.articleNumber || 0) > 0)
      fields.push('articleNumber')
    if (reference.metadata.source.subtitle && source.metadata.source.subtitle && (fieldWeights.subtitle || 0) > 0)
      fields.push('subtitle')

    return fields
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

    // Get the fields that should be evaluated (only those with weight > 0)
    const availableFields = this.getAvailableFields(reference, source, fieldWeights)

    const prompt = `

Available fields for verification:
${availableFields.join(', ')}

Reference:
${JSON.stringify(reference.metadata, null, 2)}

Source:
${JSON.stringify(source.metadata, null, 2)}`

    const response = await ai.verifyMatch(prompt)

    try {
      // Calculate the overall score directly from AI response
      const overallScore = this.calculateOverallScore(response.fieldDetails, fieldWeights)

      // Create match details from AI response with our calculated score
      const aiMatchDetails: MatchDetails = {
        overallScore,
        fieldDetails: response.fieldDetails,
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
   * Calculate the overall weighted score from AI field details
   */
  protected calculateOverallScore(fieldDetails: AIFieldMatchDetail[], fieldWeights: FieldWeights): number {
    if (fieldDetails.length === 0)
      return 0

    let totalWeightedScore = 0
    let totalWeight = 0

    for (const detail of fieldDetails) {
      const weight = fieldWeights[detail.field as keyof FieldWeights] || 0
      totalWeightedScore += detail.match_score * weight
      totalWeight += weight
    }

    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0
  }
}
