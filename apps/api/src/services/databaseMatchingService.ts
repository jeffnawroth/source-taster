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
    // Step 1: Search for candidates using the new DatabaseSearchService
    const candidates = await this.searchService.searchAllDatabases(reference)

    // Step 2: Match candidates against the reference
    const { earlyTermination } = matchingSettings.matchingConfig

    const sourceEvaluations = earlyTermination.enabled
      ? await this.matchCandidatesWithEarlyTermination(candidates, reference, matchingSettings)
      : await this.matchAllCandidates(candidates, reference, matchingSettings)

    return this.buildMatchingResult(sourceEvaluations)
  }

  private async matchCandidatesWithEarlyTermination(
    candidates: ExternalSource[],
    reference: MatchingReference,
    matchingSettings: APIMatchingSettings,
  ): Promise<SourceEvaluation[]> {
    const { threshold } = matchingSettings.matchingConfig.earlyTermination
    const sourceEvaluations: SourceEvaluation[] = []

    for (const candidate of candidates) {
      const evaluation = await this.evaluateSource(reference, candidate, matchingSettings)

      if (!evaluation) {
        continue // Skip failed evaluation
      }

      sourceEvaluations.push(evaluation)

      if (this.shouldTerminateEarly(evaluation, threshold)) {
        break
      }
    }

    return sourceEvaluations
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

  private shouldTerminateEarly(evaluation: SourceEvaluation, threshold: number): boolean {
    return evaluation.matchDetails.overallScore >= threshold
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
