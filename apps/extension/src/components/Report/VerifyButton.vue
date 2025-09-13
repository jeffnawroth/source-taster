<script setup lang="ts">
import type { ApiAnystyleToken, ApiHttpError, ApiMatchReference, ApiSearchReference, ApiSearchSource } from '@source-taster/types'
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

const { parsed, hasParseResults } = storeToRefs(anystyleStore)
const { extractedReferences } = storeToRefs(extractionStore)

const isVerifying = ref(false)
const verifyError = ref<string | null>(null)

const canVerify = computed(() =>
  hasParseResults.value || extractedReferences.value.length > 0,
)

// ---- A) Tokens -> CSL (AnyStyle-Flow)
async function convertTokensToCSL(): Promise<ApiSearchReference[]> {
  const tokens = parsed.value.map(ref =>
    ref.tokens.map(t => [t[0], t[1]] as ApiAnystyleToken),
  )

  const res = await anystyleStore.convertToCSL(tokens)
  if (!res.success)
    throw new Error(mapApiError(res as unknown as ApiHttpError))

  const csl = res.data?.csl ?? []

  // Robustheit: Längen abgleichen
  if (csl.length !== parsed.value.length) {
    console.warn('CSL length differs from parsed length. Will align by min length.')
  }

  // Add IDs to CSL items
  const searchRefs = csl.map((item) => {
    const id = crypto.randomUUID()
    return { id, metadata: { ...item, id } }
  })

  // Store extracted references with original text
  const extractedRefs = searchRefs.map((item, index) => {
    const originalText = parsed.value[index].originalText
    return { ...item, originalText }
  })
  extractionStore.setExtractedReferences(extractedRefs)

  return searchRefs
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

// ---- Prepare references for verification
async function prepareReferences(): Promise<ApiSearchReference[]> {
  return hasParseResults.value
    ? await convertTokensToCSL()
    : getExtractedCSL()
}

// ---- Get databases and early termination settings
function getVerificationSettings() {
  const databases = databasesByPriority.value ?? []
  const early = settings.value.matching.matchingConfig.earlyTermination
  const threshold = early?.threshold || DEFAULT_EARLY_TERMINATION.threshold
  const earlyEnabled = !!early?.enabled

  return { databases, threshold, earlyEnabled }
}

// ---- Check if reference should terminate early
function shouldTerminateEarly(referenceId: string, threshold: number, earlyEnabled: boolean): boolean {
  if (!earlyEnabled)
    return false
  const score = matchingStore.getMatchingScoreByReference(referenceId)
  return score >= threshold
}

// ---- Process single reference against database
async function processReferenceInDatabase(reference: ApiSearchReference, databaseName: ApiSearchSource) {
  const sres = await searchStore.searchInDatabase(databaseName, { references: [reference] })
  if (sres && !sres.success)
    throw new Error(mapApiError(sres as unknown as ApiHttpError))

  await matchOne(reference)
}

// ---- Main verification with early termination per reference
async function performVerificationWithEarlyTermination(
  references: ApiSearchReference[],
  databases: any[],
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

      await processReferenceInDatabase(ref, db.name)

      if (shouldTerminateEarly(ref.id, threshold, earlyEnabled)) {
        remaining.delete(ref.id)
      }
    }
  }

  // Final matching for non-early termination mode
  if (!earlyEnabled) {
    for (const ref of references) {
      await matchOne(ref)
    }
  }
}

// ---- Main orchestration function
async function handleVerify() {
  if (!canVerify.value)
    return

  isVerifying.value = true
  verifyError.value = null

  try {
    const references = await prepareReferences()
    const { databases, threshold, earlyEnabled } = getVerificationSettings()

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
