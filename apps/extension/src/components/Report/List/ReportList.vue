<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'
import type { FuseResult } from 'fuse.js'

const { results } = defineProps<{
  results: FuseResult<ProcessedReference>[]
}>()
</script>

<template>
  <v-list
    v-if="results.length > 0"
    class="pa-0"
    density="compact"
    slim
  >
    <v-slide-y-transition group>
      <ReportListItem
        v-for="(processedReference) in results"
        :key="processedReference.item.id"
        :reference="processedReference.item"
      />
    </v-slide-y-transition>
  </v-list>
  <!-- <NoResultsFoundState v-else /> -->
</template>
