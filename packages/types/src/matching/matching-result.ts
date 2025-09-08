import type { CSLVariable } from '..'

/**
 * Container for all matching-related information
 */
export interface MatchingResult {
  /** Evaluation results for all sources (sorted by score, best first) */
  sourceEvaluations?: SourceEvaluation[]
}

export interface SourceEvaluation {
  /** ID of the reference that was matched */
  referenceId: string
  /** ID of the external source candidate */
  candidateId: string
  /** Detailed match scoring */
  matchDetails: MatchDetails
}

/**
 * Single field match detail
 *
 */
export interface FieldMatchDetail {
  /** Name of the field being compared (e.g., 'title', 'authors') */
  field: CSLVariable
  /** Match score for this specific field (0-100) */
  match_score: number
}

/**
 * Overall match details including final score and field-specific details
 */
export interface MatchDetails {
  /** Final weighted score: Σ(match_score * weight) / Σ(weights) */
  overallScore: number
  /** Detailed scoring per field */
  fieldDetails?: FieldMatchDetail[]
}
