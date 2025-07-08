<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'
import { mdiRefresh } from '@mdi/js'
import { useReferencesStore } from '@/extension/stores/references'
import { shouldShowReVerify } from '@/extension/utils/scoreUtils'

const { reference } = defineProps<{
  reference: ProcessedReference
  verificationScore?: number
}>()

const referencesStore = useReferencesStore()
const { isProcessing, currentlyVerifyingIndex } = storeToRefs(referencesStore)
const { reVerifyReference } = referencesStore

// Check if any verification is currently running (prevents concurrent operations)
const isAnyVerificationRunning = computed(() =>
  isProcessing.value || currentlyVerifyingIndex.value >= 0,
)

// RE-VERIFY function
function reVerify() {
  const index = referencesStore.references.findIndex(ref => ref.id === reference.id)
  if (index !== -1) {
    reVerifyReference(index)
  }
}
</script>

<template>
  <v-tooltip
    v-if="shouldShowReVerify(reference.status, verificationScore)"
    location="top"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        size="small"
        :icon="mdiRefresh"
        :disabled="isAnyVerificationRunning"
        @click="reVerify"
      />
    </template>
    <span>{{ isAnyVerificationRunning ? $t('verification-in-progress') : $t('re-verify-tooltip') }}</span>
  </v-tooltip>
</template>
