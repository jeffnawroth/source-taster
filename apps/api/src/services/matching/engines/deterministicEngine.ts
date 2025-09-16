import type { ApiMatchCandidate, ApiMatchConfig, ApiMatchDetails, ApiMatchFieldDetail, ApiMatchMatchingSettings, ApiMatchNormalizationRule, ApiMatchReference, CSLItem, CSLVariable } from '@source-taster/types'
import levenshtein from 'damerau-levenshtein'
import { containerTitleSimilarity, containsNumericToken, pageSimilarity } from '@/api/utils/fieldSimilarity'
import { MetadataComparator } from '@/api/utils/metadataComparator'
import { similarity } from '@/api/utils/similarity'
import { NormalizationService } from '../../matching/normalizationService'

export class DeterministicEngine {
  private readonly normalizationService = new NormalizationService()

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
      if (!config?.weight || config.weight <= 0)
        continue

      const referenceValue = referenceMetadata[fieldName]
      const sourceValue = sourceMetadata[fieldName]

      const score = this.scoreField(fieldName, referenceValue, sourceValue, normalizationRules)
      const weightedScore = score * 100 // Convert to percentage (0-100)

      fieldScores.push({
        field: fieldName as CSLVariable,
        fieldScore: Math.round(weightedScore),
      })
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

  private scoreField(
    fieldName: string,
    referenceValue: unknown,
    sourceValue: unknown,
    normalizationRules: ApiMatchNormalizationRule[],
  ): number {
    const allowNumericFieldHeuristic = normalizationRules.includes('match-volume-issue-numeric')
    const allowPageRangeHeuristic = normalizationRules.includes('match-page-range-overlap')
    const allowContainerVariantsHeuristic = normalizationRules.includes('match-container-title-variants')

    // Special handling for volume/issue: references may pack both numbers into a single field
    if (allowNumericFieldHeuristic && (fieldName === 'volume' || fieldName === 'issue')) {
      const numericMatch = containsNumericToken(
        referenceValue,
        sourceValue,
        normalizationRules,
        (v, r) => this.normalizationService.normalizeValue(v, r),
      )
      if (numericMatch)
        return 1
    }
    // Pages: treat single page vs. page range as overlap; compute overlap ratio
    if (allowPageRangeHeuristic && fieldName === 'page') {
      const sim = pageSimilarity(
        referenceValue,
        sourceValue,
        normalizationRules,
        (v, r) => this.normalizationService.normalizeValue(v, r),
      )
      if (sim !== null)
        return sim
    }
    // Container title: ignore acronym-only parentheses for comparison and take best
    if (fieldName === 'container-title') {
      const base = this.compareValues(referenceValue, sourceValue, normalizationRules)
      if (allowContainerVariantsHeuristic) {
        const enhanced = containerTitleSimilarity(
          referenceValue,
          sourceValue,
          normalizationRules,
          (v, r) => this.normalizationService.normalizeValue(v, r),
          (a, b) => levenshtein(a, b).similarity,
        )

        return Math.max(base, enhanced ?? 0)
      }
      return base
    }

    return this.compareValues(referenceValue, sourceValue, normalizationRules)
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
