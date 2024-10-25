<script setup lang="ts">
import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client'
import ReportListItemOpenBtn from './ReportListItemOpenBtn.vue'

// Props
const { work } = defineProps<{
  work: HttpResponse<Item<Work>>
  index: number
}>()

const color = computed(() => {
  return work.ok && work.content ? 'success' : work.ok ? 'warning' : 'error'
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
      <ReportListItemStatusIcon
        :work
        :index
      />
    </template>

    <ReportListItemText
      :work
      :index
    />

    <template #append>
      <ReportListItemCopyBtn
        :index
      />

      <ReportListItemOpenBtn :work />
    </template>
  </v-list-item>
</template>
