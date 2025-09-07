<script setup lang="ts">
import type { FuseResult } from 'fuse.js'
import type { DisplayReference } from '@/extension/stores/ui'

const { results } = defineProps<{
  results: FuseResult<DisplayReference>[]
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
      <ReferenceItem
        v-for="(displayReference) in results"
        :key="displayReference.item.id"
        :reference="displayReference.item"
      />
    </v-slide-y-transition>
  </v-list>
  <!-- <NoResultsFoundState v-else /> -->
</template>
