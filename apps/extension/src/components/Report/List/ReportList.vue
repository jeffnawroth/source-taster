<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'
import type { FuseResult } from 'fuse.js'
import { useReferencesStore } from '@/extension/stores/references'

const { results } = defineProps<{
  results: FuseResult<ProcessedReference>[]
}>()

const { currentlyVerifyingReference } = storeToRefs(useReferencesStore())
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
        :is-currently-verifying="currentlyVerifyingReference?.id === processedReference.item.id"
      />
    </v-slide-y-transition>
  </v-list>
  <!-- <NoResultsFoundState v-else /> -->
</template>
