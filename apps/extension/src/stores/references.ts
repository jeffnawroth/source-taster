import type { ProcessedReference, Reference } from '@source-taster/types'
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
  const currentlyVerifyingIndex = ref(-1)

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

  const currentlyVerifyingReference = computed(() => {
    if (currentlyVerifyingIndex.value >= 0 && currentlyVerifyingIndex.value < references.value.length) {
      return references.value[currentlyVerifyingIndex.value]
    }
    return null
  })

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

  async function extractReferences(): Promise<Reference[]> {
    const extractedRefs = await ReferencesService.extractReferences(inputText.value)

    if (extractedRefs.length === 0) {
      references.value = []
      return []
    }

    // Initialize references with pending status
    references.value = extractedRefs.map(ref => ({
      ...ref,
      status: 'pending' as const,
    }))

    totalCount.value = extractedRefs.length
    return extractedRefs
  }

  async function verifyReferenceSequentially(ref: Reference, index: number): Promise<void> {
    try {
      // Set currently verifying index
      currentlyVerifyingIndex.value = index

      // Verify single reference
      const verificationResults = await ReferencesService.verifyReferences([ref])
      const result = verificationResults[0]

      // Update the specific reference
      if (result) {
        references.value[index] = {
          ...references.value[index],
          status: result.isVerified ? 'verified' : 'not-verified',
          verificationResult: result,
        }
      }
      else {
        references.value[index] = {
          ...references.value[index],
          status: 'error',
          error: 'No verification result found',
        }
      }
    }
    catch (error) {
      // Handle individual reference error
      references.value[index] = {
        ...references.value[index],
        status: 'error',
        error: error instanceof Error ? error.message : 'Verification failed',
      }
    }
    finally {
      // Always update processed count and clear current index after verification
      processedCount.value = index + 1
      currentlyVerifyingIndex.value = -1
    }
  }

  async function verifyAllReferences(extractedRefs: Reference[]): Promise<void> {
    currentPhase.value = 'verifying'

    // Verify references one by one for live progress updates
    for (let i = 0; i < extractedRefs.length; i++) {
      await verifyReferenceSequentially(extractedRefs[i], i)
    }

    // All references are now verified, index is already cleared in verifyReferenceSequentially
  }

  // Main action
  async function extractAndVerifyReferences() {
    if (!inputText.value.trim())
      return

    try {
      initializeProcessing()

      const extractedRefs = await extractReferences()
      if (extractedRefs.length === 0)
        return

      await verifyAllReferences(extractedRefs)
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
    currentlyVerifyingIndex.value = -1
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
    currentlyVerifyingIndex,

    // Computed
    progress,
    statusCounts,
    currentlyVerifyingReference,

    // Actions
    extractAndVerifyReferences,
    clearReferences,
  }
})
