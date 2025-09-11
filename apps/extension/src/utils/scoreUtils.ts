/**
 * Utility functions for handling matching scores and colors
 */

import { settings } from '../logic'

/**
 * Get color based on matching score using user-defined thresholds
 */
export function getScoreColor(score: number): string {
  const thresholds = settings.value.matching.matchingConfig.displayThresholds

  // Exact match threshold = success (green) - uses strongMatchThreshold from types (this is the higher value)
  if (score >= thresholds.strongMatchThreshold)
    return 'success'

  // High match threshold = warning (orange/yellow) - uses possibleMatchThreshold from types (this is the lower value)
  if (score >= thresholds.possibleMatchThreshold)
    return 'warning'

  // Below partial match threshold = error (red)
  return 'error'
}

/**
 * Get human-readable score description based on user-defined thresholds
 */
export function getScoreDescription(score: number): string {
  const thresholds = settings.value.matching.matchingConfig.displayThresholds

  if (score >= thresholds.strongMatchThreshold)
    return 'High match'
  if (score >= thresholds.possibleMatchThreshold)
    return 'Partial match'
  return 'Low match'
}

/**
 * Check if score is considered matched (high or exact match)
 */
export function isScoreMatched(score: number): boolean {
  const thresholds = settings.value.matching.matchingConfig.displayThresholds
  return score >= thresholds.strongMatchThreshold
}

/**
 * Check if a reference should show re-match option
 * Based on error status or low confidence score
 */
export function shouldShowReMatch(status: string, score?: number): boolean {
  if (status === 'error')
    return true
  if (score !== undefined) {
    const thresholds = settings.value.matching.matchingConfig.displayThresholds
    return score < thresholds.strongMatchThreshold // Below strong confidence
  }
  return false
}
