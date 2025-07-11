/**
 * Backend-specific verification types
 */
import type { Reference } from '@source-taster/types'

/**
 * Request to verify references against databases
 * Backend-only type - the frontend just sends { references: Reference[] }
 */
export interface VerificationRequest {
  /** References to verify */
  references: Reference[]
}

/**
 * Single field match detail from AI (without weight)
 */
export interface AIFieldMatchDetail {
  /** Name of the field being compared (e.g., 'title', 'authors') */
  field: string
  /** Match score for this specific field (0-100) */
  match_score: number
}

/**
 * Response from AI verification service
 * Contains field-level match scores for each reference
 */
export interface AIVerificationResponse {
  /** Array of field match details */
  fieldDetails: AIFieldMatchDetail[]
}
