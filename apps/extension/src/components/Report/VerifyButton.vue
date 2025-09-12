<script setup lang="ts">
import type {
  ApiAnystyleToken,
  ApiAnystyleTokenSequence,
  ApiHttpError,
  ApiMatchReference,
  ApiSearchRequest,
  CSLItem,
} from '@source-taster/types'
import { mdiMagnifyExpand } from '@mdi/js'
import { useAnystyleStore } from '@/extension/stores/anystyle'
import { useMatchingStore } from '@/extension/stores/matching'
import { useSearchStore } from '@/extension/stores/search'
import { mapApiError } from '@/extension/utils/mapApiError'

// Stores
const anystyleStore = useAnystyleStore()
const searchStore = useSearchStore()
const matchingStore = useMatchingStore()

// Reactive state
const { parsedTokens, hasParseResults } = storeToRefs(anystyleStore)
const isVerifying = ref(false)
const verifyError = ref<string | null>(null)

// Button enabled?
const canVerify = computed(() => hasParseResults.value && parsedTokens.value.length > 0)

// -- Step 1: Tokens -> CSL
async function convertTokensToCSL(): Promise<CSLItem[]> {
  // Mutable copy (ApiAnystyleTokenSequence = Array<[label, token]>)
  const mutableTokens: ApiAnystyleTokenSequence[] = parsedTokens.value.map(seq =>
    seq.map(t => [t[0], t[1]] as ApiAnystyleToken),
  )

  const res = await anystyleStore.convertToCSL(mutableTokens)
  if (!res.success) {
    throw new Error(mapApiError(res as unknown as ApiHttpError))
  }

  const csl = res.data?.csl ?? []

  // Defensive: stelle sicher, dass jedes Item eine id hat
  return csl.map((item, idx) => ({
    ...item,
    id: (item as any)?.id ?? `ref-${idx}`,
  }))
}

// -- Step 2: Kandidaten suchen
async function searchForCandidates(cslItems: CSLItem[]) {
  const refs: ApiSearchRequest['references'] = cslItems.map((ref, _index) => {
    const id = crypto.randomUUID()
    return {
      id,
      metadata: { ...ref, id }, // unsere API erwartet CSL mit id
    }
  })
  const req: ApiSearchRequest = { references: refs }
  const res = await searchStore.searchCandidates(req)

  if (!res.success) {
    throw new Error(mapApiError(res as unknown as ApiHttpError))
  }

  return refs
}

// -- Step 3: Matchen (eine Referenz gegen ihre Kandidaten)
async function matchOne(reference: ApiMatchReference) {
  const candidates = searchStore.getCandidatesByReferenceId(reference.id)

  const res = await matchingStore.matchReference({
    reference,
    candidates,
  })

  if (!res.success) {
    throw new Error(mapApiError(res as unknown as ApiHttpError))
  }
}

// Orchestrierung
async function handleVerify() {
  if (!canVerify.value)
    return

  isVerifying.value = true
  verifyError.value = null

  try {
    const csl = await convertTokensToCSL()
    const refs = await searchForCandidates(csl)

    // sequenziell (bewusst – Rate Limits/Fehlerhandling)
    for (const ref of refs) {
      await matchOne(ref)
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
      :loading="isVerifying"
      color="success"
      variant="tonal"
      block
      @click="handleVerify"
    >
      <v-icon
        :icon="mdiMagnifyExpand"
        start
      />
      <span v-if="isVerifying">{{ $t('verifying') }}...</span>
      <span v-else>{{ $t('verify-references') }}</span>
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
