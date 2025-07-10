import type { AIExtractionResponse } from './extraction'
import type { AIVerificationResponse } from './verification'

/**
 * Interface for AI service implementations
 * Defines the contract that all AI services must implement
 */
export interface AIService {
  extractReferences: (text: string) => Promise<AIExtractionResponse>
  verifyMatch: (prompt: string) => Promise<AIVerificationResponse>
}

/**
 * Configuration interface for OpenAI service
 * Defines all required and optional configuration parameters
 */
export interface OpenAIConfig {
  apiKey: string
  model: string
  maxRetries: number
  timeout: number
  temperature: number
}
