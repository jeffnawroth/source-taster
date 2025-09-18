import type {
  ApiHttpError,
  ApiMatchReference,
  ApiSearchReference,
  ApiSearchSource,
  UISearchDatabaseConfig,
} from '@source-taster/types'
import { DEFAULT_EARLY_TERMINATION } from '@source-taster/types'
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useVerificationProgressStore } from '@/extension/composables/useVerificationProgress'
import { settings } from '@/extension/logic'
import { useAnystyleStore } from '@/extension/stores/anystyle'
import { useExtractionStore } from '@/extension/stores/extraction'
import { useMatchingStore } from '@/extension/stores/matching'
import { useSearchStore } from '@/extension/stores/search'
import { mapApiError } from '@/extension/utils/mapApiError'

export const useVerificationStore = defineStore('verification', () => {
  // Stores
  const anystyleStore = useAnystyleStore()
  const extractionStore = useExtractionStore()
  const searchStore = useSearchStore()
  const matchingStore = useMatchingStore()
  const progress = useVerificationProgressStore()

  // Refs from stores
  const { parsed, hasParseResults } = storeToRefs(anystyleStore)
  const { extractedReferences } = storeToRefs(extractionStore)
  const { databasesByPriority } = storeToRefs(searchStore)

  // State
  const isVerifying = ref(false)
  const verifyError = ref<string | null>(null)
  const abortController = ref<AbortController | null>(null)
  const isCancelled = ref(false)
  const activeReferenceIds = ref<string[]>([])

  const canVerify = computed(
    () => hasParseResults.value || extractedReferences.value.length > 0,
  )

  async function convertTokensToCSL(): Promise<ApiSearchReference[]> {
    const res = await anystyleStore.convertToCSL()
    if (!res.success)
      throw new Error(mapApiError(res as unknown as ApiHttpError))

    const csl = res.data?.csl ?? []

    const searchRefs = csl.map((item) => {
      const id = crypto.randomUUID()
      return { id, metadata: { ...item, id } }
    })

    const extractedRefs = searchRefs.map((item, index) => {
      const originalText = parsed.value[index]?.originalText ?? ''
      return { ...item, originalText }
    })
    extractionStore.setExtractedReferences(extractedRefs)

    return searchRefs
  }

  function getExtractedCSL(): ApiSearchReference[] {
    return extractedReferences.value.map((r) => {
      const cloned = JSON.parse(JSON.stringify(r.metadata))
      return { id: r.id, metadata: { ...cloned, id: r.id } }
    })
  }

  async function prepareReferences(): Promise<ApiSearchReference[]> {
    return hasParseResults.value ? await convertTokensToCSL() : getExtractedCSL()
  }

  function getVerificationSettings() {
    const databases = databasesByPriority.value ?? []
    const early = settings.value.matching.matchingConfig.earlyTermination
    const threshold = early?.threshold ?? DEFAULT_EARLY_TERMINATION.threshold
    const earlyEnabled = !!early?.enabled
    return { databases, threshold, earlyEnabled }
  }

  function shouldTerminateEarly(
    referenceId: string,
    threshold: number,
    earlyEnabled: boolean,
  ): boolean {
    if (!earlyEnabled)
      return false
    const score = matchingStore.getMatchingScoreByReference(referenceId)
    return score !== null && score >= threshold
  }

  function throwIfAborted(signal?: AbortSignal) {
    if (signal?.aborted)
      throw new DOMException('Verification cancelled', 'AbortError')
  }

  function markCancelledReferences() {
    for (const id of activeReferenceIds.value) {
      const state = progress.get(id)
      if (!state)
        continue
      if (state.phase === 'done' || state.phase === 'error')
        continue
      progress.setCancelled(id)
    }
  }

  async function matchOne(reference: ApiMatchReference, signal?: AbortSignal) {
    throwIfAborted(signal)
    progress.setMatching(reference.id)
    const candidates = searchStore.getCandidatesByReferenceId(reference.id)
    if (!candidates.length)
      return
    throwIfAborted(signal)
    const res = await matchingStore.matchReference({ reference, candidates }, { signal })
    if (!res.success)
      throw new Error(mapApiError(res as unknown as ApiHttpError))
  }

  async function processReferenceInDatabase(
    reference: ApiSearchReference,
    databaseName: ApiSearchSource,
    signal?: AbortSignal,
  ) {
    throwIfAborted(signal)
    progress.setSearching(reference.id, databaseName)
    const sres = await searchStore.searchInDatabase(
      databaseName,
      {
        references: [reference],
      },
      { signal },
    )
    throwIfAborted(signal)
    if (sres && !sres.success) {
      const msg = mapApiError(sres as unknown as ApiHttpError)
      progress.setError(reference.id, msg)
      throw new Error(msg)
    }
    await matchOne(reference, signal)
  }

  async function performVerificationWithEarlyTermination(
    references: ApiSearchReference[],
    databases: UISearchDatabaseConfig[],
    threshold: number,
    earlyEnabled: boolean,
    signal?: AbortSignal,
  ) {
    const remaining = new Set(references.map(r => r.id))

    for (const db of databases) {
      throwIfAborted(signal)
      if (remaining.size === 0)
        break

      for (const ref of references) {
        throwIfAborted(signal)
        if (!remaining.has(ref.id))
          continue

        await processReferenceInDatabase(ref, db.name as ApiSearchSource, signal)

        if (shouldTerminateEarly(ref.id, threshold, earlyEnabled)) {
          remaining.delete(ref.id)
          const score = matchingStore.getMatchingScoreByReference(ref.id)
          progress.setDone(ref.id, score ?? undefined)
        }
      }
    }

    for (const ref of references) {
      if (remaining.has(ref.id)) {
        const score = matchingStore.getMatchingScoreByReference(ref.id)
        progress.setDone(ref.id, score ?? undefined)
      }
    }

    if (!earlyEnabled) {
      for (const ref of references) {
        throwIfAborted(signal)
        progress.setMatching(ref.id)
        await matchOne(ref, signal)
        const score = matchingStore.getMatchingScoreByReference(ref.id)
        progress.setDone(ref.id, score ?? undefined)
      }
    }
  }

  async function verify() {
    if (!canVerify.value)
      return

    // Aborts any previous controller to ensure a clean state
    abortController.value?.abort()
    isCancelled.value = false
    const controller = new AbortController()
    abortController.value = controller

    isVerifying.value = true
    verifyError.value = null

    try {
      searchStore.clearSearchResults()
      matchingStore.clearMatchingResults()

      const references = await prepareReferences()
      activeReferenceIds.value = references.map(r => r.id)
      progress.init(references.map(r => r.id))

      const { databases, threshold, earlyEnabled } = getVerificationSettings()
      if (!databases.length)
        throw new Error('errors.no_databases_enabled')

      await performVerificationWithEarlyTermination(
        references,
        databases,
        threshold,
        earlyEnabled,
        controller.signal,
      )
    }
    catch (e: any) {
      if (!(isCancelled.value && e?.name === 'AbortError')) {
        console.error('Verification failed:', e)
        const fallback = 'errors.verification_failed'
        const message = typeof e?.message === 'string' ? e.message : null
        verifyError.value = message && message.startsWith('errors.') ? message : fallback
      }
    }
    finally {
      isVerifying.value = false
      if (isCancelled.value)
        markCancelledReferences()
      abortController.value = null
      activeReferenceIds.value = []
      isCancelled.value = false
    }
  }

  function cancelVerification() {
    if (!isVerifying.value)
      return
    isCancelled.value = true
    abortController.value?.abort()
    markCancelledReferences()
  }

  return {
    // State
    isVerifying,
    verifyError,
    canVerify,

    // Actions
    verify,
    prepareReferences,
    performVerificationWithEarlyTermination,
    cancelVerification,
  }
})
