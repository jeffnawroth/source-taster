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
