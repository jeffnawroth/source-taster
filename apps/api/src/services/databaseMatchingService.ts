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
  evaluateAllCandidates(
    reference: MatchingReference,
    candidates: ExternalSource[],
    matchingSettings: APIMatchingSettings,
  ): MatchingResult {
    const sourceEvaluations = this.matchAllCandidates(candidates, reference, matchingSettings)
    return this.buildMatchingResult(sourceEvaluations)
  }

  /**
   * Evaluate a single candidate against a reference
   * @param reference The reference to match against
   * @param candidate Single candidate to evaluate
   * @param matchingSettings Matching configuration
   * @returns Source evaluation
   */
  evaluateSingleCandidate(
    reference: MatchingReference,
    candidate: ExternalSource,
    matchingSettings: APIMatchingSettings,
  ): SourceEvaluation {
    return this.evaluateSource(reference, candidate, matchingSettings)
  }

  /**
   * Match all candidates against a reference (internal method)
   */
  private matchAllCandidates(
    candidates: ExternalSource[],
    reference: MatchingReference,
    matchingSettings: APIMatchingSettings,
  ): SourceEvaluation[] {
    if (candidates.length === 0) {
      return []
    }

    return this.evaluateAllSources(reference, candidates, matchingSettings)
  }

  private evaluateAllSources(
    reference: MatchingReference,
    sources: ExternalSource[],
    matchingSettings: APIMatchingSettings,
  ): SourceEvaluation[] {
    return sources.map(source =>
      this.evaluateSource(reference, source, matchingSettings),
    )
  }

  private evaluateSource(
    reference: MatchingReference,
    source: ExternalSource,
    matchingSettings: APIMatchingSettings,
  ): SourceEvaluation {
    const matchDetails = this.deterministicMatchingService.matchReference(reference, source, matchingSettings)
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
