<script setup lang="ts">
import type { VerifiedReference } from '@/extension/types'
import { mdiInformationOutline } from '@mdi/js'
import ReportListItemOpenBtn from './ReportListItemOpenBtn.vue'

// Props
const { verifiedReference } = defineProps<{
  verifiedReference: VerifiedReference
}>()

const color = computed(() => {
  if (!verifiedReference.verification) {
    return 'error'
  }
  return verifiedReference.verification.match ? 'success' : 'warning'
})

const isVerificationMismatch = computed(() => !verifiedReference.verification?.match)

// Functions
</script>

<template>
  <v-list-item
    rounded="lg"
    :color
    active
    class="my-1"
  >
    <v-list-item-title class="wrap-text">
      {{ verifiedReference.referenceMetadata.originalEntry }}
    </v-list-item-title>
    <template #prepend>
      <ReportListItemStatusIcon :verification="verifiedReference.verification" />
    </template>

    <template #append>
      <v-tooltip v-if="isVerificationMismatch">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            density="compact"
            variant="plain"
            size="large"
            :icon="mdiInformationOutline"
          />
        </template>
        {{ verifiedReference.verification?.reason }}
      </v-tooltip>
      <ReportListItemCopyBtn :value="verifiedReference.referenceMetadata.originalEntry" />

      <ReportListItemBtnSearchWeb :verified-reference />

      <ReportListItemOpenBtn :verified-reference />
    </template>
  </v-list-item>
</template>

<style scoped>
/* Ensures text wraps within the container to prevent overflow */
.wrap-text {
  white-space: normal;
}
</style>
