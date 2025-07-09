import type { ExtractionResponse } from './schemas/reference.js'
import type { VerificationResponse } from './schemas/verification.js'
import process from 'node:process'
import { type OpenAIConfig, OpenAIService } from './services/openaiService.js'

export interface AIService {
  extractReferences: (text: string) => Promise<ExtractionResponse>
  verifyMatch: (prompt: string) => Promise<VerificationResponse>
}

export class AIServiceFactory {
  static createOpenAIService(): AIService {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }

    const config: OpenAIConfig = {
      apiKey,
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      maxRetries: 3,
      timeout: 60000, // 60 seconds
      temperature: 0.1, // Low temperature for consistent extraction
    }

    return new OpenAIService(config)
  }
}

// Export the default service instance
export const aiService = AIServiceFactory.createOpenAIService()

// Re-export Zod types for backward compatibility
export type { ExtractionResponse, ZodAuthor, ZodReference, ZodReferenceMetadata } from './schemas/reference.js'
export type { FieldDetail, VerificationResponse } from './schemas/verification.js'
