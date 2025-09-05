import type {
  APIMatchingSettings,
  CSLItem,
  ExternalSource,
  FieldConfigurations,
  FieldMatchDetail,
  MatchDetails,
  MatchingReference,
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
    const fieldDetails = this.calculateFieldScores(reference.metadata, source.metadata, fieldConfigurations)
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

        const score = this.compareValues(referenceValue, sourceValue)
        const weightedScore = score * 100 // Convert to percentage (0-100)

        fieldScores.push({
          field: fieldName as keyof FieldConfigurations,
          match_score: Math.round(weightedScore),
        })
      }
    }

    return fieldScores
  }

  private compareValues(referenceValue: unknown, sourceValue: unknown): number {
    const refStr = this.stringifyValue(referenceValue)
    const srcStr = this.stringifyValue(sourceValue)

    // If both values are empty, return neutral score
    if (!refStr && !srcStr) {
      return 0.5
    }

    // If one value is empty, return low score
    if (!refStr || !srcStr) {
      return 0.1
    }

    // Special handling for arrays (like authors)
    if (Array.isArray(referenceValue) && Array.isArray(sourceValue)) {
      return this.compareArrays(referenceValue, sourceValue)
    }

    // Use similarity function for string comparison
    return similarity(refStr, srcStr)
  }

  private compareArrays(arr1: unknown[], arr2: unknown[]): number {
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
        const score = similarity(this.stringifyValue(item1), this.stringifyValue(item2))
        bestScore = Math.max(bestScore, score)
      }
      scores.push(bestScore)
    }

    // Return average of best matches
    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  }

  private stringifyValue(value: unknown): string {
    if (value === null || value === undefined) {
      return ''
    }

    if (typeof value === 'string') {
      return value
    }

    if (typeof value === 'number') {
      return value.toString()
    }

    if (Array.isArray(value)) {
      return value.map(item => this.stringifyValue(item)).join(' ')
    }

    if (typeof value === 'object') {
      // For author objects, combine lastName and firstName
      if ('lastName' in value) {
        const author = value as { lastName?: string, firstName?: string }
        return [author.firstName, author.lastName].filter(Boolean).join(' ')
      }
      return JSON.stringify(value)
    }

    return String(value)
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
