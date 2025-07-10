/**
 * Verification and matching-related types
 */
import type {
  ReferenceMetadata,
} from './reference'

/**
 * Response containing multiple verification results
 */
export interface VerificationResponse {
  /** Individual verification results */
  results: VerificationResult[]
}

/**
 * Website metadata extracted from HTML
 */
export interface WebsiteMetadata {
  /** Original URL of the website */
  url: string
  /** Page title from <title>, og:title, etc. */
  title?: string
  /** Authors extracted from the page */
  authors?: string[]
  /** Publication/article date */
  publishedDate?: Date
  /** Last modified date from headers or meta tags */
  lastModified?: string
  /** Description from meta description */
  description?: string
  /** Canonical URL */
  canonical?: string
  /** Site name (e.g., "CNN", "BBC") */
  siteName?: string
  /** Article type (e.g., "article", "news") */
  articleType?: string
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
  /** Whether the reference matches the website content */
  isVerified: boolean
  /** Detailed matching information */
  matchDetails: MatchDetails
  /** Information about archived version if used */
  archivedVersion?: ArchivedVersion
  /** Error message if verification failed */
  error?: string
}

/**
 * Archived version information from Wayback Machine
 */
export interface ArchivedVersion {
  /** URL of the archived version */
  url: string
  /** Original URL that was archived */
  originalUrl: string
  /** Timestamp of the archived version */
  timestamp: Date
  /** Metadata extracted from the archived page */
  metadata: WebsiteMetadata
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
  /** Whether the reference was successfully verified */
  isVerified: boolean
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

export interface MatchDetails {
  /** Final weighted score: Σ(match_score * weight) / Σ(weights) */
  overallScore: number
  /** Detailed scoring per field */
  fieldDetails?: FieldMatchDetail[]
}

export interface SourceEvaluation {
  /** The external source being evaluated */
  source: ExternalSource
  /** Detailed match scoring */
  matchDetails: MatchDetails
  /** Whether this source is considered a match */
  isMatch: boolean
}

export interface FieldMatchDetail {
  /** Name of the field being compared (e.g., 'title', 'authors') */
  field: string
  /** Match score for this specific field (0-100) */
  match_score: number
  /** Weight used for this field in overall calculation */
  weight: number
}
