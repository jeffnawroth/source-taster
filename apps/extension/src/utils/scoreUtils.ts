/**
 * Utility functions for handling verification scores and colors
 */

/**
 * Get color based on verification score
 * Aligned with API threshold of 75% for verification
 */
export function getScoreColor(score: number): string {
  // 75+ = verified (success) - matches API threshold
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
//  * Check if score is considered verified (matches API logic)
//  */
// export function isScoreVerified(score: number): boolean {
//   return score >= 75
// }

/**
 * Check if a reference should show re-verify option
 * Based on error status or low confidence score
 */
export function shouldShowReVerify(status: string, score?: number): boolean {
  if (status === 'error')
    return true
  if (score !== undefined && score < 50)
    return true // Below medium confidence
  return false
}
