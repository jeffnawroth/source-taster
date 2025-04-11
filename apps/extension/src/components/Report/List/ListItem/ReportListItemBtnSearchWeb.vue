<script setup lang="ts">
import type { IdentifierResult } from '@/extension/types'
import { mdiWeb } from '@mdi/js'

// Props
const { identifier } = defineProps<{
  identifier: IdentifierResult
}>()

// Search DOI in a new Browser Tab
function openInWeb() {
  window.open(`https://www.google.com/search?q=${identifier.value}`, '_blank')
}
</script>

<template>
  <v-tooltip
    v-if="!identifier.registered"
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
