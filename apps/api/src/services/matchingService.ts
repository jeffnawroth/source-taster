import type { ValidatedMatchingRequest } from '@source-taster/types'
import { DatabaseMatchingService } from './databaseMatchingService'

// Service instance
const databaseMatchingService = new DatabaseMatchingService()

/**
 * Match a single reference against provided candidates
 */
export function matchReferenceAgainstCandidates(request: ValidatedMatchingRequest) {
  return databaseMatchingService.evaluateAllCandidates(
    request.reference,
    request.candidates,
    request.matchingSettings,
  )
}
