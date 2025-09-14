// src/composables/useVerification.ts
import type { ApiHttpError, ApiMatchReference, ApiSearchReference, ApiSearchSource, UISearchDatabaseConfig } from '@source-taster/types'
import { DEFAULT_EARLY_TERMINATION } from '@source-taster/types'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { settings } from '@/extension/logic'
import { useAnystyleStore } from '@/extension/stores/anystyle'
import { useExtractionStore } from '@/extension/stores/extraction'
import { useMatchingStore } from '@/extension/stores/matching'
import { useSearchStore } from '@/extension/stores/search'
import { mapApiError } from '@/extension/utils/mapApiError'

export function useVerification() {
  // Stores
  const anystyleStore = useAnystyleStore()
  const extractionStore = useExtractionStore()
  const searchStore = useSearchStore()
  const matchingStore = useMatchingStore()

  // Refs from stores
  const { parsed, hasParseResults } = storeToRefs(anystyleStore)
  const { extractedReferences } = storeToRefs(extractionStore)
  const { databasesByPriority } = storeToRefs(searchStore)

  // UI-State
  const isVerifying = ref(false)
  const verifyError = ref<string | null>(null)

  // Can verify? => Either tokens available OR extracted references
  const canVerify = computed(() =>
    hasParseResults.value || extractedReferences.value.length > 0,
  )

  // --- Helper functions ---

  // A) AnyStyle flow: Tokens -> CSL + store extractedReferences in extraction store
  async function convertTokensToCSL(): Promise<ApiSearchReference[]> {
    const res = await anystyleStore.convertToCSL()
    if (!res.success)
      throw new Error(mapApiError(res as unknown as ApiHttpError))

    const csl = res.data?.csl ?? []

    // Assign IDs (Search API expects its own ID + identical CSL ID)
    const searchRefs = csl.map((item) => {
      const id = crypto.randomUUID()
      return { id, metadata: { ...item, id } }
    })

    // Store extractedReferences including originalText in extraction store
    const extractedRefs = searchRefs.map((item, index) => {
      const originalText = parsed.value[index]?.originalText ?? ''
      return { ...item, originalText }
    })
    extractionStore.setExtractedReferences(extractedRefs)

    return searchRefs
  }

  // B) AI-extracted references -> directly as ApiSearchReference
  function getExtractedCSL(): ApiSearchReference[] {
    return extractedReferences.value.map((r) => {
      const cloned = JSON.parse(JSON.stringify(r.metadata))
      return { id: r.id, metadata: { ...cloned, id: r.id } }
    })
  }

  async function prepareReferences(): Promise<ApiSearchReference[]> {
    return hasParseResults.value
      ? await convertTokensToCSL()
      : getExtractedCSL()
  }

  function getVerificationSettings() {
    const databases = databasesByPriority.value ?? []
    const early = settings.value.matching.matchingConfig.earlyTermination
    const threshold = early?.threshold ?? DEFAULT_EARLY_TERMINATION.threshold
    const earlyEnabled = !!early?.enabled
    return { databases, threshold, earlyEnabled }
  }

  function shouldTerminateEarly(referenceId: string, threshold: number, earlyEnabled: boolean): boolean {
    if (!earlyEnabled)
      return false
    const score = matchingStore.getMatchingScoreByReference(referenceId)
    return score !== null && score >= threshold
  }

  async function matchOne(reference: ApiMatchReference) {
    const candidates = searchStore.getCandidatesByReferenceId(reference.id)
    if (!candidates.length)
      return

    const res = await matchingStore.matchReference({ reference, candidates })
    if (!res.success)
      throw new Error(mapApiError(res as unknown as ApiHttpError))
  }

  async function processReferenceInDatabase(reference: ApiSearchReference, databaseName: ApiSearchSource) {
    const sres = await searchStore.searchInDatabase(databaseName, { references: [reference] })
    if (sres && !sres.success)
      throw new Error(mapApiError(sres as unknown as ApiHttpError))
    await matchOne(reference)
  }

  async function performVerificationWithEarlyTermination(
    references: ApiSearchReference[],
    databases: UISearchDatabaseConfig[],
    threshold: number,
    earlyEnabled: boolean,
  ) {
    // Keep track of which references are "finished
    const remaining = new Set(references.map(r => r.id))

    for (const db of databases) {
      if (remaining.size === 0)
        break

      for (const ref of references) {
        if (!remaining.has(ref.id))
          continue

        await processReferenceInDatabase(ref, db.name as ApiSearchSource)

        if (shouldTerminateEarly(ref.id, threshold, earlyEnabled)) {
          remaining.delete(ref.id)
        }
      }
    }

    // Optional final matching run if early termination is disabled
    if (!earlyEnabled) {
      for (const ref of references) {
        await matchOne(ref)
      }
    }
  }

  // --- Public orchestration ---
  async function verify() {
    if (!canVerify.value)
      return

    isVerifying.value = true
    verifyError.value = null

    try {
      // Clear previous results (otherwise stale scores)
      searchStore.clearSearchResults()
      matchingStore.clearMatchingResults()

      const references = await prepareReferences()
      const { databases, threshold, earlyEnabled } = getVerificationSettings()

      if (!databases.length) {
        throw new Error('No databases are enabled. Please enable at least one database in Settings.')
      }

      await performVerificationWithEarlyTermination(references, databases, threshold, earlyEnabled)
    }
    catch (e: any) {
      console.error('Verification failed:', e)
      verifyError.value = typeof e?.message === 'string' ? e.message : 'Verification failed'
    }
    finally {
      isVerifying.value = false
    }
  }

  return {
    // state
    isVerifying,
    verifyError,
    canVerify,
    // actions
    verify,
    // (optional) low-level helpers if you need them in special cases
    prepareReferences,
    performVerificationWithEarlyTermination,
  }
}
