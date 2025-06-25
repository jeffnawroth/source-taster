import type { ProcessedReference } from '@source-taster/types'
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

      // Step 2: Verify references one by one for live progress updates
      for (let i = 0; i < extractedRefs.length; i++) {
        const ref = extractedRefs[i]

        try {
          // Verify single reference
          const verificationResults = await ReferencesService.verifyReferences([ref])
          const result = verificationResults[0]

          // Update the specific reference
          if (result) {
            references.value[i] = {
              ...references.value[i],
              status: result.isVerified ? 'verified' : 'not-verified',
              verificationResult: result,
            }
          }
          else {
            references.value[i] = {
              ...references.value[i],
              status: 'error',
              error: 'No verification result found',
            }
          }
        }
        catch (error) {
          // Handle individual reference error
          references.value[i] = {
            ...references.value[i],
            status: 'error',
            error: error instanceof Error ? error.message : 'Verification failed',
          }
        }

        // Update processed count
        processedCount.value = i + 1
      }
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
