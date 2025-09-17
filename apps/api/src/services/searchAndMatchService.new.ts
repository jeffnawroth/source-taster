import type {
  APIMatchingSettings,
  MatchingReference,
  MatchingResult,
  SourceEvaluation,
} from '@source-taster/types'
import { DatabaseMatchingService } from './databaseMatchingService'
import { DatabaseSearchService } from './databaseSearchService'

// Service instances
const searchService = new DatabaseSearchService()
const matchingService = new DatabaseMatchingService()

/**
 * Search for candidates and match them against a single reference with Early Termination
 */
export async function processSearchAndMatch(
  reference: MatchingReference,
  matchingSettings: APIMatchingSettings,
): Promise<MatchingResult> {
  console.warn(`SearchAndMatchService: Processing reference ${reference.id}`)

  const isEarlyTerminationEnabled = matchingSettings.matchingConfig.earlyTermination.enabled
  const threshold = matchingSettings.matchingConfig.earlyTermination.threshold

  if (isEarlyTerminationEnabled) {
    // Early Termination Mode: Search databases one by one and stop at first good match
    return await processSearchAndMatchWithEarlyTermination(reference, matchingSettings, threshold)
  }
  else {
    // Normal Mode: Search all databases then match all candidates
    const candidates = await searchService.searchAllDatabases(reference)
    console.warn(`SearchAndMatchService: Found ${candidates.length} candidates for reference ${reference.id}`)

    const result = matchingService.evaluateAllCandidates(reference, candidates, matchingSettings)
    console.warn(`SearchAndMatchService: Evaluated ${result.sourceEvaluations?.length || 0} candidates for reference ${reference.id}`)

    return result
  }
}

/**
 * Process search and match with Early Termination - search databases sequentially
 */
async function processSearchAndMatchWithEarlyTermination(
  reference: MatchingReference,
  matchingSettings: APIMatchingSettings,
  threshold: number,
): Promise<MatchingResult> {
  const allEvaluations: SourceEvaluation[] = []
  const databases = searchService.getDatabasesByPriority()

  for (const databaseInfo of databases) {
    console.warn(`SearchAndMatchService: Searching ${databaseInfo.name} for reference ${reference.id} (Early Termination mode)`)

    // Search single database
    const candidate = await searchService.searchSingleDatabase(reference, databaseInfo)

    if (candidate) {
      // Evaluate the candidate immediately
      const evaluation = matchingService.evaluateSingleCandidate(reference, candidate, matchingSettings)
      allEvaluations.push(evaluation)

      // Check for Early Termination
      if (evaluation.matchDetails.overallScore >= threshold) {
        console.warn(`SearchAndMatchService: Early termination triggered! Found ${evaluation.matchDetails.overallScore}% match in ${databaseInfo.name} (threshold: ${threshold}%)`)
        console.warn(`SearchAndMatchService: Stopping search. Checked ${allEvaluations.length} of ${databases.length} databases`)
        break
      }
    }
  }

  // Build result from collected evaluations (sorted by score)
  return {
    sourceEvaluations: allEvaluations.sort((a, b) => b.matchDetails.overallScore - a.matchDetails.overallScore),
  }
}

/**
 * Search for candidates and match them against multiple references with Early Termination support
 */
export async function processSearchAndMatchBatch(
  references: MatchingReference[],
  matchingSettings: APIMatchingSettings,
): Promise<MatchingResult[]> {
  console.warn(`SearchAndMatchService: Processing batch of ${references.length} references`)

  const results: MatchingResult[] = []
  const isEarlyTerminationEnabled = matchingSettings.matchingConfig.earlyTermination.enabled
  const threshold = matchingSettings.matchingConfig.earlyTermination.threshold

  for (const reference of references) {
    const result = await processSearchAndMatch(reference, matchingSettings)
    results.push(result)

    // Early Termination Check across references
    if (isEarlyTerminationEnabled && results.length < references.length) {
      const hasHighConfidenceMatch = result.sourceEvaluations?.some(evaluation =>
        evaluation.matchDetails.overallScore >= threshold,
      )

      if (hasHighConfidenceMatch) {
        console.warn(`SearchAndMatchService: Early termination triggered for reference ${reference.id} (score >= ${threshold}%)`)
        console.warn(`SearchAndMatchService: Stopping processing. Processed ${results.length} of ${references.length} references`)
        break
      }
    }
  }

  console.warn(`SearchAndMatchService: Batch processing completed for ${results.length} references (Early Termination: ${isEarlyTerminationEnabled ? 'enabled' : 'disabled'})`)
  return results
}
