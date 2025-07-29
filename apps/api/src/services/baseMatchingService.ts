import type {
  APIMatchingSettings,
  ExternalSource,
  FieldConfigurations,
  FieldMatchDetail,
  MatchDetails,
  MatchingReference,
  ReferenceMetadataFields,
  UserAISettings,
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
    reference: MatchingReference,
    source: ExternalSource,
    matchingSettings: APIMatchingSettings,
    aiSettings: UserAISettings,
  ): Promise<{ details: MatchDetails }> {
    const ai = this.createAIService(aiSettings)

    // Get the fields that should be evaluated (only those with weight > 0)
    const availableFields = MetadataComparator.getAvailableFieldNames(reference.metadata, source.metadata, matchingSettings.matchingConfig.fieldConfigurations) as ReferenceMetadataFields[]

    // Create clean prompt for the AI
    const prompt = this.createMatchingPrompt(reference, source, availableFields)

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
   * Create AI service with user settings
   */
  private createAIService(userAISettings: UserAISettings) {
    if (!userAISettings?.apiKey) {
      throw new Error('API key required: Please provide your own OpenAI API key in the extension settings to use AI-powered features.')
    }

    return AIServiceFactory.createOpenAIService(userAISettings)
  }

  /**
   * Create a clean prompt for AI matching
   */
  private createMatchingPrompt(reference: MatchingReference, source: ExternalSource, availableFields: ReferenceMetadataFields[]): string {
    return `Available fields for matching:
${availableFields.join(', ')}

Reference:
${JSON.stringify(reference.metadata, null, 2)}

Source:
${JSON.stringify(source.metadata, null, 2)}

IMPORTANT: Return matching scores for ALL available fields that exist in both reference and source. Do not skip any fields from the list: ${availableFields.join(', ')}`
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
