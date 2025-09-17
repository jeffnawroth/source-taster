<script setup lang="ts">
import type { FuseResult } from 'fuse.js'
import type { ExtractedReference } from '@/extension/types/reference'
import { useReferencesStore } from '@/extension/stores/references'

const { results } = defineProps<{
  results: FuseResult<ExtractedReference>[]
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
        v-for="(extractedReference) in results"
        :key="extractedReference.item.id"
        :reference="extractedReference.item"
        :is-currently-matching="currentlyMatchingReference?.id === extractedReference.item.id"
      />
    </v-slide-y-transition>
  </v-list>
  <!-- <NoResultsFoundState v-else /> -->
</template>
