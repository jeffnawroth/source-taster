<script setup lang="ts">
import type { ApiAnystyleToken, ApiAnystyleTokenSequence, ApiHttpError, ApiMatchReference, ApiSearchReference } from '@source-taster/types'
import { mdiMagnifyExpand } from '@mdi/js'
import {

  DEFAULT_EARLY_TERMINATION,
} from '@source-taster/types'
import { settings } from '@/extension/logic'
import { useAnystyleStore } from '@/extension/stores/anystyle'
import { useExtractionStore } from '@/extension/stores/extraction'
import { useMatchingStore } from '@/extension/stores/matching'
import { useSearchStore } from '@/extension/stores/search'
import { mapApiError } from '@/extension/utils/mapApiError'

const anystyleStore = useAnystyleStore()
const extractionStore = useExtractionStore()
const searchStore = useSearchStore()
const { databasesByPriority } = storeToRefs(searchStore)
const matchingStore = useMatchingStore()

const { parsedTokens, hasParseResults } = storeToRefs(anystyleStore)
const { extractedReferences } = storeToRefs(extractionStore)

const isVerifying = ref(false)
const verifyError = ref<string | null>(null)

const canVerify = computed(() =>
  hasParseResults.value || extractedReferences.value.length > 0,
)

// ---- A) Tokens -> CSL (AnyStyle-Flow)
async function convertTokensToCSL(): Promise<ApiSearchReference[]> {
  const mutable: ApiAnystyleTokenSequence[] = parsedTokens.value.map(seq =>
    seq.map(t => [t[0], t[1]] as ApiAnystyleToken),
  )
  const res = await anystyleStore.convertToCSL(mutable)
  if (!res.success)
    throw new Error(mapApiError(res as unknown as ApiHttpError))

  const csl = res.data?.csl ?? []
  return csl.map((_item) => {
    const id = crypto.randomUUID()
    return { id, metadata: { ..._item, id } }
  })
}

// ---- B) KI-Extrahierte Referenzen -> CSL
function getExtractedCSL(): ApiSearchReference[] {
  return extractedReferences.value.map((r) => {
    const cloned = JSON.parse(JSON.stringify(r.metadata))
    return { id: r.id, metadata: { ...cloned, id: r.id } }
  })
}

// ---- Match eine Referenz gegen aktuelle Kandidaten
async function matchOne(reference: ApiMatchReference) {
  const candidates = searchStore.getCandidatesByReferenceId(reference.id)
  if (!candidates.length)
    return

  const res = await matchingStore.matchReference({ reference, candidates })
  if (!res.success)
    throw new Error(mapApiError(res as unknown as ApiHttpError))
}

// ---- Orchestrierung mit Early Termination (pro Referenz)
async function handleVerify() {
  if (!canVerify.value)
    return

  isVerifying.value = true
  verifyError.value = null

  try {
    // 1) Referenzen vorbereiten (Tokens->CSL ODER KI-Extraktion)
    const refs: ApiSearchReference[] = hasParseResults.value
      ? await convertTokensToCSL()
      : getExtractedCSL()

    // 2) DB-Liste holen (priorisiert)
    const dbRes = await searchStore.fetchDatabases()
    if (dbRes && !dbRes.success)
      throw new Error(mapApiError(dbRes as unknown as ApiHttpError))
    const databases = databasesByPriority.value ?? [] // [{name, priority, endpoint}]

    // Set der „noch zu suchenden“ Referenzen
    const remaining = new Set(refs.map(r => r.id))

    // Early termination Settings (aus UI-Settings)
    const early = settings.value.matching.matchingConfig.earlyTermination
    const threshold = early?.threshold || DEFAULT_EARLY_TERMINATION.threshold
    const earlyEnabled = !!early?.enabled

    // 3) Datenbanken nacheinander abfragen
    for (const db of databases) {
      if (remaining.size === 0)
        break

      // pro Referenz (nur die, die noch offen sind)
      for (const ref of refs) {
        if (!remaining.has(ref.id))
          continue

        // 3a) Suche in genau dieser DB für diese eine Referenz
        const sres = await searchStore.searchInDatabase(db.name, { references: [ref] })
        if (sres && !sres.success)
          throw new Error(mapApiError(sres as unknown as ApiHttpError))

        // 3b) Matchen mit den (neuen) Kandidaten dieser Referenz
        await matchOne(ref)

        // 3c) Early termination Check
        if (earlyEnabled) {
          const score = matchingStore.getMatchingScoreByReference(ref.id)
          if (score >= threshold) {
            remaining.delete(ref.id)
          }
        }
      }
    }

    // Optional: letzte Sicherungs-Matches, falls Early-Termination aus ist
    if (!earlyEnabled) {
      for (const ref of refs) await matchOne(ref)
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
</script>

<template>
  <div>
    <v-btn
      :disabled="!canVerify || isVerifying"
      color="success"
      variant="tonal"
      block
      @click="handleVerify"
    >
      <template #prepend>
        <v-progress-circular
          v-if="isVerifying"
          size="20"
          width="2"
          indeterminate
        />
        <v-icon
          v-else
          :icon="mdiMagnifyExpand"
          start
        />
      </template>
      {{ isVerifying ? `${$t('verifying')}...` : $t('verify-references') }}
    </v-btn>

    <v-expand-transition>
      <v-alert
        v-if="verifyError"
        type="error"
        variant="tonal"
        class="mt-3"
        closable
        @click:close="verifyError = null"
      >
        {{ verifyError }}
      </v-alert>
    </v-expand-transition>
  </div>
</template>
