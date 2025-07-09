import type { VerificationResponse } from '../services/ai/schemas/verification'
import type { ExtractionResponse } from './extraction'

/**
 * Interface for AI service implementations
 * Defines the contract that all AI services must implement
 */
export interface AIService {
  extractReferences: (text: string) => Promise<ExtractionResponse>
  verifyMatch: (prompt: string) => Promise<VerificationResponse>
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
