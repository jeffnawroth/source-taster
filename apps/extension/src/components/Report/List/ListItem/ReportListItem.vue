<script setup lang="ts">
import type { IdentifierResult } from '@/extension/types'
import ReportListItemOpenBtn from './ReportListItemOpenBtn.vue'

// Props
const { identifier } = defineProps<{
  identifier: IdentifierResult
}>()

const color = computed(() => {
  return identifier.registered ? 'success' : 'error'
})

// Functions
</script>

<template>
  <v-list-item
    rounded="lg"
    :color
    active
    class="my-1"
  >
    <v-list-item-title class="wrap-text">
      {{ identifier.value }}
    </v-list-item-title>
    <template #prepend>
      <ReportListItemStatusIcon :registered="identifier.registered" />
    </template>

    <template #append>
      <ReportListItemCopyBtn :value="identifier.value" />

      <ReportListItemBtnSearchWeb :identifier />

      <ReportListItemOpenBtn :identifier />
    </template>
  </v-list-item>
</template>

<style scoped>
.wrap-text {
  white-space: normal;
}
</style>
