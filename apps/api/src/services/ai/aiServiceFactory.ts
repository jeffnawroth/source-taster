import type { AIService, ApiAISettings, OpenAIConfig } from '@source-taster/types'
import process from 'node:process'
import { PROVIDER_CONFIG } from '@source-taster/types'
import { loadApiKey } from '../../secrets/keystore'
import { OpenAIService } from './openaiService'

export class AIServiceFactory {
  static async createOpenAIService(userId: string, userAISettings: ApiAISettings): Promise<AIService> {
    const { provider, model } = userAISettings
    if (!provider || !model) {
      throw new Error('AI provider and model are required')
    }

    // 1) aus Keystore laden
    let apiKey = await loadApiKey(userId, provider)

    // 2) Dev-Fallback (optional)
    if (!apiKey) {
      if (process.env.NODE_ENV === 'development') {
        const envKey = process.env.OPENAI_API_KEY
        if (!envKey)
          throw new Error('No API key found for this client in dev: set OPENAI_API_KEY or save a key via /api/user/ai-secrets')
        console.warn('🔧 Dev fallback: using OPENAI_API_KEY from environment')
        apiKey = envKey
      }
      else {
        throw new Error('API key missing for this client. Please save your key first.')
      }
    }

    let baseUrl: string | undefined
    const providerCfg = PROVIDER_CONFIG[provider]
    if (providerCfg && provider !== 'openai') {
      baseUrl = providerCfg.baseUrl
      console.warn(`🔌 Using ${providerCfg.name} via OpenAI-compatible API`)
    }

    const config: OpenAIConfig = {
      apiKey,
      model: model as any,
      baseUrl,
      maxRetries: 3,
      timeout: 60_000,
      temperature: 0.1,
    }

    return new OpenAIService(config)
  }
}
