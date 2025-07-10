/**
 * Verification and matching-related types
 */
import type {
  MatchDetails,
  VerificationResult,
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

// Re-export types from reference.ts that are needed for verification
export type {
  FieldMatchDetail,
  MatchDetails,
  SourceEvaluation,
  VerificationDetails,
  VerificationResult,
} from './reference'
