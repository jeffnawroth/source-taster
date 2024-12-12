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
        :icon="work.ok ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
      />
    </template>
    <p>{{ work.ok ? t('valid-description') : t('invalid-description') }}</p>
    <!-- <template v-else>
      <div class="ma-1">
        <p>{{ t('doi-not-found') }}</p>
        <ul>
          <li>{{ t('doi-incorrect') }}</li>
          <li>{{ t('doi-incorrect-extracted') }}</li>
          <li>{{ t('doi-not-activated') }}</li>
        </ul>
      </div>
    </template> -->
  </v-tooltip>
</template>
