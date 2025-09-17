import type { MatchingResult, Reference } from '@source-taster/types'

/**
 * Reference with matching status and results
 */
export interface ExtractedReference extends Reference {
  /** Current matching status */
  status: 'pending' | 'matched' | 'not-matched' | 'error'
  /** Detailed matching results (if completed) */
  matchingResult?: MatchingResult
  /** Error message if matching failed */
  error?: string
}
