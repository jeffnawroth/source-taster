<script setup lang="ts">
import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client'

// Props
const { work } = defineProps<{
  work: HttpResponse<Item<Work>>
}>()

// I18n
const { t } = useI18n()

// Function

// Opens the work in a new tab
function openWork(work: HttpResponse<Item<Work>>) {
  if (work.ok && work.content?.message.URL) {
    const url = work.content.message.URL
    window.open(url, '_blank')
  }
  else if (work.ok) {
    const url = work.url
    window.open(url, '_blank')
  }
  else {
    console.error('Invalid URL or DOI not found:', work)
  }
}
</script>

<template>
  <v-tooltip v-if="work.ok">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        density="compact"
        icon="mdi-open-in-new"
        variant="plain"
        size="large"
        @click="() => openWork(work)"
      />
    </template>
    {{ t('open-work') }}
  </v-tooltip>
</template>
