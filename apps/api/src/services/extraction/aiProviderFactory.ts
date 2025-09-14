import type { AIService, ApiAISettings, OpenAIConfig } from '@source-taster/types'
import process from 'node:process'
import { PROVIDER_CONFIG } from '@source-taster/types'
import { httpUnauthorized } from '@/api/errors/http'
import { loadApiKey } from '../../secrets/keystore'
import { OpenAIExtractionProvider } from './openAIExtractionProvider'

export class AIProviderFactory {
  static async createOpenAIService(userId: string, userAISettings: ApiAISettings): Promise<AIService> {
    const { provider, model } = userAISettings
    let apiKey = await loadApiKey(userId, provider)

    if (!apiKey) {
      if (process.env.NODE_ENV === 'development') {
        const envKey = process.env.OPENAI_API_KEY
        if (!envKey)
          throw httpUnauthorized('No API key for this client (and no OPENAI_API_KEY set)')
        console.warn('🔧 Dev fallback: using OPENAI_API_KEY from env')
        apiKey = envKey
      }
      else {
        throw httpUnauthorized('API key missing for this client. Please save your key first.')
      }
    }

    let baseUrl: string | undefined
    const providerCfg = PROVIDER_CONFIG[provider]
    if (providerCfg && provider !== 'openai') {
      baseUrl = providerCfg.baseUrl
      console.warn(`🔌 Using ${providerCfg.name} via OpenAI-compatible API`)
    }

    // GPT-5 models use different parameters for optimization
    let additionalParams = {}
    if (model.startsWith('gpt-5')) {
      // For GPT-5: Use minimal reasoning and low verbosity for fastest extraction
      additionalParams = {
        reasoning_effort: 'minimal', // Fastest response time
        verbosity: 'low', // Concise output
      }
    }

    const config: OpenAIConfig = {
      apiKey,
      model: model as any,
      baseUrl,
      maxRetries: 3,
      timeout: 60_000,
      temperature: 1.0, // All models use temperature 1.0 now
      ...additionalParams,
    }

    return new OpenAIExtractionProvider(config)
  }
}
