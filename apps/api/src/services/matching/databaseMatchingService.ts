import type {
  ApiMatchCandidate,
  ApiMatchData,
  ApiMatchEvaluation,
  ApiMatchMatchingSettings,
  ApiMatchReference,
  ApiSearchCandidate,
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
    reference: ApiMatchReference,
    candidates: ApiMatchCandidate[],
    matchingSettings: ApiMatchMatchingSettings,
  ): ApiMatchData {
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
    reference: ApiMatchReference,
    candidate: ApiSearchCandidate,
    matchingSettings: ApiMatchMatchingSettings,
  ): ApiMatchEvaluation {
    return this.evaluateSource(reference, candidate, matchingSettings)
  }

  /**
   * Match all candidates against a reference (internal method)
   */
  private matchAllCandidates(
    candidates: ApiMatchCandidate[],
    reference: ApiMatchReference,
    matchingSettings: ApiMatchMatchingSettings,
  ): ApiMatchEvaluation[] {
    if (candidates.length === 0) {
      return []
    }

    return this.evaluateAllSources(reference, candidates, matchingSettings)
  }

  private evaluateAllSources(
    reference: ApiMatchReference,
    sources: ApiMatchCandidate[],
    matchingSettings: ApiMatchMatchingSettings,
  ): ApiMatchEvaluation[] {
    const evaluations: ApiMatchEvaluation[] = []

    for (const source of sources) {
      const evaluation = this.evaluateSource(reference, source, matchingSettings)
      evaluations.push(evaluation)
    }

    return evaluations
  }

  private evaluateSource(
    reference: ApiMatchReference,
    source: ApiMatchCandidate,
    matchingSettings: ApiMatchMatchingSettings,
  ): ApiMatchEvaluation {
    const matchDetails = this.deterministicMatchingService.matchReference(reference, source, matchingSettings)
    return {
      referenceId: reference.id,
      candidateId: source.id,
      matchDetails,
    }
  }

  private buildMatchingResult(sourceEvaluations: ApiMatchEvaluation[]): ApiMatchData {
    if (sourceEvaluations.length === 0) {
      return { evaluations: [] }
    }

    // Sort by overall score (highest first)
    const sortedEvaluations = [...sourceEvaluations].sort(
      (a, b) => b.matchDetails.overallScore - a.matchDetails.overallScore,
    )

    return { evaluations: sortedEvaluations }
  }
}
