import type { AIService, OpenAIConfig } from '@source-taster/types'
import process from 'node:process'
import { OpenAIService } from './openaiService'

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
