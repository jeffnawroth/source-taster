/**
 * Utility functions for handling matching scores and colors
 */

/**
 * Get color based on matching score
 * Aligned with API threshold of 75% for matching
 */
export function getScoreColor(score: number): string {
  // 75+ = matched (success) - matches API threshold
  if (score >= 75)
    return 'success'

  // 50-74 = medium confidence (warning)
  if (score >= 50)
    return 'warning'

  // <50 = low confidence (error)
  return 'error'
}

// /**
//  * Get human-readable score description
//  */
// export function getScoreDescription(score: number): string {
//   if (score >= 75)
//     return 'High confidence match'
//   if (score >= 50)
//     return 'Medium confidence match'
//   return 'Low confidence match'
// }

// /**
//  * Check if score is considered matched (matches API logic)
//  */
// export function isScoreMatched(score: number): boolean {
//   return score >= 75
// }

/**
 * Check if a reference should show re-match option
 * Based on error status or low confidence score
 */
export function shouldShowReMatch(status: string, score?: number): boolean {
  if (status === 'error')
    return true
  if (score !== undefined && score < 50)
    return true // Below medium confidence
  return false
}
