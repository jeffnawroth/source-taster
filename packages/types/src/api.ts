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

/**
 * Configuration for AI services (OpenAI, Gemini)
 */
export interface AIServiceConfig {
  /** API key for the service */
  apiKey: string
  /** Model name to use (e.g., 'gpt-4o', 'gemini-2.5-flash') */
  model: string
  /** Temperature for response randomness (0.0-1.0) */
  temperature?: number
  /** Maximum tokens in the response */
  maxTokens?: number
}

/**
 * AI model specification for requests
 */
export interface AIModel {
  /** AI service to use */
  service: 'openai' | 'gemini'
  /** Specific model to use */
  model: string
}
