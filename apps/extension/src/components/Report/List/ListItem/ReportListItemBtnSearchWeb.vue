<script setup lang="ts">
import type { VerifiedReference } from '@/extension/types'
import { mdiWeb } from '@mdi/js'

// Props
const { verifiedReference } = defineProps<{
  verifiedReference: VerifiedReference
}>()

// Search DOI in a new Browser Tab
function openInWeb() {
  window.open(`https://www.google.com/search?q=${verifiedReference.referenceMetadata.originalEntry}`, '_blank')
}
</script>

<template>
  <v-tooltip
    v-if="!verifiedReference.verification.match"
    :text="$t('search-on-web')"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        :icon="mdiWeb"
        density="compact"
        variant="plain"
        size="large"

        @click="openInWeb"
      />
    </template>
  </v-tooltip>
</template>
