/**
 * Verification and matching-related types
 */
import type { FieldWeights, MatchDetails } from './match'
import type {
  Reference,
  ReferenceMetadata,
} from './reference'
import type { ArchivedVersion, WebsiteMetadata } from './website'

/**
 * Response containing multiple verification results
 */
export interface VerificationResponse {
  /** Individual verification results */
  results: VerificationResult[]
}

/**
 * Request to verify references against databases
 * Backend-only type - the frontend sends VerificationRequest
 */
export interface VerificationRequest {
  /** References to verify */
  references: Reference[]
  /** Field weights for verification (provided by frontend) */
  fieldWeights: FieldWeights
}

/**
 * Result of website verification
 */
export interface WebsiteVerificationResult {
  /** Reference ID being verified */
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
  /** Error message if verification failed */
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
export interface VerificationResult {
  /** ID of the reference that was verified */
  referenceId: string
  /** The best matching source (if found) */
  matchedSource?: ExternalSource
  /** Detailed verification information */
  verificationDetails?: VerificationDetails
}

export interface VerificationDetails {
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
