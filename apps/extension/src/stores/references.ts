import type { AnystyleTokenSequence, MatchingResult, Reference } from '@source-taster/types'
import type { ExtractedReference } from '../types/reference'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ReferencesService } from '@/extension/services/referencesService'
import { isScoreMatched } from '@/extension/utils/scoreUtils'

export const useReferencesStore = defineStore('references', () => {
  // State
  const inputText = ref('')
  const file = ref<File | null>(null)
  const references = ref<ExtractedReference[]>([])
  const isExtraction = ref(false)
  const currentPhase = ref<'idle' | 'extracting' | 'matching'>('idle')
  const extractedCount = ref(0)
  const totalCount = ref(0)
  const currentlyMatchingIndex = ref(-1)

  // AnyStyle parsed data
  const parsedTokens = ref<AnystyleTokenSequence[]>([])
  const showTokenEditor = ref(false)

  // Abort controller for cancellation
  let abortController: AbortController | null = null

  // Computed
  const progress = computed(() => {
    if (totalCount.value === 0)
      return 0
    return Math.round((extractedCount.value / totalCount.value) * 100)
  })

  const statusCounts = computed(() => ({
    matched: references.value.filter(r => r.status === 'matched').length,
    notMatched: references.value.filter(r => r.status === 'not-matched').length,
    error: references.value.filter(r => r.status === 'error').length,
    total: references.value.length,
  }))

  const currentlyMatchingReference = computed(() => {
    if (currentlyMatchingIndex.value >= 0 && currentlyMatchingIndex.value < references.value.length) {
      return references.value[currentlyMatchingIndex.value]
    }
    return null
  })

  // Helper function to get the best matching score from matching result
  function getBestMatchingScore(result: MatchingResult): number {
    if (!result.sourceEvaluations?.length) {
      return 0
    }
    return result.sourceEvaluations[0]?.matchDetails?.overallScore ?? 0
  }

  // Helper functions
  function handleExtractionError(error: unknown) {
    console.error('Error extraction references:', error)

    // Mark all references as error if they exist
    if (references.value.length > 0) {
      references.value = references.value.map(ref => ({
        ...ref,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }

  function initializeExtraction() {
    // Create new abort controller for this operation
    abortController = new AbortController()
    isExtraction.value = true
    currentPhase.value = 'extracting'
    references.value = []
    extractedCount.value = 0
    totalCount.value = 0
  }

  function finalizeExtraction() {
    isExtraction.value = false
    currentPhase.value = 'idle'
    currentlyMatchingIndex.value = -1
    abortController = null
  }

  function cancelExtraction() {
    if (abortController) {
      abortController.abort()
    }
    finalizeExtraction()
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
      status: 'pending',
    }))
    totalCount.value = extractedRefs.length
    return extractedRefs
  }

  async function matchReferenceSequentially(ref: Reference, index: number): Promise<void> {
    try {
      // Set currently matching index
      currentlyMatchingIndex.value = index

      // Match single reference
      const matchingResults = await ReferencesService.matchReferences([ref], abortController?.signal)
      const result = matchingResults[0]

      // Update the specific reference
      if (result) {
        // Use score-based matching with user-defined thresholds
        const matchingScore = getBestMatchingScore(result)
        const isMatched = isScoreMatched(matchingScore) // Use utility function with user-defined thresholds

        references.value[index] = {
          ...references.value[index],
          status: isMatched ? 'matched' : 'not-matched',
          matchingResult: result,
        }
      }
      else {
        references.value[index] = {
          ...references.value[index],
          status: 'error',
          error: 'No matching result found',
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
        error: error instanceof Error ? error.message : 'Matching failed',
      }
    }
    finally {
      // Always update extracted count and clear current index after matching
      extractedCount.value = index + 1
      currentlyMatchingIndex.value = -1
    }
  }

  async function matchAllReferences(extractedRefs: Reference[]): Promise<void> {
    currentPhase.value = 'matching'

    // Match references one by one for live progress updates
    for (let i = 0; i < extractedRefs.length; i++) {
      // Check if operation was cancelled
      if (abortController?.signal.aborted) {
        break
      }

      await matchReferenceSequentially(extractedRefs[i], i)
    }

    // All references are now matched, index is already cleared in matchReferenceSequentially
  }

  // Main action
  async function extractAndMatchReferences() {
    if (!inputText.value.trim())
      return

    try {
      initializeExtraction()

      const extractedRefs = await extractReferences()

      // Check if cancelled during extraction
      if (abortController?.signal.aborted) {
        return
      }

      if (extractedRefs.length === 0)
        return

      // Use intelligent matching by default (automatically chooses website vs database matching)
      await matchAllReferences(extractedRefs)
    }
    catch (error) {
      // Don't handle as error if it was just cancelled
      if (abortController?.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
        return
      }
      handleExtractionError(error)
    }
    finally {
      finalizeExtraction()
    }
  }

  function clearReferences() {
    references.value = []
    inputText.value = ''
    extractedCount.value = 0
    totalCount.value = 0
    currentPhase.value = 'idle'
    currentlyMatchingIndex.value = -1
  }

  // Re-match a single reference by index
  async function reMatchReference(index: number) {
    if (index < 0 || index >= references.value.length) {
      console.error('Invalid reference index for re-matching:', index)
      return
    }

    // Prevent concurrent operations - check if another matching is already running
    if (currentlyMatchingIndex.value >= 0) {
      console.warn('Cannot start re-matching: another matching is already in progress')
      return
    }

    // Prevent starting re-match during main extraction
    if (isExtraction.value) {
      console.warn('Cannot start re-matching: main extraction is in progress')
      return
    }

    const reference = references.value[index]

    // Store the original state to restore if cancelled
    const originalReference = { ...reference }

    // Create new abort controller for this re-matching
    const reMatchController = new AbortController()

    // Store reference to the current abort controller for this operation
    const previousController = abortController
    abortController = reMatchController

    // Set the reference back to pending status
    references.value[index] = {
      ...reference,
      status: 'pending',
      error: undefined,
      matchingResult: undefined,
    }

    try {
      // Set currently matching index
      currentlyMatchingIndex.value = index

      // Check if operation was cancelled before starting
      if (reMatchController.signal.aborted) {
        // Restore original state if cancelled before starting
        references.value[index] = originalReference
        return
      }

      // Create a fresh reference object for matching
      const refToMatch: Reference = {
        id: reference.id,
        originalText: reference.originalText,
        metadata: reference.metadata,
      }

      // Match the reference with abort signal
      const matchingResults = await ReferencesService.matchReferences([refToMatch], reMatchController.signal)

      // Check if operation was cancelled after matching
      if (reMatchController.signal.aborted) {
        // Restore original state if cancelled after matching
        references.value[index] = originalReference
        return
      }

      const result = matchingResults[0]

      // Update the specific reference
      if (result) {
        // Use score-based matching with user-defined thresholds
        const matchingScore = getBestMatchingScore(result)
        const isMatched = isScoreMatched(matchingScore) // Use utility function with user-defined thresholds

        references.value[index] = {
          ...references.value[index],
          status: isMatched ? 'matched' : 'not-matched',
          matchingResult: result,
        }
      }
      else {
        references.value[index] = {
          ...references.value[index],
          status: 'error',
          error: 'No matching result found',
        }
      }
    }
    catch (error) {
      // Don't handle as error if it was just cancelled
      if (reMatchController.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
        // Restore original state if cancelled during matching
        references.value[index] = originalReference
        return
      }

      // Handle matching error
      references.value[index] = {
        ...references.value[index],
        status: 'error',
        error: error instanceof Error ? error.message : 'Re-matching failed',
      }
    }
    finally {
      // Clear currently matching index
      currentlyMatchingIndex.value = -1

      // Restore previous abort controller
      abortController = previousController
    }
  }

  return {
    // State
    inputText,
    references,
    isExtraction,
    currentPhase,
    extractedCount,
    totalCount,
    file,
    currentlyMatchingIndex,

    // AnyStyle data
    parsedTokens,
    showTokenEditor,

    // Computed
    progress,
    statusCounts,
    currentlyMatchingReference,

    // Actions
    extractAndMatchReferences,
    clearReferences,
    cancelExtraction,
    reMatchReference,
    // matchReferenceWebsite,
  }
})
