<script setup lang="ts">
import { mdiWeb } from '@mdi/js'

// Props
const { query } = defineProps<{
  query: string
}>()

// Search DOI in a new Browser Tab
function openInWeb() {
  window.open(`https://www.google.com/search?q=${query}`, '_blank')
}
</script>

<template>
  <v-tooltip
    :text="$t('search-on-web')"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        :prepend-icon="mdiWeb"
        density="compact"
        variant="text"
        slim
        text="Web"

        @click="openInWeb"
      />
    </template>
  </v-tooltip>
</template>
