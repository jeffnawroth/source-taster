<script setup lang="ts">
import type { AIProvider } from '@source-taster/types'

defineProps<{
  providerOptions: AIProvider[]
}>()

const modelValue = defineModel<AIProvider>({
  required: true,
})
</script>

<template>
  <v-select
    v-model="modelValue"
    :items="providerOptions"
    density="compact"
    variant="solo-filled"
    flat
    hide-details
  />
</template>
