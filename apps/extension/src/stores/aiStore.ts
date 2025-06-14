// src/stores/aiStore.ts

import type { ReferenceMetadata } from '../types'

import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import { extractReferencesMetadata } from '../services/aiService'

export const useAiStore = defineStore('ai', () => {
  const isExtractingReferences = ref(false)

  async function extractReferences(prompt: string): Promise<ReferenceMetadata[] | null> {
    isExtractingReferences.value = true

    const result = await extractReferencesMetadata(prompt)

    isExtractingReferences.value = false
    return result
  }

  return {
    extractReferences,
    isExtractingReferences,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAiStore, import.meta.hot))
}
