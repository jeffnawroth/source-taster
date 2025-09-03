import type {
  APIMatchingSettings,
  MatchingReference,
  MatchingResult,
} from '@source-taster/types'
import { DatabaseMatchingService } from './databaseMatchingService'
import { DatabaseSearchService } from './databaseSearchService'

// Service instances
const searchService = new DatabaseSearchService()
const matchingService = new DatabaseMatchingService()

/**
 * Search for candidates and match them against a single reference
 */
export async function processSearchAndMatch(
  reference: MatchingReference,
  matchingSettings: APIMatchingSettings,
): Promise<MatchingResult> {
  console.warn(`SearchAndMatchService: Processing reference ${reference.id}`)

  // 1. Search for candidates in all databases
  const candidates = await searchService.searchAllDatabases(reference)
  console.warn(`SearchAndMatchService: Found ${candidates.length} candidates for reference ${reference.id}`)

  // 2. Match candidates against the reference
  const result = matchingService.evaluateAllCandidates(reference, candidates, matchingSettings)
  console.warn(`SearchAndMatchService: Evaluated ${result.sourceEvaluations?.length || 0} candidates for reference ${reference.id}`)

  return result
}
