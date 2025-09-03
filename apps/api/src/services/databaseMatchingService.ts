import type {
  APIMatchingSettings,
  ExternalSource,
  MatchingReference,
  MatchingResult,
  SourceEvaluation,
} from '@source-taster/types'
import { DeterministicMatchingService } from './deterministicMatchingService'

/**
 * Pure matching service - only evaluates candidates against references
 * No database search logic - candidates must be provided from outside
 */
export class DatabaseMatchingService {
  private readonly deterministicMatchingService = new DeterministicMatchingService()

  constructor() {
    // Initialize service
  }

  /**
   * Evaluate all provided candidates against a reference
   * @param reference The reference to match against
   * @param candidates Array of candidates to evaluate
   * @param matchingSettings Matching configuration
   * @returns Matching result with evaluated candidates
   */
  async evaluateAllCandidates(
    reference: MatchingReference,
    candidates: ExternalSource[],
    matchingSettings: APIMatchingSettings,
  ): Promise<MatchingResult> {
    const sourceEvaluations = await this.matchAllCandidates(candidates, reference, matchingSettings)
    return this.buildMatchingResult(sourceEvaluations)
  }

  /**
   * Evaluate a single candidate against a reference
   * @param reference The reference to match against
   * @param candidate Single candidate to evaluate
   * @param matchingSettings Matching configuration
   * @returns Source evaluation or null if evaluation fails
   */
  async evaluateSingleCandidate(
    reference: MatchingReference,
    candidate: ExternalSource,
    matchingSettings: APIMatchingSettings,
  ): Promise<SourceEvaluation | null> {
    try {
      return await this.evaluateSource(reference, candidate, matchingSettings)
    }
    catch (error) {
      console.error(`DatabaseMatchingService: Error evaluating candidate:`, error)
      return null
    }
  }

  /**
   * Match all candidates against a reference (internal method)
   */
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
