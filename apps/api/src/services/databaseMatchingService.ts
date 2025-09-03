import type {
  APIMatchingSettings,
  ExternalSource,
  MatchingReference,
  MatchingResult,
  SourceEvaluation,
} from '@source-taster/types'
import { DatabaseSearchService } from './databaseSearchService'
import { DeterministicMatchingService } from './deterministicMatchingService'

// export class DatabaseMatchingService extends BaseMatchingService {
export class DatabaseMatchingService {
  private readonly searchService = new DatabaseSearchService()
  private readonly deterministicMatchingService = new DeterministicMatchingService()

  constructor() {
    // super()
  }

  async matchReference(
    reference: MatchingReference,
    matchingSettings: APIMatchingSettings,
  ): Promise<MatchingResult> {
    const { earlyTermination } = matchingSettings.matchingConfig

    // Choose search strategy based on early termination settings
    const sourceEvaluations = earlyTermination.enabled
      ? await this.matchWithEarlyTermination(reference, matchingSettings)
      : await this.matchWithFullSearch(reference, matchingSettings)

    return this.buildMatchingResult(sourceEvaluations)
  }

  /**
   * Match with full search - search all databases then evaluate all candidates
   */
  private async matchWithFullSearch(
    reference: MatchingReference,
    matchingSettings: APIMatchingSettings,
  ): Promise<SourceEvaluation[]> {
    const candidates = await this.searchService.searchAllDatabases(reference)
    return await this.matchAllCandidates(candidates, reference, matchingSettings)
  }

  /**
   * Match with early termination - search databases sequentially and stop when good match found
   */
  private async matchWithEarlyTermination(
    reference: MatchingReference,
    matchingSettings: APIMatchingSettings,
  ): Promise<SourceEvaluation[]> {
    const { threshold } = matchingSettings.matchingConfig.earlyTermination
    const sourceEvaluations: SourceEvaluation[] = []
    const databases = this.searchService.getDatabasesByPriority()

    for (const databaseInfo of databases) {
      const evaluation = await this.searchAndEvaluateDatabase(reference, databaseInfo, matchingSettings)

      if (evaluation) {
        sourceEvaluations.push(evaluation)

        if (this.shouldStopSearching(evaluation, threshold, databaseInfo.name)) {
          break
        }
      }
    }

    this.logEarlyTerminationCompletion(sourceEvaluations.length, reference.id)
    return sourceEvaluations
  }

  /**
   * Search and evaluate a single database, handling errors gracefully
   */
  private async searchAndEvaluateDatabase(
    reference: MatchingReference,
    databaseInfo: { name: string, service: any, priority: number },
    matchingSettings: APIMatchingSettings,
  ): Promise<SourceEvaluation | null> {
    try {
      const candidate = await this.searchService.searchSingleDatabase(reference, databaseInfo)

      if (!candidate) {
        console.warn(`DatabaseMatchingService: No candidate found in ${databaseInfo.name}`)
        return null
      }

      console.warn(`DatabaseMatchingService: Found candidate in ${databaseInfo.name}:`, candidate.id)
      return await this.evaluateSource(reference, candidate, matchingSettings)
    }
    catch (error) {
      console.error(`DatabaseMatchingService: Error searching in ${databaseInfo.name}:`, error)
      return null
    }
  }

  /**
   * Check if we should stop searching based on the evaluation score
   */
  private shouldStopSearching(evaluation: SourceEvaluation, threshold: number, databaseName: string): boolean {
    const shouldStop = evaluation.matchDetails.overallScore >= threshold

    if (shouldStop) {
      console.warn(`DatabaseMatchingService: Early termination after ${databaseName} - score ${evaluation.matchDetails.overallScore} >= ${threshold}`)
    }

    return shouldStop
  }

  /**
   * Log completion of early termination search
   */
  private logEarlyTerminationCompletion(evaluationsCount: number, referenceId: string): void {
    console.warn(`DatabaseMatchingService: Early termination completed with ${evaluationsCount} evaluations for reference ${referenceId}`)
  }

  private async matchAllCandidates(
    candidates: ExternalSource[],
    reference: MatchingReference,
    matchingSettings: APIMatchingSettings,
  ): Promise<SourceEvaluation[]> {
    if (candidates.length === 0) {
      return []
    }

    return await this.evaluateAllSources(reference, candidates, matchingSettings)
  }

  private async evaluateAllSources(
    reference: MatchingReference,
    sources: ExternalSource[],
    matchingSettings: APIMatchingSettings,
  ): Promise<SourceEvaluation[]> {
    const evaluationPromises = sources.map(source =>
      this.tryEvaluateSource(reference, source, matchingSettings),
    )

    const results = await Promise.allSettled(evaluationPromises)

    return this.extractSuccessfulEvaluations(results)
  }

  private async tryEvaluateSource(
    reference: MatchingReference,
    source: ExternalSource,
    matchingSettings: APIMatchingSettings,
  ): Promise<SourceEvaluation | null> {
    try {
      return await this.evaluateSource(reference, source, matchingSettings)
    }
    catch {
      return null
    }
  }

  private extractSuccessfulEvaluations(results: PromiseSettledResult<SourceEvaluation | null>[]): SourceEvaluation[] {
    return results
      .filter((result): result is PromiseFulfilledResult<SourceEvaluation> =>
        result.status === 'fulfilled' && !!result.value,
      )
      .map(result => result.value)
  }

  private async evaluateSource(
    reference: MatchingReference,
    source: ExternalSource,
    matchingSettings: APIMatchingSettings,
  ): Promise<SourceEvaluation> {
    const matchDetails = await this.deterministicMatchingService.matchReference(reference, source, matchingSettings)
    return {
      source,
      matchDetails,
    }
  }

  private buildMatchingResult(sourceEvaluations: SourceEvaluation[]): MatchingResult {
    if (sourceEvaluations.length === 0) {
      return { sourceEvaluations: [] }
    }

    // Sort by overall score (highest first)
    const sortedEvaluations = [...sourceEvaluations].sort(
      (a, b) => b.matchDetails.overallScore - a.matchDetails.overallScore,
    )

    return { sourceEvaluations: sortedEvaluations }
  }
}
