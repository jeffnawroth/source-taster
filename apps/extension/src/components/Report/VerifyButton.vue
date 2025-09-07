<script setup lang="ts">
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

// Main verification workflow
async function handleVerify() {
  if (!canVerify.value)
    return

  isVerifying.value = true
  verifyError.value = null

  try {
    // Step 1: Convert tokens to CSL
    // Create mutable copy of tokens
    const mutableTokens = parsedTokens.value.map(tokenSequence =>
      tokenSequence.map(token => [token[0], token[1]] as [any, string]),
    )

    const convertResponse = await anystyleStore.convertToCSL(mutableTokens as any)

    if (!convertResponse.success || !convertResponse.data) {
      throw new Error('Failed to convert tokens to CSL format')
    }

    const cslReferences = convertResponse.data.csl || []

    // Step 2: Search for candidates for all references
    const searchRequest = {
      references: cslReferences.map((ref: any, index: number) => ({
        id: `ref-${index}`,
        metadata: {
          id: ref.id || `ref-${index}`,
          ...ref,
        },
      })),
    }

    const searchResponse = await searchStore.searchCandidates(searchRequest)

    if (!searchResponse.success) {
      throw new Error(`Search failed: ${searchResponse.error}`)
    }

    // Step 3: Match all references - get candidates from search store
    // Match each reference individually (API expects single reference)
    for (const reference of searchRequest.references) {
      // Get candidates for this reference from the search store
      const candidates = searchStore.getCandidatesByReference(reference.id)

      const singleMatchRequest = {
        reference,
        candidates, // Use actual candidates from search results
        matchingSettings: matchingSettings.value,
      }

      await matchingStore.matchReferences(singleMatchRequest)
    }

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
