<script setup lang="ts">
import type { FuseResult } from 'fuse.js'
import type { ProcessedReference } from '@/extension/types/reference'
import { useReferencesStore } from '@/extension/stores/references'

const { results } = defineProps<{
  results: FuseResult<ProcessedReference>[]
}>()

const { currentlyMatchingReference } = storeToRefs(useReferencesStore())
</script>

<template>
  <v-list
    v-if="results.length > 0"
    class="pa-0"
    density="compact"
    slim
  >
    <v-slide-y-transition group>
      <ReferenceItem
        v-for="(processedReference) in results"
        :key="processedReference.item.id"
        :reference="processedReference.item"
        :is-currently-matching="currentlyMatchingReference?.id === processedReference.item.id"
      />
    </v-slide-y-transition>
  </v-list>
  <!-- <NoResultsFoundState v-else /> -->
</template>
