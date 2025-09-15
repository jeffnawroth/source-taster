import type { ApiMatchCandidate, ApiMatchConfig, ApiMatchDetails, ApiMatchFieldDetail, ApiMatchMatchingSettings, ApiMatchNormalizationRule, ApiMatchReference, CSLItem, CSLVariable } from '@source-taster/types'
import { MetadataComparator } from '@/api/utils/metadataComparator'
import { similarity } from '@/api/utils/similarity'
import { NormalizationService } from '../../matching/normalizationService'

export class DeterministicEngine {
  private readonly normalizationService = new NormalizationService()

  private extractIntegers(input: string): number[] {
    const m = input.match(/\d+/g)
    return m ? m.map(n => Number.parseInt(n, 10)).filter(n => Number.isFinite(n)) : []
  }

  private normalizeValue(value: unknown, rules: ApiMatchNormalizationRule[]): string {
    return this.normalizationService.normalizeValue(value, rules)
  }

  /**
   * Matches a reference against an external source using deterministic similarity algorithms
   */
  matchReference(
    reference: ApiMatchReference,
    source: ApiMatchCandidate,
    matchingSettings: ApiMatchMatchingSettings,
  ): ApiMatchDetails {
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
    fieldConfigurations: ApiMatchConfig['fieldConfigurations'],
    normalizationRules: ApiMatchNormalizationRule[],
  ): ApiMatchFieldDetail[] {
    const fieldScores: ApiMatchFieldDetail[] = []

    // Get enabled fields that exist in both objects with meaningful values
    const enabledFields = MetadataComparator.getEnabledFields(
      referenceMetadata,
      sourceMetadata,
      fieldConfigurations,
    )

    // Compare only enabled fields directly (no path traversal needed for flat CSL structure)
    for (const fieldName of enabledFields) {
      const config = fieldConfigurations[fieldName as keyof ApiMatchConfig['fieldConfigurations']]
      if (config?.weight && config.weight > 0) {
        const referenceValue = referenceMetadata[fieldName]
        const sourceValue = sourceMetadata[fieldName]

        // Special handling for volume/issue: references may pack both numbers into a single field
        let score: number
        if (fieldName === 'volume') {
          // If reference volume contains the source's volume number among other tokens, count as full match
          const refStr = this.normalizeValue(referenceValue, normalizationRules)
          const srcVolStr = this.normalizeValue(sourceValue, normalizationRules)
          const refNums = this.extractIntegers(refStr)
          const srcVolNums = this.extractIntegers(srcVolStr)

          if (refNums.length > 0 && srcVolNums.length > 0 && refNums.includes(srcVolNums[0])) {
            score = 1
          }
          else {
            score = this.compareValues(referenceValue, sourceValue, normalizationRules)
          }
        }
        else if (fieldName === 'issue') {
          // If reference issue contains the source's issue number among other tokens, count as full match
          const refStr = this.normalizeValue(referenceValue, normalizationRules)
          const srcIssStr = this.normalizeValue(sourceValue, normalizationRules)
          const refNums = this.extractIntegers(refStr)
          const srcIssNums = this.extractIntegers(srcIssStr)

          if (refNums.length > 0 && srcIssNums.length > 0 && refNums.includes(srcIssNums[0])) {
            score = 1
          }
          else {
            score = this.compareValues(referenceValue, sourceValue, normalizationRules)
          }
        }
        else {
          score = this.compareValues(referenceValue, sourceValue, normalizationRules)
        }
        const weightedScore = score * 100 // Convert to percentage (0-100)

        fieldScores.push({
          field: fieldName as CSLVariable,
          fieldScore: Math.round(weightedScore),
        })
      }
    }

    return fieldScores
  }

  private compareValues(
    referenceValue: unknown,
    sourceValue: unknown,
    normalizationRules: ApiMatchNormalizationRule[],
  ): number {
    // Special handling for arrays (like authors)
    if (Array.isArray(referenceValue) && Array.isArray(sourceValue)) {
      return this.compareArrays(referenceValue, sourceValue, normalizationRules)
    }

    return similarity(referenceValue, sourceValue, normalizationRules)
  }

  private compareArrays(arr1: unknown[], arr2: unknown[], normalizationRules: ApiMatchNormalizationRule[]): number {
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

  private calculateOverallScore(fieldDetails: ApiMatchFieldDetail[], fieldConfigurations: ApiMatchConfig['fieldConfigurations']): number {
    if (fieldDetails.length === 0) {
      return 0
    }

    let totalWeightedScore = 0
    let totalWeight = 0

    for (const detail of fieldDetails) {
      const weight = fieldConfigurations[detail.field as keyof ApiMatchConfig['fieldConfigurations']]?.weight || 0
      totalWeightedScore += detail.fieldScore * weight
      totalWeight += weight
    }

    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0
  }
}
