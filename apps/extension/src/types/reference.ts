import type { Reference, VerificationResult } from '@source-taster/types'

/**
 * Reference with verification status and results
 */
export interface ProcessedReference extends Reference {
  /** Current verification status */
  status: 'pending' | 'verified' | 'not-verified' | 'error'
  /** Detailed verification results (if completed) */
  verificationResult?: VerificationResult
  /** Error message if verification failed */
  error?: string
}
