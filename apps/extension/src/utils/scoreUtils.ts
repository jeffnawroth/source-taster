/**
 * Utility functions for handling matching scores and colors
 */

import { matchingSettings } from '@/extension/logic'

/**
 * Get color based on matching score using user-defined thresholds
 */
export function getScoreColor(score: number): string {
  const thresholds = matchingSettings.value.matchingConfig.matchThresholds

  // Exact match threshold = success (green) - uses highMatchThreshold from types (this is the higher value)
  if (score >= thresholds.highMatchThreshold)
    return 'success'

  // High match threshold = warning (orange/yellow) - uses partialMatchThreshold from types (this is the lower value)
  if (score >= thresholds.partialMatchThreshold)
    return 'warning'

  // Below partial match threshold = error (red)
  return 'error'
}

/**
 * Get human-readable score description based on user-defined thresholds
 */
export function getScoreDescription(score: number): string {
  const thresholds = matchingSettings.value.matchingConfig.matchThresholds

  if (score >= thresholds.highMatchThreshold)
    return 'High match'
  if (score >= thresholds.partialMatchThreshold)
    return 'Partial match'
  return 'Low match'
}

/**
 * Check if score is considered matched (high or exact match)
 */
export function isScoreMatched(score: number): boolean {
  const thresholds = matchingSettings.value.matchingConfig.matchThresholds
  return score >= thresholds.highMatchThreshold
}

/**
 * Check if a reference should show re-match option
 * Based on error status or low confidence score
 */
export function shouldShowReMatch(status: string, score?: number): boolean {
  if (status === 'error')
    return true
  if (score !== undefined) {
    const thresholds = matchingSettings.value.matchingConfig.matchThresholds
    return score < thresholds.highMatchThreshold // Below high confidence
  }
  return false
}
