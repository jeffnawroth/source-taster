import type {
  ExternalSource,
  FieldMatchDetail,
  FieldWeights,
  MatchDetails,
  MatchingSettings,
  Reference,
} from '@source-taster/types'
import { AIServiceFactory } from './ai/aiServiceFactory'

export abstract class BaseMatchingService {
  constructor() {}

  /**
   * Get the fields that should be evaluated for matching
   * Only evaluate fields that are present in both reference and source AND have weight > 0
   * This prevents unfair penalties when source data is incomplete and avoids processing fields that don't contribute to the score
   */
  protected getAvailableFields(reference: Reference, source: ExternalSource, matchingSettings: MatchingSettings): string[] {
    const fields: string[] = []

    // Only evaluate fields that are present in both reference and source AND have weight > 0
    if (reference.metadata.title && source.metadata.title && (matchingSettings.matchingConfig.fieldWeights.title || 0) > 0) {
      fields.push('title')
    }
    if (reference.metadata.authors && reference.metadata.authors.length > 0
      && source.metadata.authors && source.metadata.authors.length > 0 && (matchingSettings.matchingConfig.fieldWeights.authors || 0) > 0) {
      fields.push('authors')
    }
    if (reference.metadata.date?.year && source.metadata.date?.year && (matchingSettings.matchingConfig.fieldWeights.year || 0) > 0)
      fields.push('year')

    // Identifier fields
    if (reference.metadata.identifiers?.doi && source.metadata.identifiers?.doi && (matchingSettings.matchingConfig.fieldWeights.doi || 0) > 0)
      fields.push('doi')
    if (reference.metadata.identifiers?.arxivId && source.metadata.identifiers?.arxivId && (matchingSettings.matchingConfig.fieldWeights.arxivId || 0) > 0)
      fields.push('arxivId')
    if (reference.metadata.identifiers?.pmid && source.metadata.identifiers?.pmid && (matchingSettings.matchingConfig.fieldWeights.pmid || 0) > 0)
      fields.push('pmid')
    if (reference.metadata.identifiers?.pmcid && source.metadata.identifiers?.pmcid && (matchingSettings.matchingConfig.fieldWeights.pmcid || 0) > 0)
      fields.push('pmcid')
    if (reference.metadata.identifiers?.isbn && source.metadata.identifiers?.isbn && (matchingSettings.matchingConfig.fieldWeights.isbn || 0) > 0)
      fields.push('isbn')
    if (reference.metadata.identifiers?.issn && source.metadata.identifiers?.issn && (matchingSettings.matchingConfig.fieldWeights.issn || 0) > 0)
      fields.push('issn')

    // Source fields
    if (reference.metadata.source?.containerTitle && source.metadata.source?.containerTitle && (matchingSettings.matchingConfig.fieldWeights.containerTitle || 0) > 0)
      fields.push('containerTitle')
    if (reference.metadata.source?.volume && source.metadata.source?.volume && (matchingSettings.matchingConfig.fieldWeights.volume || 0) > 0)
      fields.push('volume')
    if (reference.metadata.source?.issue && source.metadata.source?.issue && (matchingSettings.matchingConfig.fieldWeights.issue || 0) > 0)
      fields.push('issue')
    if (reference.metadata.source?.pages && source.metadata.source?.pages && (matchingSettings.matchingConfig.fieldWeights.pages || 0) > 0)
      fields.push('pages')
    if (reference.metadata.source?.publisher && source.metadata.source?.publisher && (matchingSettings.matchingConfig.fieldWeights.publisher || 0) > 0)
      fields.push('publisher')
    if (reference.metadata.source?.url && source.metadata.source?.url && (matchingSettings.matchingConfig.fieldWeights.url || 0) > 0)
      fields.push('url')
    if (reference.metadata.source?.sourceType && source.metadata.source?.sourceType && (matchingSettings.matchingConfig.fieldWeights.sourceType || 0) > 0)
      fields.push('sourceType')
    if (reference.metadata.source?.conference && source.metadata.source?.conference && (matchingSettings.matchingConfig.fieldWeights.conference || 0) > 0)
      fields.push('conference')
    if (reference.metadata.source?.institution && source.metadata.source?.institution && (matchingSettings.matchingConfig.fieldWeights.institution || 0) > 0)
      fields.push('institution')
    if (reference.metadata.source?.edition && source.metadata.source?.edition && (matchingSettings.matchingConfig.fieldWeights.edition || 0) > 0)
      fields.push('edition')
    if (reference.metadata.source?.articleNumber && source.metadata.source?.articleNumber && (matchingSettings.matchingConfig.fieldWeights.articleNumber || 0) > 0)
      fields.push('articleNumber')
    if (reference.metadata.source?.subtitle && source.metadata.source?.subtitle && (matchingSettings.matchingConfig.fieldWeights.subtitle || 0) > 0)
      fields.push('subtitle')

    return fields
  }

  /**
   * Match a reference against a source using AI
   * Matching settings must be provided by the caller
   */
  protected async matchWithAI(
    reference: Reference,
    source: ExternalSource,
    matchingSettings: MatchingSettings,
  ): Promise<{ details: MatchDetails }> {
    const ai = AIServiceFactory.createOpenAIService()

    // Get the fields that should be evaluated (only those with weight > 0)
    const availableFields = this.getAvailableFields(reference, source, matchingSettings)

    const prompt = `

Available fields for matching:
${availableFields.join(', ')}

Reference:
${JSON.stringify(reference.metadata, null, 2)}

Source:
${JSON.stringify(source.metadata, null, 2)}`

    const response = await ai.matchFields(prompt, matchingSettings)

    try {
      // Calculate the overall score directly from AI response
      const overallScore = this.calculateOverallScore(response.fieldDetails, matchingSettings.matchingConfig.fieldWeights)

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
  protected calculateOverallScore(fieldDetails: FieldMatchDetail[], fieldWeights: FieldWeights): number {
    if (fieldDetails.length === 0)
      return 0

    let totalWeightedScore = 0
    let totalWeight = 0

    for (const detail of fieldDetails) {
      const weight = fieldWeights[detail.field] || 0
      totalWeightedScore += detail.match_score * weight
      totalWeight += weight
    }

    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0
  }
}
