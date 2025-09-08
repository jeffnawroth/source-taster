import type { AIService, ApiAISettings, OpenAIConfig } from '@source-taster/types'
import process from 'node:process'
import { PROVIDER_CONFIG } from '@source-taster/types'
import { Unauthorized } from '@/api/errors/AppError'
import { loadApiKey } from '../../secrets/keystore'
import { OpenAIService } from './openaiService'

export class AIServiceFactory {
  static async createOpenAIService(userId: string, userAISettings: ApiAISettings): Promise<AIService> {
    const { provider, model } = userAISettings
    let apiKey = await loadApiKey(userId, provider)

    if (!apiKey) {
      if (process.env.NODE_ENV === 'development') {
        const envKey = process.env.OPENAI_API_KEY
        if (!envKey)
          throw Unauthorized('No API key for this client (and no OPENAI_API_KEY set)')
        console.warn('🔧 Dev fallback: using OPENAI_API_KEY from env')
        apiKey = envKey
      }
      else {
        throw Unauthorized('API key missing for this client. Please save your key first.')
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
