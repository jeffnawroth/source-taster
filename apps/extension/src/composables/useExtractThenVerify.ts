import type { ApiExtractData, ApiResult } from '@source-taster/types'
// src/composables/useExtractThenVerify.ts
import { ref } from 'vue'
import { useVerification } from '@/extension/composables/useVerification'
import { useExtractionStore } from '@/extension/stores/extraction'
import { mapApiError } from '@/extension/utils/mapApiError'

export function useExtractThenVerify() {
  const extractionStore = useExtractionStore()
  const { verify } = useVerification()

  const isRunning = ref(false)
  const error = ref<string | null>(null)

  /**
   * 1) KI-Extraktion (schreibt ins extractionStore)
   * 2) Verifizieren (nutzt Search-DB-Prioritäten, Early Termination, Matching)
   */
  async function extractThenVerify(text: string): Promise<ApiResult<ApiExtractData>> {
    isRunning.value = true
    error.value = null

    // Schritt 1: Extract
    const res = await extractionStore.extractReferences(text)
    if (!res.success) {
      error.value = mapApiError(res as any)
      isRunning.value = false
      return res
    }

    // Schritt 2: Verify
    await verify()

    isRunning.value = false
    return res
  }

  return {
    extractThenVerify,
    isRunning,
    error,
  }
}
