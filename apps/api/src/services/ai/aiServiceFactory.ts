import type { AIServiceConfig } from '@source-taster/types'
import process from 'node:process'

export interface AIService {
  generateText: (prompt: string) => Promise<string>
}

export class OpenAIService implements AIService {
  constructor(_config: AIServiceConfig) {}

  async generateText(_prompt: string): Promise<string> {
    // OpenAI implementation would go here
    // For now, return a placeholder
    return JSON.stringify([])
  }
}

export class GeminiService implements AIService {
  constructor(_config: AIServiceConfig) {}

  async generateText(_prompt: string): Promise<string> {
    // Gemini implementation would go here
    // For now, return a placeholder
    return JSON.stringify([])
  }
}

export class AIServiceFactory {
  static create(service: 'openai' | 'gemini', model?: string): AIService {
    const apiKey = process.env[`${service.toUpperCase()}_API_KEY`] || ''

    const config: AIServiceConfig = {
      apiKey,
      model: model || (service === 'openai' ? 'gpt-3.5-turbo' : 'gemini-pro'),
      temperature: 0.1,
      maxTokens: 4000,
    }

    switch (service) {
      case 'openai':
        return new OpenAIService(config)
      case 'gemini':
        return new GeminiService(config)
      default:
        throw new Error(`Unsupported AI service: ${service}`)
    }
  }
}
