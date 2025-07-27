import type { MatchDetails } from './matching'
import z from 'zod'

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
 * Result of website matching
 */
export interface WebsiteMatchingResult {
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

export const WebsiteMatchingOptionsSchema = z.object({
  timeout: z.number().int().positive().optional().describe('Maximum time to wait for website response in milliseconds'),
  enableWaybackMachine: z.boolean().optional().describe('Whether to check Wayback Machine if URL is unavailable'),
  userAgent: z.string().optional().describe('User agent string for HTTP requests'),
})

export type WebsiteMatchingOptions = z.infer<typeof WebsiteMatchingOptionsSchema>
