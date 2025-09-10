// src/services/matching/MatchingCoordinator.ts

import type {
  ApiMatchCandidate,
  ApiMatchData,
  ApiMatchEvaluation,
  ApiMatchMatchingSettings,
  ApiMatchReference,
  ApiSearchCandidate,
} from '@source-taster/types'
import { DeterministicEngine } from './engines/deterministicEngine'

export class MatchingCoordinator {
  private readonly deterministicEngine = new DeterministicEngine()

  public evaluateAllCandidates(
    reference: ApiMatchReference,
    candidates: ApiMatchCandidate[],
    matchingSettings: ApiMatchMatchingSettings,
  ): ApiMatchData {
    const sourceEvaluations = this.matchAllCandidates(candidates, reference, matchingSettings)
    return this.buildMatchingResult(sourceEvaluations)
  }

  public evaluateSingleCandidate(
    reference: ApiMatchReference,
    candidate: ApiSearchCandidate,
    matchingSettings: ApiMatchMatchingSettings,
  ): ApiMatchEvaluation {
    return this.evaluateSource(reference, candidate, matchingSettings)
  }

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
    const matchDetails = this.deterministicEngine.matchReference(reference, source, matchingSettings)
    return {
      candidateId: source.id,
      matchDetails,
    }
  }

  private buildMatchingResult(sourceEvaluations: ApiMatchEvaluation[]): ApiMatchData {
    if (sourceEvaluations.length === 0) {
      return { evaluations: [] }
    }
    const sortedEvaluations = [...sourceEvaluations].sort(
      (a, b) => b.matchDetails.overallScore - a.matchDetails.overallScore,
    )
    return { evaluations: sortedEvaluations }
  }
}
