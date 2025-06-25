<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'
import { mdiAlertOutline, mdiCheck, mdiClockOutline, mdiFileDocumentOutline, mdiHelp } from '@mdi/js'

// Props
const props = defineProps<{
  reference: ProcessedReference
}>()

const icon = computed(() => {
  switch (props.reference.status) {
    case 'verified': return mdiCheck
    case 'not-verified': return mdiHelp
    case 'error': return mdiAlertOutline
    case 'pending': return mdiClockOutline
    default: return mdiFileDocumentOutline
  }
})

// ICON TOOLTIP TEXT
const { t } = useI18n()

const text = computed(() => {
  switch (props.reference.status) {
    case 'verified': return t('verified-reference')
    case 'not-verified': return t('unverified-reference')
    case 'error': return t('error-reference')
    case 'pending': return t('pending-reference')
    default: return t('no-additional-error-info')
  }
})
</script>

<template>
  <v-tooltip :text>
    <template #activator="{ props }">
      <v-icon
        v-bind="props"
        :icon
      />
    </template>
  </v-tooltip>
</template>
