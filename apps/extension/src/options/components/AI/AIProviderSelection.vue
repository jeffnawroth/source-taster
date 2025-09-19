<script setup lang="ts">
import type { ApiAIProvider } from '@source-taster/types'

defineProps<{
  providerOptions: ApiAIProvider[]
}>()

const modelValue = defineModel<ApiAIProvider>({
  required: true,
})
</script>

<template>
  <v-select
    v-model="modelValue"
    :items="providerOptions"
    variant="solo-filled"
  />
</template>
