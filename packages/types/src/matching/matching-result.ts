import type { CSLVariable } from '../reference'
import z from 'zod'
import { CSLItemSchema } from '../reference'

export const ExternalSourceSchema = z.object({
  id: z.string().describe('Unique identifier in the external database'),
  source: z.enum(['openalex', 'crossref', 'europepmc', 'semanticscholar', 'arxiv', 'website']).describe('Which database this source comes from'),
  metadata: CSLItemSchema.describe('Bibliographic metadata from the database'),
  url: z.string().optional().describe('Canonical URL to access this source in the database'),
})

export type ExternalSource = z.infer<typeof ExternalSourceSchema>

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
