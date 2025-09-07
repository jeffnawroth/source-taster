import type { APISearchCandidate, ApiSearchRequest } from '@source-taster/types'
/**
 * Pinia store for managing search functionality and candidates
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { SearchService } from '@/extension/services/searchService'

export const useSearchStore = defineStore('search', () => {
  // State
  const candidates = ref<Map<string, APISearchCandidate>>(new Map())
  const searchResults = ref<Map<string, string[]>>(new Map()) // referenceId -> candidateIds[]
  const isSearching = ref(false)
  const searchError = ref<string | null>(null)

  // Computed
  const totalCandidates = computed(() => candidates.value.size)

  const getCandidatesByReference = computed(() => {
    return (referenceId: string): APISearchCandidate[] => {
      const candidateIds = searchResults.value.get(referenceId) || []
      return candidateIds.map(id => candidates.value.get(id)).filter(Boolean) as APISearchCandidate[]
    }
  })

  // Actions
  async function searchCandidates(request: ApiSearchRequest) {
    isSearching.value = true
    searchError.value = null

    try {
      const response = await SearchService.searchCandidates(request)

      if (response.success && response.data) {
        // Store all candidates with their IDs as keys
        for (const result of response.data.results) {
          const candidateIds: string[] = []

          for (const candidate of result.candidates) {
            candidates.value.set(candidate.id, candidate)
            candidateIds.push(candidate.id)
          }

          // Store mapping of referenceId to candidateIds
          searchResults.value.set(result.referenceId, candidateIds)
        }
      }

      return response
    }
    catch (error) {
      searchError.value = error instanceof Error ? error.message : 'Search failed'
      throw error
    }
    finally {
      isSearching.value = false
    }
  }

  function getCandidateById(candidateId: string): APISearchCandidate | undefined {
    return candidates.value.get(candidateId)
  }

  function getCandidatesByReferenceId(referenceId: string): APISearchCandidate[] {
    const candidateIds = searchResults.value.get(referenceId) || []
    return candidateIds.map(id => candidates.value.get(id)).filter(Boolean) as APISearchCandidate[]
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
