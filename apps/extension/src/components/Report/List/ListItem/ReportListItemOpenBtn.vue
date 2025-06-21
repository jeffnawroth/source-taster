<script setup lang="ts">
import type { VerifiedReference } from '@/extension/types'
import { mdiOpenInNew } from '@mdi/js'

// Props
const { verifiedReference } = defineProps<{
  verifiedReference: VerifiedReference
}>()

// I18n
const { t } = useI18n()

// Function

function open() {
  if (verifiedReference.referenceMetadata.url || verifiedReference.verification?.publicationMetadata?.url) {
    const url = verifiedReference.referenceMetadata.url || verifiedReference.verification?.publicationMetadata?.url
    window.open(url, '_blank')
  }
}
</script>

<template>
  <v-tooltip v-if="verifiedReference.verification?.match && (verifiedReference.referenceMetadata.url || verifiedReference.verification.publicationMetadata?.url)">
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
    {{ t('open-source') }}
  </v-tooltip>
</template>
