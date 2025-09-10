// extension/stores/matching.ts
/**
 * Pinia store for managing matching functionality and results
 */
import type {
  ApiHttpError,
  ApiMatchData,
  ApiMatchRequest,
} from '@source-taster/types'
import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import { MatchingService } from '@/extension/services/matchingService'
import { mapApiError } from '../utils/mapApiError'
import { useSearchStore } from './search'

export const useMatchingStore = defineStore('matching', () => {
  // State
  const matchingResults = ref<Map<string, ApiMatchData>>(new Map()) // referenceId -> MatchingResult
  const isMatching = ref(false)
  const matchingError = ref<string | null>(null)

  // Computed
  const totalMatchedReferences = computed(() => matchingResults.value.size)

  const getMatchingResultByReference = computed(() => {
    return (referenceId: string): ApiMatchData | undefined => matchingResults.value.get(referenceId)
  })

  const getBestMatchByReference = computed(() => (referenceId: string) => {
    const evs = matchingResults.value.get(referenceId)?.evaluations ?? []
    if (evs.length === 0)
      return undefined
    return [...evs].sort((a, b) => (b.matchDetails.overallScore ?? 0) - (a.matchDetails.overallScore ?? 0))[0]
  })

  const getMatchingScoreByReference = computed(() => {
    return (referenceId: string): number => {
      const best = getBestMatchByReference.value(referenceId)
      return best?.matchDetails.overallScore ?? 0
    }
  })

  // Actions
  async function matchReference(request: ApiMatchRequest) {
    isMatching.value = true
    matchingError.value = null

    try {
      const res = await MatchingService.matchReference(request)

      if (!res.success) {
        matchingError.value = mapApiError(res as ApiHttpError)
        return res
      }

      const data = res.data
      const evaluations = data?.evaluations ?? []

      const referenceId = request.reference.id

      matchingResults.value.set(referenceId, { evaluations })

      return res
    }
    finally {
      isMatching.value = false
    }
  }

  function getSourceEvaluationWithCandidate(referenceId: string, evaluationIndex = 0) {
    const searchStore = useSearchStore()
    const result = matchingResults.value.get(referenceId)
    const evaluation = result?.evaluations?.[evaluationIndex]
    if (!evaluation)
      return null

    // hole den vollständigen Kandidaten aus dem Search-Store
    const candidate = searchStore.getCandidateById(evaluation.candidateId)
    return { evaluation, candidate }
  }

  function getAllEvaluationsWithCandidates(referenceId: string) {
    const searchStore = useSearchStore()
    const result = matchingResults.value.get(referenceId)
    if (!result?.evaluations)
      return []
    return result.evaluations.map(evaluation => ({
      evaluation,
      candidate: searchStore.getCandidateById(evaluation.candidateId),
    }))
  }

  function clearMatchingResults() {
    matchingResults.value.clear()
    matchingError.value = null
  }

  function clearMatchingError() {
    matchingError.value = null
  }

  return {
    // State (readonly herausgeben)
    matchingResults: readonly(matchingResults),
    isMatching: readonly(isMatching),
    matchingError: readonly(matchingError),

    // Computed
    totalMatchedReferences,
    getMatchingResultByReference,
    getBestMatchByReference,
    getMatchingScoreByReference,

    // Actions
    matchReference,
    getSourceEvaluationWithCandidate,
    getAllEvaluationsWithCandidates,
    clearMatchingResults,
    clearMatchingError,
  }
})
