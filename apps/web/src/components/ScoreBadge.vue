<script setup lang="ts">
import type { VerificationStatus } from '@/utils/scores'
import { computed } from 'vue'

const props = defineProps<{ status: VerificationStatus, score: number | null }>()

const color = computed(() => {
  if (props.status === 'verified')
    return 'success'
  if (props.status === 'partial')
    return 'accent'
  return 'error'
})

const label = computed(() => {
  if (props.status === 'verified')
    return `${props.score}% · Verified`
  if (props.status === 'partial')
    return `${props.score}% · Partial`
  return 'Not found'
})
</script>

<template>
  <v-chip :color="color" text-color="white" size="small" variant="flat">
    {{ label }}
  </v-chip>
</template>
