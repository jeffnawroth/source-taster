<script setup lang="ts">
import type { VerifiedReference } from '@/extension/types'
import type { FuseResult } from 'fuse.js'

const { results } = defineProps<{
  results: FuseResult<VerifiedReference>[]
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
        v-for="(verifiedReference) in results"
        :key="verifiedReference.item.referenceMetadata.originalEntry"
        :verified-reference="verifiedReference.item"
      />
    </v-slide-y-transition>
  </v-list>
  <!-- <NoResultsFoundState v-else /> -->
</template>
