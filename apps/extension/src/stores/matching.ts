/**
 * Pinia store for managing matching functionality and results
 */
import type { MatchingRequest, MatchingResult, SourceEvaluation } from '@source-taster/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { MatchingService } from '@/extension/services/matchingService'
import { useSearchStore } from './search'

export const useMatchingStore = defineStore('matching', () => {
  // State
  const matchingResults = ref<Map<string, MatchingResult>>(new Map()) // referenceId -> MatchingResult
  const isMatching = ref(false)
  const matchingError = ref<string | null>(null)

  // Computed
  const totalMatchedReferences = computed(() => matchingResults.value.size)

  const getMatchingResultByReference = computed(() => {
    return (referenceId: string): MatchingResult | undefined => {
      return matchingResults.value.get(referenceId)
    }
  })

  const getBestMatchByReference = computed(() => {
    return (referenceId: string): SourceEvaluation | undefined => {
      const result = matchingResults.value.get(referenceId)
      return result?.sourceEvaluations?.[0] // First is best (sorted by score)
    }
  })

  const getMatchingScoreByReference = computed(() => {
    return (referenceId: string): number => {
      const bestMatch = getBestMatchByReference.value(referenceId)
      return bestMatch?.matchDetails.overallScore || 0
    }
  })

  // Actions
  async function matchReferences(request: MatchingRequest) {
    isMatching.value = true
    matchingError.value = null

    try {
      const response = await MatchingService.matchReferences(request)

      if (response.success && response.data) {
        // Store the matching result directly (single result for matching endpoint)
        // Note: The /api/match endpoint returns { result: MatchingResult }
        // We need to map this to individual reference results
        const result = response.data.result
        if (result && result.sourceEvaluations) {
          // Group evaluations by referenceId (since evaluations now have referenceId)
          for (const evaluation of result.sourceEvaluations) {
            const referenceId = evaluation.referenceId

            // Get existing result or create new one
            let existingResult = matchingResults.value.get(referenceId)
            if (!existingResult) {
              existingResult = { sourceEvaluations: [] }
              matchingResults.value.set(referenceId, existingResult)
            }

            // Add this evaluation
            existingResult.sourceEvaluations = existingResult.sourceEvaluations || []
            existingResult.sourceEvaluations.push(evaluation)
          }
        }
      }

      return response
    }
    catch (error) {
      matchingError.value = error instanceof Error ? error.message : 'Matching failed'
      throw error
    }
    finally {
      isMatching.value = false
    }
  }

  function getSourceEvaluationWithCandidate(referenceId: string, evaluationIndex: number = 0) {
    const searchStore = useSearchStore()
    const result = matchingResults.value.get(referenceId)
    const evaluation = result?.sourceEvaluations?.[evaluationIndex]

    if (!evaluation)
      return null

    // Get the full candidate data from search store
    const candidate = searchStore.getCandidateById(evaluation.candidateId)

    return {
      evaluation,
      candidate,
    }
  }

  function getAllEvaluationsWithCandidates(referenceId: string) {
    const searchStore = useSearchStore()
    const result = matchingResults.value.get(referenceId)

    if (!result?.sourceEvaluations)
      return []

    return result.sourceEvaluations.map((evaluation) => {
      const candidate = searchStore.getCandidateById(evaluation.candidateId)
      return {
        evaluation,
        candidate,
      }
    })
  }

  function clearMatchingResults() {
    matchingResults.value.clear()
    matchingError.value = null
  }

  function clearMatchingError() {
    matchingError.value = null
  }

  return {
    // State
    matchingResults: readonly(matchingResults),
    isMatching: readonly(isMatching),
    matchingError: readonly(matchingError),

    // Computed
    totalMatchedReferences,
    getMatchingResultByReference,
    getBestMatchByReference,
    getMatchingScoreByReference,

    // Actions
    matchReferences,
    getSourceEvaluationWithCandidate,
    getAllEvaluationsWithCandidates,
    clearMatchingResults,
    clearMatchingError,
  }
})
