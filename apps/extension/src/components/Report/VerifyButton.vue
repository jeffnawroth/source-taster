<script setup lang="ts">
import type {
  ApiAnystyleToken,
  ApiAnystyleTokenSequence,
  ApiHttpError,
  ApiMatchReference,
  ApiSearchReference,
} from '@source-taster/types'
import { mdiMagnifyExpand } from '@mdi/js'
import { useCloned } from '@vueuse/core'
import { useAnystyleStore } from '@/extension/stores/anystyle'
import { useExtractionStore } from '@/extension/stores/extraction' // ⟵ NEU
import { useMatchingStore } from '@/extension/stores/matching'
import { useSearchStore } from '@/extension/stores/search'
import { mapApiError } from '@/extension/utils/mapApiError'

const anystyleStore = useAnystyleStore()
const extractionStore = useExtractionStore() // ⟵ NEU
const searchStore = useSearchStore()
const matchingStore = useMatchingStore()

const { parsedTokens, hasParseResults } = storeToRefs(anystyleStore)
const { extractedReferences } = storeToRefs(extractionStore)

const isVerifying = ref(false)
const verifyError = ref<string | null>(null)

// Button enabled? → entweder Tokens ODER extrahierte Referenzen
const canVerify = computed(() =>
  hasParseResults.value || (extractedReferences.value.length > 0),
)

// ---- A) Tokens -> CSL (AnyStyle-Flow)
async function convertTokensToCSL(): Promise<ApiSearchReference[]> {
  const mutableTokens: ApiAnystyleTokenSequence[] = parsedTokens.value.map(seq =>
    seq.map(t => [t[0], t[1]] as ApiAnystyleToken),
  )
  const res = await anystyleStore.convertToCSL(mutableTokens)
  if (!res.success)
    throw new Error(mapApiError(res as unknown as ApiHttpError))
  const csl = res.data?.csl ?? []
  return csl.map((item, _idx) => {
    const id = crypto.randomUUID()
    return {
      id,
      metadata: { ...item, id },
    }
  })
}

// ---- B) KI-Extrahierte Referenzen -> CSL (direkt)
function getExtractedCSL(): ApiSearchReference[] {
  return extractedReferences.value.map((r) => {
    const { cloned } = useCloned(r.metadata)
    return { metadata: cloned.value, id: r.id } as ApiSearchReference
  })
}

// ---- Search Candidates (für beide Wege)
async function searchForCandidates(cslItems: ApiSearchReference[]) {
  const res = await searchStore.searchCandidates({ references: cslItems })
  if (!res.success)
    throw new Error(mapApiError(res as unknown as ApiHttpError))
}

// ---- Match one (Kandidaten werden im Store bereinigt)
async function matchOne(reference: ApiMatchReference) {
  const candidates = searchStore.getCandidatesByReferenceId(reference.id)
  if (!candidates.length)
    return
  const res = await matchingStore.matchReference({ reference, candidates })
  if (!res.success)
    throw new Error(mapApiError(res as unknown as ApiHttpError))
}

// ---- Orchestrierung
async function handleVerify() {
  if (!canVerify.value)
    return
  isVerifying.value = true
  verifyError.value = null
  try {
    // Branching: AnyStyle-Tokens vorhanden? Sonst KI-Extraktion
    const csl: ApiSearchReference[] = hasParseResults.value
      ? await convertTokensToCSL()
      : getExtractedCSL()

    await searchForCandidates(csl)
    for (const ref of csl) await matchOne(ref)
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
