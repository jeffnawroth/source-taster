import type { MatchingResult } from '../matching'
import type { Reference } from '../reference'
import type { MatchingSettings } from './settings'

/**
 * Response containing multiple matching results
 */
export interface MatchingResponse {
  /** Individual matching results */
  results: MatchingResult[]
}

/**
 * Request to match references against databases
 * Backend-only type - the frontend sends MatchingRequest
 */
export interface MatchingRequest {
  /** References to match */
  references: Reference[]
  /** Matching settings including mode and field weights */
  matchingSettings: MatchingSettings
}
