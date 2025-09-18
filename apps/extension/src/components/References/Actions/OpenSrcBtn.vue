<script setup lang="ts">
import type { ApiExtractReference } from '@source-taster/types'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'
import { mdiOpenInNew } from '@mdi/js'

const { reference } = defineProps<{
  reference: DeepReadonly<UnwrapNestedRefs<ApiExtractReference>>
}>()

// PRIMARY URL for opening source
const primaryUrl = computed(() => {
  // Priority: DOI > PMC > PMID > URL
  if (reference.metadata.DOI) {
    return `https://doi.org/${reference.metadata.DOI}`
  }
  if (reference.metadata.PMCID) {
    const pmcid = reference.metadata.PMCID.startsWith('PMC')
      ? reference.metadata.PMCID
      : `PMC${reference.metadata.PMCID}`
    return `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`
  }
  if (reference.metadata.PMID) {
    return `https://pubmed.ncbi.nlm.nih.gov/${reference.metadata.PMID}`
  }
  if (reference.metadata.URL) {
    return reference.metadata.URL
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
        color="undefined"
        size="small"
        :icon="mdiOpenInNew"
        @click="openSource"
      />
    </template>
    <span>{{ $t('open-source-tooltip') }}</span>
  </v-tooltip>
</template>
