<script setup lang="ts">
import type { ExtractedReference } from '@/extension/types/reference'
import { mdiRefresh } from '@mdi/js'
import { useReferencesStore } from '@/extension/stores/references'
import { shouldShowReMatch } from '@/extension/utils/scoreUtils'

const { reference } = defineProps<{
  reference: ExtractedReference
  matchingScore?: number
}>()

const referencesStore = useReferencesStore()
const { isExtraction, currentlyMatchingIndex } = storeToRefs(referencesStore)
const { reMatchReference } = referencesStore

// Check if any matching is currently running (prevents concurrent operations)
const isAnyMatchingRunning = computed(() =>
  isExtraction.value || currentlyMatchingIndex.value >= 0,
)

// RE-MATCH function
function reMatch() {
  const index = referencesStore.references.findIndex(ref => ref.id === reference.id)
  if (index !== -1) {
    reMatchReference(index)
  }
}
</script>

<template>
  <v-tooltip
    v-if="shouldShowReMatch(reference.status, matchingScore)"
    location="top"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        size="small"
        :icon="mdiRefresh"
        :disabled="isAnyMatchingRunning"
        @click="reMatch"
      />
    </template>
    <span>{{ isAnyMatchingRunning ? $t('verification-in-progress') : $t('re-verify-tooltip') }}</span>
  </v-tooltip>
</template>
