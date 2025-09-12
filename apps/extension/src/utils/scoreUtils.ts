/**
 * Utility functions for handling matching scores and colors
 */

import { settings } from '../logic'

/**
 * Get color based on matching score using user-defined thresholds
 */
export function getScoreColor(score: number | null): string {
  // Handle null/invalid scores
  if (score == null || !Number.isFinite(score) || score <= 0)
    return 'default'

  const thresholds = settings.value.matching.matchingConfig.displayThresholds

  // Exact match (100%) gets special dark green color
  if (score === 100)
    return '#1B5E20'

  // Strong match threshold = success (green)
  if (score >= thresholds.strongMatchThreshold)
    return 'success'

  // Possible match threshold = warning (orange/yellow)
  if (score >= thresholds.possibleMatchThreshold)
    return 'warning'

  // Below possible match threshold = error (red)
  return 'error'
}
