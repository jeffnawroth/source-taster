<script setup lang="ts">
import type { ProcessedReference } from '@/extension/types/reference'
import { mdiOpenInNew } from '@mdi/js'

const { reference } = defineProps<{
  reference: ProcessedReference
}>()

// PRIMARY URL for opening source
const primaryUrl = computed(() => {
  // Priority: DOI > PMC > PMID > URL
  if (reference.metadata.identifiers?.doi) {
    return `https://doi.org/${reference.metadata.identifiers.doi}`
  }
  if (reference.metadata.identifiers?.pmcid) {
    const pmcid = reference.metadata.identifiers.pmcid.startsWith('PMC')
      ? reference.metadata.identifiers.pmcid
      : `PMC${reference.metadata.identifiers.pmcid}`
    return `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`
  }
  if (reference.metadata.identifiers?.pmid) {
    return `https://pubmed.ncbi.nlm.nih.gov/${reference.metadata.identifiers.pmid}`
  }
  if (reference.metadata.source.url) {
    return reference.metadata.source.url
  }
  return undefined
})

// OPEN SOURCE function
function openSource() {
  if (primaryUrl.value) {
    window.open(primaryUrl.value, '_blank')
  }
}
</script>

<template>
  <v-tooltip
    v-if="primaryUrl"
    location="top"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        size="small"
        :icon="mdiOpenInNew"
        @click="openSource"
      />
    </template>
    <span>{{ $t('open-source-tooltip') }}</span>
  </v-tooltip>
</template>
