import type { ReferenceMetadata } from '../reference'
import type { FieldWeights } from './matching-config.types'

/**
 * Represents a reference found in an external database
 */
export interface ExternalSource {
  /** Unique identifier in the external database */
  id: string
  /** Which database this source comes from */
  source: 'openalex' | 'crossref' | 'europepmc' | 'semanticscholar' | 'arxiv' | 'website'
  /** Bibliographic metadata from the database */
  metadata: ReferenceMetadata
  /** Canonical URL to access this source in the database */
  url?: string
}

// Forward declarations for types that depend on each other
export interface MatchingResult {
  /** Detailed matching information */
  matchingDetails?: MatchingDetails
}

export interface MatchingDetails {
  /** All sources found in databases */
  sourcesFound: ExternalSource[]
  /** Match details for the best source */
  matchDetails?: MatchDetails
  /** Evaluation results for all sources */
  allSourceEvaluations?: SourceEvaluation[]
}

export interface SourceEvaluation {
  /** The external source being evaluated */
  source: ExternalSource
  /** Detailed match scoring */
  matchDetails: MatchDetails
}

/**
 * Single field match detail
 *
 */
export interface FieldMatchDetail {
  /** Name of the field being compared (e.g., 'title', 'authors') */
  field: keyof FieldWeights
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
