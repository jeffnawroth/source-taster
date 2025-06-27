<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'

// Props
defineProps<{
  reference: ProcessedReference
}>()

// const icon = computed(() => {
//   switch (props.reference.status) {
//     case 'verified': return mdiCheck
//     case 'not-verified': return mdiHelp
//     case 'error': return mdiAlertOutline
//     case 'pending': return mdiClockOutline
//     default: return mdiFileDocumentOutline
//   }
// })

// ICON TOOLTIP TEXT
// const { t } = useI18n()

// const text = computed(() => {
//   switch (props.reference.status) {
//     case 'verified': return t('verified-reference')
//     case 'not-verified': return t('unverified-reference')
//     case 'error': return t('error-reference')
//     case 'pending': return t('pending-reference')
//     default: return t('no-additional-error-info')
//   }
// })
</script>

<template>
  <!-- <v-list-item>
    <v-icon
      class="me-1 pb-1"
      :icon
      size="x-large"
    />

    <strong class="text-h6 font-weight-bold">{{ `${reference.verificationResult?.verificationDetails?.matchDetails?.overallScore || 0} %` }} </strong>
  </v-list-item> -->

  <v-chip
    class="ma-2"
  >
    {{ `${reference.verificationResult?.verificationDetails?.matchDetails?.overallScore || 0} %` }}
  </v-chip>
</template>
