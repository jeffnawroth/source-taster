import type { AIService, OpenAIConfig, UserAISettings } from '@source-taster/types'
import { OpenAIService } from './openaiService'

export class AIServiceFactory {
  /**
   * Create OpenAI service with user-provided settings
   */
  static createOpenAIService(userAISettings: UserAISettings): AIService {
    if (!userAISettings?.apiKey) {
      throw new Error('API key required: Please provide your own OpenAI API key in the extension settings to use AI-powered features.')
    }

    const config: OpenAIConfig = {
      apiKey: userAISettings.apiKey,
      model: userAISettings.model,
      maxRetries: 3,
      timeout: 60000, // 60 seconds
      temperature: 0.1, // Low temperature for consistent extraction
    }

    return new OpenAIService(config)
  }
}
