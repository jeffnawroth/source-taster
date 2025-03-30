<script setup lang="ts">
import type { FuseResult } from 'fuse.js'
import type { HttpResponse, Item, Work } from 'node_modules/@jamesgopsill/crossref-client/dist/esm/definitions/interfaces'
import { useWorkStore } from '@/extension/stores/work'

defineProps<{
  results: FuseResult<HttpResponse<Item<Work>>>[]
}>()

const { works } = storeToRefs(useWorkStore())
</script>

<template>
  <v-list v-if="results.length > 0">
    <v-slide-y-transition group>
      <ReportListItem
        v-for="(result) in results"
        :key="result.item.content?.message.DOI"
        :work="result.item"
      />
    </v-slide-y-transition>
  </v-list>
  <NoResultsFoundState v-else-if="works.length > 0" />
</template>
