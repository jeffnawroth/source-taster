<script setup lang="ts">
import type { VerifiedReference } from '@/extension/types'
import { mdiInformationOutline } from '@mdi/js'
import ReportListItemOpenBtn from './ReportListItemOpenBtn.vue'

// Props
const { verifiedReference } = defineProps<{
  verifiedReference: VerifiedReference
}>()

const color = computed(() => {
  return verifiedReference.verification.match ? 'success' : 'error'
})

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
      <ReportListItemStatusIcon :verified="verifiedReference.verification.match" />
    </template>

    <template #append>
      <v-tooltip v-if="!verifiedReference.verification.match">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            density="compact"
            variant="plain"
            size="large"
            :icon="mdiInformationOutline"
          />
        </template>
        {{ verifiedReference.verification.reason }}
      </v-tooltip>
      <ReportListItemCopyBtn :value="verifiedReference.referenceMetadata.originalEntry" />

      <ReportListItemBtnSearchWeb :verified-reference />

      <ReportListItemOpenBtn :verified-reference />
    </template>
  </v-list-item>
</template>

<style scoped>
.wrap-text {
  white-space: normal;
}
</style>
