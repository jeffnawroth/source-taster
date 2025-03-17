<script setup lang="ts">
import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client'
import { mdiWeb } from '@mdi/js'

// Props
const { work } = defineProps<{
  work: HttpResponse<Item<Work>>
}>()

// Search DOI in a new Browser Tab
function openInWeb() {
  window.open(`https://www.google.com/search?q=${work.content?.message.DOI}`, '_blank')
}
</script>

<template>
  <v-tooltip v-if="!work.ok" text="Search in Web">
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
