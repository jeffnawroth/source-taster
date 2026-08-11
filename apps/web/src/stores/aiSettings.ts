import type { ApiAIModel, ApiAIProvider } from '@source-taster/types'
import { defineStore } from 'pinia'
import { deleteAiSecret, getAiSecretInfo, saveAiSecret } from '@/services/aiSecretsService'

export const useAiSettingsStore = defineStore('aiSettings', {
  state: () => ({
    provider: 'openai' as ApiAIProvider,
    model: 'gpt-5-mini' as ApiAIModel,
    hasApiKey: null as boolean | null,
  }),
  actions: {
    async loadInfo() {
      try {
        const info = await getAiSecretInfo(this.provider)
        this.hasApiKey = info.hasApiKey
        if (info.provider)
          this.provider = info.provider
      }
      catch {
        this.hasApiKey = false
      }
    },
    async save(apiKey: string) {
      try {
        await saveAiSecret(this.provider, apiKey)
        this.hasApiKey = true
      }
      catch {
        this.hasApiKey = false
      }
    },
    async remove() {
      try {
        await deleteAiSecret(this.provider)
        this.hasApiKey = false
      }
      catch {
        this.hasApiKey = false
      }
    },
  },
})
