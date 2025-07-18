import type { FieldWeights, MatchDetails } from './match'
import type {
  Reference,
  ReferenceMetadata,
} from './reference'
import type { ArchivedVersion, WebsiteMetadata } from './website'

/**
 * Response containing multiple matching results
 */
export interface MatchingResponse {
  /** Individual matching results */
  results: MatchingResult[]
}

/**
 * Request to match references against databases
 * Backend-only type - the frontend sends MatchingRequest
 */
export interface MatchingRequest {
  /** References to match */
  references: Reference[]
  /** Field weights for matching (provided by frontend) */
  fieldWeights: FieldWeights
}

/**
 * Result of website matching
 */
export interface WebsiteMatchingResult {
  /** Reference ID being matched */
  referenceId: string
  /** Original URL being checked */
  url: string
  /** Whether the URL is currently accessible */
  isAccessible: boolean
  /** HTTP status code */
  statusCode?: number
  /** Extracted website metadata (if accessible or archived) */
  websiteMetadata?: WebsiteMetadata
  /** Detailed matching information */
  matchDetails: MatchDetails
  /** Information about archived version if used */
  archivedVersion?: ArchivedVersion
  /** Error message if matching failed */
  error?: string
}

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
  /** ID of the reference that was matched */
  referenceId: string
  /** The best matching source (if found) */
  matchedSource?: ExternalSource
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
