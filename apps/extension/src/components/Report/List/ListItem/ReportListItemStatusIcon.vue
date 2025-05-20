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
</script>

<template>
  <v-icon
    size="large"
    :icon
  />
</template>
