<script setup lang="ts">
import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client'

// Props
const { work } = defineProps<{
  work: HttpResponse<Item<Work>>
  index: number
}>()

const { t } = useI18n()
</script>

<template>
  <v-tooltip>
    <template #activator="{ props: tooltipProps }">
      <v-icon
        v-bind="tooltipProps"
        size="x-large"
        :icon="work.ok && work.content ? 'mdi-check-circle-outline' : work.ok ? 'mdi-alert-circle-outline' : 'mdi-close-circle-outline'"
      />
    </template>
    <template v-if="work.ok && work.content">
      <p>{{ t('doi-found-metadata') }}</p>
    </template>
    <template v-else-if="work.ok">
      <!-- <p>The DOI was found but the metadata <span class="font-weight-bold">could not</span> be retrieved from the Crossref-Database.</p> -->
      <p>{{ t('doi-found-no-metadata') }}</p>
    </template>
    <template v-else>
      <div class="ma-1">
        <p>{{ t('doi-not-found') }}</p>
        <!-- <p>The DOI was <span class="font-weight-bold">not</span> found. Possible reasons are:</p> -->
        <ul>
          <li>{{ t('doi-incorrect') }}</li>
          <li>{{ t('doi-incorrect-extraced') }}</li>
          <li>{{ t('doi-not-activated') }}</li>
        </ul>
      </div>
    </template>
  </v-tooltip>
</template>
