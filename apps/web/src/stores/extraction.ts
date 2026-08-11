import type { ApiAISettings, ApiExtractReference } from '@source-taster/types'
import { defineStore } from 'pinia'
import { extractWithAnystyle } from '@/services/anystyleService'
import { extractReferences } from '@/services/extractionService'

export const useExtractionStore = defineStore('extraction', {
  state: () => ({
    references: [] as ApiExtractReference[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async extract(text: string, aiSettings?: ApiAISettings) {
      this.loading = true
      this.error = null
      try {
        const references = aiSettings
          ? (await extractReferences(text, aiSettings)).references
          : await extractWithAnystyle(text)
        this.references = references
      }
      catch (e) {
        this.error = e instanceof Error ? e.message : 'Extraction failed'
      }
      finally {
        this.loading = false
      }
    },
    removeReference(id: string) {
      this.references = this.references.filter(r => r.id !== id)
    },
  },
})
