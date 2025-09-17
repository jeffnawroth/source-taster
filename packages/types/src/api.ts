/**
 * API-related types and interfaces
 */
import type { ExternalSource } from './matching/matching-result'
import { z } from 'zod'
import { MatchingReferenceSchema } from './matching'

/**
 * Standard API response wrapper for all endpoints
 * @template T - The type of the response data
 */
export interface ApiResponse<T = any> {
  /** Indicates if the API call was successful */
  success: boolean
  /** The actual response data (type varies by endpoint) */
  data?: T
  /** Error message if the request failed */
  error?: string
  /** Additional human-readable message */
  message?: string
}

/**
 * Validation schema for SearchRequest - supports array of references
 */
export const SearchRequestSchema = z.object({
  references: z.array(MatchingReferenceSchema).min(1).describe('Array of references to search for'),
})

/**
 * Inferred type for SearchRequest
 */
export type SearchRequest = z.infer<typeof SearchRequestSchema>

/**
 * Search result for a single reference
 */
export interface SearchResult {
  /** ID of the reference that was searched */
  referenceId: string
  /** Candidates found in external databases */
  candidates: ExternalSource[]
}

/**
 * Response containing search results from external databases
 */
export interface SearchResponse {
  /** Individual search results per reference */
  results: SearchResult[]
}
