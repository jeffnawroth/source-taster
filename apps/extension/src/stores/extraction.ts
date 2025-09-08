/**
 * Pinia store for managing extraction functionality and results
 */
import type { ApiExtractReference } from '@source-taster/types'
import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import { aiSettings, extractionSettings } from '@/extension/logic/storage'
import { ExtractionService } from '@/extension/services/extractionService'

export const useExtractionStore = defineStore('extraction', () => {
  // State
  const extractedReferences = ref<ApiExtractReference[]>([])
  const originalText = ref<string>('')
  const isExtracting = ref(false)
  const extractionError = ref<string | null>(null)

  // Computed
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

  const getReferenceById = computed(() => {
    return (referenceId: string): ApiExtractReference | undefined => {
      return extractedReferences.value.find(ref => ref.id === referenceId)
    }
  })

  // Actions
  async function extractReferences(text: string) {
    isExtracting.value = true
    extractionError.value = null

    try {
      const response = await ExtractionService.extractReferences({
        text,
        extractionSettings: extractionSettings.value,
        aiSettings: aiSettings.value,
      })

      if (response.success && response.data) {
        extractedReferences.value = response.data.references
        originalText.value = text
      }

      return response
    }
    catch (error) {
      extractionError.value = error instanceof Error ? error.message : 'Extraction failed'
      throw error
    }
    finally {
      isExtracting.value = false
    }
  }

  function addReference(reference: ApiExtractReference) {
    extractedReferences.value.push(reference)
  }

  function updateReference(referenceId: string, updatedReference: Partial<ApiExtractReference>) {
    const index = extractedReferences.value.findIndex(ref => ref.id === referenceId)
    if (index !== -1) {
      extractedReferences.value[index] = {
        ...extractedReferences.value[index],
        ...updatedReference,
      }
    }
  }

  function removeReference(referenceId: string) {
    const index = extractedReferences.value.findIndex(ref => ref.id === referenceId)
    if (index !== -1) {
      extractedReferences.value.splice(index, 1)
    }
  }

  function clearExtractedReferences() {
    extractedReferences.value = []
    originalText.value = ''
    extractionError.value = null
  }

  function clearExtractionError() {
    extractionError.value = null
  }

  // Helper to get references formatted for search/matching
  function getReferencesForMatching() {
    return extractedReferences.value.map(ref => ({
      id: ref.id,
      metadata: ref.metadata,
    }))
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
  }
})
