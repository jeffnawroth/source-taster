// extension/stores/search.ts
import type {
  ApiHttpError,
  ApiSearchCandidate,
  ApiSearchData,
  ApiSearchRequest,
  ApiSearchSource,
} from '@source-taster/types'
import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import { settings } from '@/extension/logic'
import { SearchService } from '@/extension/services/searchService'
import { mapApiError } from '@/extension/utils/mapApiError'

export const useSearchStore = defineStore('search', () => {
  // ---------- State ----------
  const candidates = ref<Map<string, ApiSearchCandidate>>(new Map())
  const searchResults = ref<Map<string, string[]>>(new Map()) // referenceId -> candidateIds[]
  const isSearching = ref(false)
  const searchError = ref<string | null>(null)

  // ---------- Computed ----------
  const totalCandidates = computed(() => candidates.value.size)

  // Use database settings from user preferences
  const databasesByPriority = computed(() => {
    return settings.value.search.databases
      .filter(db => db.enabled)
      .sort((a, b) => a.priority - b.priority)
  })
  const getCandidatesByReference = computed(() => {
    return (referenceId: string): ApiSearchCandidate[] => {
      const candidateIds = searchResults.value.get(referenceId) || []
      return candidateIds
        .map(id => candidates.value.get(id))
        .filter(Boolean) as ApiSearchCandidate[]
    }
  })

  // ---------- Helpers ----------
  function mergeResults(data: ApiSearchData) {
    for (const result of data.results) {
      const ids: string[] = searchResults.value.get(result.referenceId) ?? []
      for (const cand of result.candidates) {
        candidates.value.set(cand.id, cand)
        if (!ids.includes(cand.id))
          ids.push(cand.id)
      }
      searchResults.value.set(result.referenceId, ids)
    }
  }

  // ---------- Actions ----------
  async function searchCandidates(request: ApiSearchRequest) {
    isSearching.value = true
    searchError.value = null

    const res = await SearchService.searchCandidates(request)
    if (!res.success) {
      searchError.value = mapApiError(res as ApiHttpError)
      isSearching.value = false
      return res
    }

    mergeResults(res.data!)
    isSearching.value = false
    return res
  }

  async function searchInDatabase(database: ApiSearchSource, request: ApiSearchRequest) {
    isSearching.value = true
    searchError.value = null

    const res = await SearchService.searchInDatabase(database, request)
    if (!res.success) {
      searchError.value = mapApiError(res as ApiHttpError)
      isSearching.value = false
      return res
    }

    mergeResults(res.data!)
    isSearching.value = false
    return res
  }

  // Utilities
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
    // State (readonly)
    candidates: readonly(candidates),
    searchResults: readonly(searchResults),
    isSearching: readonly(isSearching),
    searchError: readonly(searchError),

    // Computed
    totalCandidates,
    databasesByPriority,
    getCandidatesByReference,

    // Actions
    searchCandidates,
    searchInDatabase,
    getCandidateById,
    getCandidatesByReferenceId,
    clearSearchResults,
    clearSearchError,
  }
})
