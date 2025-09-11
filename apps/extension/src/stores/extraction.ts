import type { ApiExtractData, ApiExtractReference, ApiResult } from '@source-taster/types'
import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import { ExtractionService } from '@/extension/services/extractionService'
import { settings } from '../logic'
import { mapApiError } from '../utils/mapApiError'

export const useExtractionStore = defineStore('extraction', () => {
  const extractedReferences = ref<ApiExtractReference[]>([])
  const originalText = ref<string>('')
  const isExtracting = ref(false)
  const extractionError = ref<string | null>(null)

  const totalExtractedReferences = computed(() => extractedReferences.value.length)
  const hasExtractedReferences = computed(() => extractedReferences.value.length > 0)

  const getExtractionStatus = computed(() => {
    if (isExtracting.value)
      return 'extracting'
    if (extractionError.value)
      return 'error'
    if (hasExtractedReferences.value)
      return 'completed'
    return 'idle'
  })

  const getReferenceById = computed(() => (referenceId: string) =>
    extractedReferences.value.find(ref => ref.id === referenceId),
  )

  async function extractReferences(text: string): Promise<ApiResult<ApiExtractData>> {
    isExtracting.value = true
    extractionError.value = null
    try {
      const res = await ExtractionService.extractReferences({
        text,
        extractionSettings: {
          extractionConfig: settings.value.extract.extractionConfig,
        },
        aiSettings: {
          model: settings.value.ai.model,
          provider: settings.value.ai.provider,
        },
      })

      if (!res.success) {
        extractionError.value = mapApiError(res)
        return res
      }

      extractedReferences.value = res.data?.references ?? []
      originalText.value = text
      return res
    }
    finally {
      isExtracting.value = false
    }
  }

  async function testApiKeyWithExtraction(): Promise<{ ok: boolean, message: string }> {
    try {
    // Minimaler Testtext (harmlos & kurz)
      const testText = 'Smith, J. (2024). A test paper. Journal of Testing, 1(1), 1–5. https://doi.org/10.1000/test'

      // Service direkt nutzen – KEINE State-Mutationen hier!
      const res = await ExtractionService.extractReferences({
        text: testText,
        extractionSettings: {
          extractionConfig: settings.value.extract.extractionConfig,
        },
        aiSettings: {
          model: settings.value.ai.model,
          provider: settings.value.ai.provider,
        },
      })

      if (!res.success) {
        return { ok: false, message: mapApiError(res) }
      }

      const count = res.data?.references?.length ?? 0
      return count > 0
        ? { ok: true, message: 'API-Key erfolgreich getestet.' }
        : { ok: false, message: 'Test ausgeführt, aber keine Referenzen erkannt.' }
    }
    catch (e: any) {
      return { ok: false, message: e?.message || 'Unbekannter Fehler beim Test.' }
    }
  }

  function addReference(reference: ApiExtractReference) {
    extractedReferences.value.push(reference)
  }

  function updateReference(referenceId: string, updated: Partial<ApiExtractReference>) {
    const i = extractedReferences.value.findIndex(ref => ref.id === referenceId)
    if (i !== -1)
      extractedReferences.value[i] = { ...extractedReferences.value[i], ...updated }
  }

  function removeReference(referenceId: string) {
    const i = extractedReferences.value.findIndex(ref => ref.id === referenceId)
    if (i !== -1)
      extractedReferences.value.splice(i, 1)
  }

  function clearExtractedReferences() {
    extractedReferences.value = []
    originalText.value = ''
    extractionError.value = null
  }

  function clearExtractionError() {
    extractionError.value = null
  }

  function getReferencesForMatching() {
    return extractedReferences.value.map(ref => ({ id: ref.id, metadata: ref.metadata }))
  }

  return {
    // State
    extractedReferences: readonly(extractedReferences),
    originalText: readonly(originalText),
    isExtracting: readonly(isExtracting),
    extractionError: readonly(extractionError),

    // Computed
    totalExtractedReferences,
    hasExtractedReferences,
    getExtractionStatus,
    getReferenceById,

    // Actions
    extractReferences,
    addReference,
    updateReference,
    removeReference,
    clearExtractedReferences,
    clearExtractionError,
    getReferencesForMatching,
    testApiKeyWithExtraction,
  }
})
