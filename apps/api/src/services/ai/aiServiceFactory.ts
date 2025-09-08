import type { AIService, ApiAISettings, OpenAIConfig } from '@source-taster/types'
import { PROVIDER_CONFIG } from '@source-taster/types'
import { OpenAIService } from './openaiService'

export class AIServiceFactory {
  /**
   * Create AI service with user-provided settings
   * Falls back to environment variables in development
   * Supports multiple providers through OpenAI-compatible APIs
   */
  static createOpenAIService(userAISettings?: ApiAISettings): AIService {
    let apiKey: string
    let model: string
    let baseUrl: string | undefined

    if (userAISettings?.apiKey) {
      // Use user-provided settings
      apiKey = userAISettings.apiKey
      model = userAISettings.model

      // Set baseUrl based on provider
      const providerConfig = PROVIDER_CONFIG[userAISettings.provider]
      if (providerConfig && userAISettings.provider !== 'openai') {
        baseUrl = providerConfig.baseUrl
        console.warn(`🔌 Using ${providerConfig.name} provider via OpenAI-compatible API`)
      }
    }
    else {
      // Development fallback: use environment variables
      // eslint-disable-next-line node/prefer-global/process
      const envApiKey = process.env.OPENAI_API_KEY
      // eslint-disable-next-line node/prefer-global/process
      const envModel = process.env.OPENAI_MODEL || 'gpt-4o-mini'
      // eslint-disable-next-line node/prefer-global/process
      const envProvider = process.env.AI_PROVIDER || 'openai'

      if (!envApiKey) {
        throw new Error('API key required: Please provide your own API key in the extension settings, or set OPENAI_API_KEY environment variable for development.')
      }

      console.warn('🔧 Development mode: Using environment API key fallback')
      apiKey = envApiKey
      model = envModel

      // Set baseUrl for non-OpenAI providers in development
      if (envProvider !== 'openai' && envProvider in PROVIDER_CONFIG) {
        baseUrl = PROVIDER_CONFIG[envProvider as keyof typeof PROVIDER_CONFIG].baseUrl
        console.warn(`🔌 Development: Using ${envProvider} provider`)
      }
    }

    const config: OpenAIConfig = {
      apiKey,
      model: model as any, // Type assertion for environment model
      baseUrl,
      maxRetries: 3,
      timeout: 60000, // 60 seconds
      temperature: 0.1, // Low temperature for consistent extraction
    }

    return new OpenAIService(config)
  }
}
