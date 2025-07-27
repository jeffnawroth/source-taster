import type {
  ExternalSource,
  FieldConfigurations,
  FieldMatchDetail,
  MatchDetails,
  MatchingSettings,
  Reference,
  ReferenceMetadataFields,
} from '@source-taster/types'
import { MetadataComparator } from '../utils/metadataComparator'
import { AIServiceFactory } from './ai/aiServiceFactory'

export abstract class BaseMatchingService {
  constructor() {}

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
    const availableFields = MetadataComparator.getAvailableFieldNames(reference.metadata, source.metadata, matchingSettings.matchingConfig.fieldConfigurations) as ReferenceMetadataFields[]

    const prompt = `

Reference:
${JSON.stringify(reference.metadata, null, 2)}

Source:
${JSON.stringify(source.metadata, null, 2)}`

    const response = await ai.matchFields(prompt, matchingSettings, availableFields)

    try {
      // Calculate the overall score directly from AI response
      const overallScore = this.calculateOverallScore(response.fieldDetails, matchingSettings.matchingConfig.fieldConfigurations)

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
  protected calculateOverallScore(fieldDetails: FieldMatchDetail[], fieldConfigurations: FieldConfigurations): number {
    if (fieldDetails.length === 0)
      return 0

    let totalWeightedScore = 0
    let totalWeight = 0

    for (const detail of fieldDetails) {
      const weight = fieldConfigurations[detail.field as keyof FieldConfigurations]?.weight || 0
      totalWeightedScore += detail.match_score * weight
      totalWeight += weight
    }

    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0
  }
}
