import type { ApiAIModel, ApiAIProvider } from '@source-taster/types'
import { defineStore } from 'pinia'
import { getAiSecretInfo } from '@/services/aiSecretsService'

export const useAiSettingsStore = defineStore('aiSettings', {
  state: () => ({
    provider: 'openai' as ApiAIProvider,
    model: 'gpt-5-mini' as ApiAIModel,
    hasApiKey: null as boolean | null,
  }),
  actions: {
    async loadInfo() {
      try {
        const info = await getAiSecretInfo()
        this.hasApiKey = info.hasApiKey
        if (info.provider)
          this.provider = info.provider
      }
      catch {
        this.hasApiKey = false
      }
    },
  },
})
