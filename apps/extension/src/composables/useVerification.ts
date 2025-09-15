// src/composables/useVerification.ts
import type {
  ApiHttpError,
  ApiMatchReference,
  ApiSearchReference,
  ApiSearchSource,
  UISearchDatabaseConfig,
} from '@source-taster/types'
import { DEFAULT_EARLY_TERMINATION } from '@source-taster/types'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useAnystyleAutoTraining } from '@/extension/composables/useAnystyleAutoTraining'
import { settings } from '@/extension/logic'
import { useAnystyleStore } from '@/extension/stores/anystyle'
import { useExtractionStore } from '@/extension/stores/extraction'
import { useMatchingStore } from '@/extension/stores/matching'
import { useSearchStore } from '@/extension/stores/search'
import { mapApiError } from '@/extension/utils/mapApiError'

import { useVerificationProgressStore } from './useVerificationProgress'

export function useVerification() {
  // Stores
  const anystyleStore = useAnystyleStore()
  const extractionStore = useExtractionStore()
  const searchStore = useSearchStore()
  const matchingStore = useMatchingStore()
  const progress = useVerificationProgressStore()

  const { trainFromVerified, isTraining, trainError } = useAnystyleAutoTraining()

  // Refs from stores
  const { parsed, hasParseResults } = storeToRefs(anystyleStore)
  const { extractedReferences } = storeToRefs(extractionStore)
  const { databasesByPriority } = storeToRefs(searchStore)

  // UI-State
  const isVerifying = ref(false)
  const verifyError = ref<string | null>(null)

  const canVerify = computed(
    () => hasParseResults.value || extractedReferences.value.length > 0,
  )

  // --- Helper functions ---
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

  async function matchOne(reference: ApiMatchReference) {
    progress.setMatching(reference.id)
    const candidates = searchStore.getCandidatesByReferenceId(reference.id)
    if (!candidates.length)
      return
    const res = await matchingStore.matchReference({ reference, candidates })
    if (!res.success)
      throw new Error(mapApiError(res as unknown as ApiHttpError))
  }

  async function processReferenceInDatabase(
    reference: ApiSearchReference,
    databaseName: ApiSearchSource,
  ) {
    progress.setSearching(reference.id, databaseName)
    const sres = await searchStore.searchInDatabase(databaseName, {
      references: [reference],
    })
    if (sres && !sres.success) {
      const msg = mapApiError(sres as unknown as ApiHttpError)
      progress.setError(reference.id, msg)
      throw new Error(msg)
    }
    await matchOne(reference)
  }

  async function performVerificationWithEarlyTermination(
    references: ApiSearchReference[],
    databases: UISearchDatabaseConfig[],
    threshold: number,
    earlyEnabled: boolean,
  ) {
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
        progress.setMatching(ref.id)
        await matchOne(ref)
        const score = matchingStore.getMatchingScoreByReference(ref.id)
        progress.setDone(ref.id, score ?? undefined)
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
      searchStore.clearSearchResults()
      matchingStore.clearMatchingResults()

      const references = await prepareReferences()
      progress.init(references.map(r => r.id))

      const { databases, threshold, earlyEnabled } = getVerificationSettings()
      if (!databases.length)
        throw new Error('No databases are enabled. Please enable at least one database in Settings.')

      await performVerificationWithEarlyTermination(
        references,
        databases,
        threshold,
        earlyEnabled,
      )

      // Nach erfolgreicher Verifizierung optional Auto-Training triggern
      // Nur sinnvoll im Parse-Flow (hasParseResults = true), da nur dann Token/Labels vorhanden sind
      if (hasParseResults.value) {
        // microtask, damit verify-UI sofort fertig ist
        queueMicrotask(() => {
          trainFromVerified().catch((e) => {
            console.warn('[AutoTrain] failed after verify:', e)
          })
        })
      }
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

    isTraining,
    trainError,

    // actions
    verify,

    // optional exports
    prepareReferences,
    performVerificationWithEarlyTermination,
  }
}
