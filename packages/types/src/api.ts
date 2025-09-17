/**
 * API-related types and interfaces
 */

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
