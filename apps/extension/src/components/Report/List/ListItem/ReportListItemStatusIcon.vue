<script setup lang="ts">
import type { VerificationResult } from '@/extension/types'
import { mdiAlertCircleOutline, mdiCheckCircleOutline, mdiCloseCircleOutline } from '@mdi/js'

// Props
const props = defineProps<{
  verification: VerificationResult | null
}>()

const verification = props.verification
const icon = computed(() => {
  if (!verification) {
    return mdiCloseCircleOutline
  }
  return verification.match ? mdiCheckCircleOutline : mdiAlertCircleOutline
})

// ICON TOOLTIP TEXT
const { t } = useI18n()

const text = computed(() => {
  if (!verification) {
    return t('error')
  }
  return verification.match ? t('verified') : t('unverified')
})
</script>

<template>
  <v-tooltip :text>
    <template #activator="{ props }">
      <v-icon
        v-bind="props"
        size="large"
        :icon
      />
    </template>
  </v-tooltip>
</template>
