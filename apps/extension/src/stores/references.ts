import type { ProcessedReference, VerificationResult } from '@source-taster/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ReferencesService } from '@/extension/services/referencesService'

export const useReferencesStore = defineStore('references', () => {
  // State
  const inputText = ref('')
  const file = ref<File | null>(null)
  const references = ref<ProcessedReference[]>([])
  const isProcessing = ref(false)
  const currentPhase = ref<'idle' | 'extracting' | 'verifying'>('idle')
  const processedCount = ref(0)
  const totalCount = ref(0)

  // Computed
  const progress = computed(() => {
    if (totalCount.value === 0)
      return 0
    return Math.round((processedCount.value / totalCount.value) * 100)
  })

  const statusCounts = computed(() => ({
    verified: references.value.filter(r => r.status === 'verified').length,
    notVerified: references.value.filter(r => r.status === 'not-verified').length,
    error: references.value.filter(r => r.status === 'error').length,
    total: references.value.length,
  }))

  // Helper functions
  function applyVerificationResults(verificationResults: VerificationResult[]) {
    references.value = references.value.map((ref) => {
      const result = verificationResults.find(r => r.referenceId === ref.id)
      if (result) {
        return {
          ...ref,
          status: result.isVerified ? 'verified' : 'not-verified',
          verificationResult: result,
        }
      }
      else {
        return {
          ...ref,
          status: 'error',
          error: 'No verification result found',
        }
      }
    })
    processedCount.value = totalCount.value
  }

  function handleProcessingError(error: unknown) {
    console.error('Error processing references:', error)

    // Mark all references as error if they exist
    if (references.value.length > 0) {
      references.value = references.value.map(ref => ({
        ...ref,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }

  function initializeProcessing() {
    isProcessing.value = true
    currentPhase.value = 'extracting'
    references.value = []
    processedCount.value = 0
    totalCount.value = 0
  }

  function finalizeProcessing() {
    isProcessing.value = false
    currentPhase.value = 'idle'
  }

  // Main action
  async function extractAndVerifyReferences() {
    if (!inputText.value.trim())
      return

    try {
      initializeProcessing()

      // Step 1: Extract references
      const extractedRefs = await ReferencesService.extractReferences(inputText.value)

      if (extractedRefs.length === 0) {
        references.value = []
        return
      }

      // Initialize references with pending status
      references.value = extractedRefs.map(ref => ({
        ...ref,
        status: 'pending' as const,
      }))

      totalCount.value = extractedRefs.length
      currentPhase.value = 'verifying'

      // Step 2: Verify references
      const verificationResults = await ReferencesService.verifyReferences(extractedRefs)

      // Step 3: Apply verification results
      applyVerificationResults(verificationResults)
    }
    catch (error) {
      handleProcessingError(error)
    }
    finally {
      finalizeProcessing()
    }
  }

  function clearReferences() {
    references.value = []
    inputText.value = ''
    processedCount.value = 0
    totalCount.value = 0
    currentPhase.value = 'idle'
  }

  return {
    // State
    inputText,
    references,
    isProcessing,
    currentPhase,
    processedCount,
    totalCount,
    file,

    // Computed
    progress,
    statusCounts,

    // Actions
    extractAndVerifyReferences,
    clearReferences,
  }
})
