<script setup lang="ts">
import type { Work } from '@/extension/crossref-client'
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
  if (verifiedReference.verification.match && verifiedReference.crossrefData && (verifiedReference.crossrefData as Work).uRL) {
    window.open((verifiedReference.crossrefData as Work).uRL, '_blank')
  }
}
</script>

<template>
  <v-tooltip v-if="verifiedReference.verification.match">
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
