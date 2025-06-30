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

  // Abort controller for cancellation
  let abortController: AbortController | null = null

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
    // Create new abort controller for this operation
    abortController = new AbortController()
    isProcessing.value = true
    currentPhase.value = 'extracting'
    references.value = []
    processedCount.value = 0
    totalCount.value = 0
  }

  function finalizeProcessing() {
    isProcessing.value = false
    currentPhase.value = 'idle'
    currentlyVerifyingIndex.value = -1
    abortController = null
  }

  function cancelProcessing() {
    if (abortController) {
      abortController.abort()
    }
    finalizeProcessing()
  }

  async function extractReferences(): Promise<Reference[]> {
    // Check if operation was cancelled before starting
    if (abortController?.signal.aborted) {
      return []
    }

    const extractedRefs = await ReferencesService.extractReferences(inputText.value, abortController?.signal)

    // Check again if operation was cancelled after extraction
    if (abortController?.signal.aborted) {
      return []
    }

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
      const verificationResults = await ReferencesService.verifyReferences([ref], abortController?.signal)
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
      // Don't handle as error if it was just cancelled
      if (abortController?.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
        return
      }

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
      // Check if operation was cancelled
      if (abortController?.signal.aborted) {
        break
      }

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

      // Check if cancelled during extraction
      if (abortController?.signal.aborted) {
        return
      }

      if (extractedRefs.length === 0)
        return

      await verifyAllReferences(extractedRefs)
    }
    catch (error) {
      // Don't handle as error if it was just cancelled
      if (abortController?.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
        return
      }
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

  // Re-verify a single reference by index
  async function reVerifyReference(index: number) {
    if (index < 0 || index >= references.value.length) {
      console.error('Invalid reference index for re-verification:', index)
      return
    }

    // Prevent concurrent operations - check if another verification is already running
    if (currentlyVerifyingIndex.value >= 0) {
      console.warn('Cannot start re-verification: another verification is already in progress')
      return
    }

    // Prevent starting re-verify during main processing
    if (isProcessing.value) {
      console.warn('Cannot start re-verification: main processing is in progress')
      return
    }

    const reference = references.value[index]

    // Store the original state to restore if cancelled
    const originalReference = { ...reference }

    // Create new abort controller for this re-verification
    const reVerifyController = new AbortController()

    // Store reference to the current abort controller for this operation
    const previousController = abortController
    abortController = reVerifyController

    // Set the reference back to pending status
    references.value[index] = {
      ...reference,
      status: 'pending',
      error: undefined,
      verificationResult: undefined,
    }

    try {
      // Set currently verifying index
      currentlyVerifyingIndex.value = index

      // Check if operation was cancelled before starting
      if (reVerifyController.signal.aborted) {
        // Restore original state if cancelled before starting
        references.value[index] = originalReference
        return
      }

      // Create a fresh reference object for verification
      const refToVerify: Reference = {
        id: reference.id,
        originalText: reference.originalText,
        metadata: reference.metadata,
      }

      // Verify the reference with abort signal
      const verificationResults = await ReferencesService.verifyReferences([refToVerify], reVerifyController.signal)

      // Check if operation was cancelled after verification
      if (reVerifyController.signal.aborted) {
        // Restore original state if cancelled after verification
        references.value[index] = originalReference
        return
      }

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
      // Don't handle as error if it was just cancelled
      if (reVerifyController.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
        // Restore original state if cancelled during verification
        references.value[index] = originalReference
        return
      }

      // Handle verification error
      references.value[index] = {
        ...references.value[index],
        status: 'error',
        error: error instanceof Error ? error.message : 'Re-verification failed',
      }
    }
    finally {
      // Clear currently verifying index
      currentlyVerifyingIndex.value = -1

      // Restore previous abort controller
      abortController = previousController
    }
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
    cancelProcessing,
    reVerifyReference,
  }
})
