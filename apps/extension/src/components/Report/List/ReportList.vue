<script setup lang="ts">
import type { IdentifierResult } from '@/extension/types'
import type { FuseResult } from 'fuse.js'

const { results } = defineProps<{
  results: FuseResult<IdentifierResult>[]
}>()

const dois = computed(() => results.filter(result => result.item.type === 'DOI'))
const issns = computed(() => results.filter(result => result.item.type === 'ISSN'))
</script>

<template>
  <v-list
    v-if="results.length > 0"
    class="pa-0"
  >
    <v-list-subheader
      v-if="dois.length"
      title="DOIs"
    />

    <v-slide-y-transition group>
      <ReportListItem
        v-for="(doi) in dois"
        :key="doi.item.value"
        :identifier="doi.item"
      />
    </v-slide-y-transition>
    <v-list-subheader
      v-if="issns.length"
      title="ISSNs"
    />

    <v-slide-y-transition group>
      <ReportListItem
        v-for="(issn) in issns"
        :key="issn.item.value"
        :identifier="issn.item"
      />
    </v-slide-y-transition>
  </v-list>
  <!-- <NoResultsFoundState v-else-if="works.length > 0" /> -->
</template>
