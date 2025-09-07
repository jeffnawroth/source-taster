/**
 * Pinia store for managing extraction functionality and results
 */
import type { ExtractionRequest, Reference } from '@source-taster/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ExtractionService } from '@/extension/services/extractionService'

export const useExtractionStore = defineStore('extraction', () => {
  // State
  const extractedReferences = ref<Reference[]>([])
  const originalText = ref<string>('')
  const isExtracting = ref(false)
  const extractionError = ref<string | null>(null)
  const lastExtractionSettings = ref<any>(null)

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
    return (referenceId: string): Reference | undefined => {
      return extractedReferences.value.find(ref => ref.id === referenceId)
    }
  })

  // Actions
  async function extractReferences(request: ExtractionRequest) {
    isExtracting.value = true
    extractionError.value = null

    try {
      const response = await ExtractionService.extractReferences(request)

      if (response.success && response.data) {
        extractedReferences.value = response.data.references
        originalText.value = request.text
        lastExtractionSettings.value = {
          extractionSettings: request.extractionSettings,
          aiSettings: request.aiSettings,
        }
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

  function addReference(reference: Reference) {
    extractedReferences.value.push(reference)
  }

  function updateReference(referenceId: string, updatedReference: Partial<Reference>) {
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
    lastExtractionSettings.value = null
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
    lastExtractionSettings: readonly(lastExtractionSettings),

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
