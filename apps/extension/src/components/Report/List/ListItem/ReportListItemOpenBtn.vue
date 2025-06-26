<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'
import { mdiFilePdfBox } from '@mdi/js'

// Props
const { reference } = defineProps<{
  reference: ProcessedReference
}>()

// I18n
const { t } = useI18n()

// Function

function open() {
  if (reference.metadata.url || reference.verificationResult?.matchedSource?.url) {
    const url = reference.metadata.url || reference.verificationResult?.matchedSource?.url
    window.open(url, '_blank')
  }
}
</script>

<template>
  <v-tooltip v-if="reference.verificationResult?.isVerified && (reference.metadata.url || reference.verificationResult.matchedSource?.url)">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        :prepend-icon="mdiFilePdfBox"
        variant="text"
        slim
        text="PDF"
        @click="open"
      />
    </template>
    {{ t('open-source') }}
  </v-tooltip>
</template>
