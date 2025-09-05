import type {
  APIMatchingSettings,
  CSLItem,
  ExternalSource,
  FieldConfigurations,
  FieldMatchDetail,
  MatchDetails,
  MatchingReference,
  NormalizationRule,
} from '@source-taster/types'
import { MetadataComparator } from '../utils/metadataComparator'
import { similarity } from '../utils/similarity'

export class DeterministicMatchingService {
  /**
   * Matches a reference against an external source using deterministic similarity algorithms
   */
  matchReference(
    reference: MatchingReference,
    source: ExternalSource,
    matchingSettings: APIMatchingSettings,
  ): MatchDetails {
    const fieldConfigurations = matchingSettings.matchingConfig.fieldConfigurations
    const normalizationRules = matchingSettings.matchingStrategy.normalizationRules
    const fieldDetails = this.calculateFieldScores(
      reference.metadata,
      source.metadata,
      fieldConfigurations,
      normalizationRules,
    )
    const overallScore = this.calculateOverallScore(fieldDetails, fieldConfigurations)

    return {
      fieldDetails,
      overallScore,
    }
  }

  private calculateFieldScores(
    referenceMetadata: CSLItem,
    sourceMetadata: CSLItem,
    fieldConfigurations: FieldConfigurations,
    normalizationRules: NormalizationRule[],
  ): FieldMatchDetail[] {
    const fieldScores: FieldMatchDetail[] = []

    // Get enabled fields that exist in both objects with meaningful values
    const enabledFields = MetadataComparator.getEnabledFields(
      referenceMetadata,
      sourceMetadata,
      fieldConfigurations,
    )

    // Compare only enabled fields directly (no path traversal needed for flat CSL structure)
    for (const fieldName of enabledFields) {
      const config = fieldConfigurations[fieldName as keyof FieldConfigurations]
      if (config?.weight && config.weight > 0) {
        const referenceValue = referenceMetadata[fieldName]
        const sourceValue = sourceMetadata[fieldName]

        const score = this.compareValues(referenceValue, sourceValue, normalizationRules)
        const weightedScore = score * 100 // Convert to percentage (0-100)

        fieldScores.push({
          field: fieldName as keyof FieldConfigurations,
          match_score: Math.round(weightedScore),
        })
      }
    }

    return fieldScores
  }

  private compareValues(
    referenceValue: unknown,
    sourceValue: unknown,
    normalizationRules: NormalizationRule[],
  ): number {
    // Special handling for arrays (like authors)
    if (Array.isArray(referenceValue) && Array.isArray(sourceValue)) {
      return this.compareArrays(referenceValue, sourceValue, normalizationRules)
    }

    return similarity(referenceValue, sourceValue, normalizationRules)
  }

  private compareArrays(arr1: unknown[], arr2: unknown[], normalizationRules: NormalizationRule[]): number {
    if (arr1.length === 0 && arr2.length === 0) {
      return 0.5
    }

    if (arr1.length === 0 || arr2.length === 0) {
      return 0.1
    }

    // For authors, compare each author with each author and take best matches
    const scores: number[] = []

    for (const item1 of arr1) {
      let bestScore = 0
      for (const item2 of arr2) {
        const score = similarity(item1, item2, normalizationRules)
        bestScore = Math.max(bestScore, score)
      }
      scores.push(bestScore)
    }

    // Return average of best matches
    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  }

  private calculateOverallScore(fieldDetails: FieldMatchDetail[], fieldConfigurations: FieldConfigurations): number {
    if (fieldDetails.length === 0) {
      return 0
    }

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
