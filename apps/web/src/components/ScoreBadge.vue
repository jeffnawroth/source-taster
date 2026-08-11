<script setup lang="ts">
import type { VerificationStatus } from '@/utils/scores'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ status: VerificationStatus, score: number | null }>()
const { t } = useI18n()

const color = computed(() => {
  if (props.status === 'verified')
    return 'success'
  if (props.status === 'partial')
    return 'accent'
  return 'error'
})

const label = computed(() => {
  if (props.status === 'verified')
    return `${props.score}% · ${t('results.verified')}`
  if (props.status === 'partial')
    return `${props.score}% · ${t('results.partial')}`
  return t('results.notFoundShort')
})
</script>

<template>
  <v-chip :color="color" text-color="white" size="small" variant="flat">
    {{ label }}
  </v-chip>
</template>
