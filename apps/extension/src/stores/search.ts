// extension/stores/search.ts
import type {
  ApiHttpError,
  ApiSearchCandidate,
  ApiSearchRequest,
} from '@source-taster/types'
import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import { SearchService } from '@/extension/services/searchService'
import { mapApiError } from '@/extension/utils/mapApiError'

export const useSearchStore = defineStore('search', () => {
  // State
  const candidates = ref<Map<string, ApiSearchCandidate>>(new Map())
  const searchResults = ref<Map<string, string[]>>(new Map()) // referenceId -> candidateIds[]
  const isSearching = ref(false)
  const searchError = ref<string | null>(null)

  // Computed
  const totalCandidates = computed(() => candidates.value.size)

  const getCandidatesByReference = computed(() => {
    return (referenceId: string): ApiSearchCandidate[] => {
      const candidateIds = searchResults.value.get(referenceId) || []
      return candidateIds
        .map(id => candidates.value.get(id))
        .filter(Boolean) as ApiSearchCandidate[]
    }
  })

  // Actions
  async function searchCandidates(request: ApiSearchRequest) {
    isSearching.value = true
    searchError.value = null

    const res = await SearchService.searchCandidates(request)

    if (!res.success) {
      searchError.value = mapApiError(res as ApiHttpError)
      isSearching.value = false
      return res
    }

    const data = res.data
    for (const result of data.results) {
      const ids: string[] = []
      for (const cand of result.candidates) {
        candidates.value.set(cand.id, cand)
        ids.push(cand.id)
      }
      searchResults.value.set(result.referenceId, ids)
    }

    isSearching.value = false
    return res
  }

  function getCandidateById(candidateId: string): ApiSearchCandidate | undefined {
    return candidates.value.get(candidateId)
  }

  function getCandidatesByReferenceId(referenceId: string): ApiSearchCandidate[] {
    const ids = searchResults.value.get(referenceId) || []
    return ids.map(id => candidates.value.get(id)).filter(Boolean) as ApiSearchCandidate[]
  }

  function clearSearchResults() {
    candidates.value.clear()
    searchResults.value.clear()
    searchError.value = null
  }

  function clearSearchError() {
    searchError.value = null
  }

  return {
    // State
    candidates: readonly(candidates),
    searchResults: readonly(searchResults),
    isSearching: readonly(isSearching),
    searchError: readonly(searchError),

    // Computed
    totalCandidates,
    getCandidatesByReference,

    // Actions
    searchCandidates,
    getCandidateById,
    getCandidatesByReferenceId,
    clearSearchResults,
    clearSearchError,
  }
})
