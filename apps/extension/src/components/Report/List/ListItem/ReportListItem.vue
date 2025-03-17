<script setup lang="ts">
import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client'
import ReportListItemOpenBtn from './ReportListItemOpenBtn.vue'

// Props
const { work } = defineProps<{
  work: HttpResponse<Item<Work>>
}>()

const color = computed(() => {
  return work.ok ? 'success' : 'error'
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
    <template #prepend>
      <ReportListItemStatusIcon :work />
    </template>

    <ReportListItemText :work />

    <template #append>
      <ReportListItemCopyBtn :work />

      <ReportListItemBtnSearchWeb :work />

      <ReportListItemOpenBtn :work />
    </template>
  </v-list-item>
</template>
