<script setup lang="ts">
import type { AnystyleToken, AnystyleTokenSequence, ApiSearchRequest, CSLItem, MatchingReference } from '@source-taster/types'
import { mdiMagnifyExpand } from '@mdi/js'
import { matchingSettings } from '@/extension/logic/storage'
import { useAnystyleStore } from '@/extension/stores/anystyle'
import { useMatchingStore } from '@/extension/stores/matching'
import { useSearchStore } from '@/extension/stores/search'

// Stores
const anystyleStore = useAnystyleStore()
const searchStore = useSearchStore()
const matchingStore = useMatchingStore()

// Reactive state
const { parsedTokens, hasParseResults } = storeToRefs(anystyleStore)
const isVerifying = ref(false)
const verifyError = ref<string | null>(null)

// Check if we have parsed tokens to verify
const canVerify = computed(() => {
  return hasParseResults.value && parsedTokens.value.length > 0
})

// Step 1: Convert parsed tokens to CSL format
async function convertTokensToCSL(): Promise<CSLItem[]> {
  // Create mutable copy of tokens
  const mutableTokens: AnystyleTokenSequence[] = parsedTokens.value.map(tokenSequence =>
    tokenSequence.map(token => [token[0], token[1]] as AnystyleToken),
  )

  const convertResponse = await anystyleStore.convertToCSL(mutableTokens)

  if (!convertResponse.success || !convertResponse.data) {
    throw new Error('Failed to convert tokens to CSL format')
  }

  return convertResponse.data.csl || []
}

// Step 2: Search for candidates for all references
async function searchForCandidates(cslReferences: CSLItem[]) {
  const searchRequest: ApiSearchRequest = {
    references: cslReferences.map((ref: CSLItem, index: number) => ({
      metadata: { ...ref, id: ref.id || `ref-${index}` },
      id: String(ref.id || `ref-${index}`),
    })) as ApiSearchRequest['references'],
  }

  const searchResponse = await searchStore.searchCandidates(searchRequest)

  if (!searchResponse.success) {
    throw new Error(`Search failed: ${searchResponse.error}`)
  }

  return searchRequest.references
}

// Step 3: Match references with their candidates
async function matchReferences(references: MatchingReference[]): Promise<void> {
  for (const reference of references) {
    // Get candidates for this reference from the search store
    const candidates = searchStore.getCandidatesByReference(reference.id)

    const matchRequest = {
      reference,
      candidates, // Use actual candidates from search results
      matchingSettings: matchingSettings.value,
    }

    await matchingStore.matchReferences(matchRequest)
  }
}

// Main verification workflow - orchestrates all steps
async function handleVerify() {
  if (!canVerify.value)
    return

  isVerifying.value = true
  verifyError.value = null

  try {
    // Step 1: Convert tokens to CSL
    const cslReferences = await convertTokensToCSL()

    // Step 2: Search for candidates
    const references = await searchForCandidates(cslReferences)

    // Step 3: Match references with candidates
    await matchReferences(references)

    // Success - references are now processed
  }
  catch (error) {
    console.error('Verification failed:', error)
    verifyError.value = error instanceof Error ? error.message : 'Verification failed'
  }
  finally {
    isVerifying.value = false
  }
}
</script>

<template>
  <div>
    <!-- Verify Button -->
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
      <span v-if="isVerifying">
        {{ $t('verifying') }}...
      </span>
      <span v-else>
        {{ $t('verify-references') }}
      </span>
    </v-btn>

    <!-- Error Display -->
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
