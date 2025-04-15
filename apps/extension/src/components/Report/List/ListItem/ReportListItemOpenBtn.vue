<script setup lang="ts">
import type { IdentifierResult } from '@/extension/types'
import type { Work } from '@jamesgopsill/crossref-client'
import { mdiOpenInNew } from '@mdi/js'

// Props
const { identifier } = defineProps<{
  identifier: IdentifierResult
}>()

// I18n
const { t } = useI18n()

// Function

// Open in a new tab
function open() {
  try {
    if ((identifier.type === 'METADATA' || identifier.type === 'DOI') && identifier.crossrefData && (identifier.crossrefData as Work).URL) {
      window.open((identifier.crossrefData as Work).URL, '_blank')
    }
    else if (identifier.type === 'DOI') {
      window.open(`https://doi.org/${identifier.value}`, '_blank')
    }
    else {
      window.open(`https://portal.issn.org/resource/ISSN/${identifier.value}`, '_blank')
    }
  }
  catch (error) {
    console.error('Error opening:', error)
  }
}
</script>

<template>
  <v-tooltip v-if="identifier.registered">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        density="compact"
        :icon="mdiOpenInNew"
        variant="plain"
        size="large"
        @click="open"
      />
    </template>
    {{ t('open-work') }}
  </v-tooltip>
</template>
