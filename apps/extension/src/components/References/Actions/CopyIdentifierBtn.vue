<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'
import { mdiCheck, mdiContentCopy } from '@mdi/js'

const { reference } = defineProps<{
  reference: ProcessedReference
}>()

// COPY STATE
const isCopied = ref(false)

// COPY IDENTIFIER function
async function copyIdentifier() {
  let identifier = ''

  // Priority: DOI > PMCID > PMID > arXiv > ISBN > ISSN
  if (reference.metadata.identifiers?.doi) {
    identifier = reference.metadata.identifiers.doi
  }
  else if (reference.metadata.identifiers?.pmcid) {
    identifier = reference.metadata.identifiers.pmcid
  }
  else if (reference.metadata.identifiers?.pmid) {
    identifier = reference.metadata.identifiers.pmid
  }
  else if (reference.metadata.identifiers?.arxivId) {
    identifier = reference.metadata.identifiers.arxivId
  }
  else if (reference.metadata.identifiers?.isbn) {
    identifier = reference.metadata.identifiers.isbn
  }
  else if (reference.metadata.identifiers?.issn) {
    identifier = reference.metadata.identifiers.issn
  }

  if (identifier) {
    try {
      await navigator.clipboard.writeText(identifier)

      // Show success icon
      isCopied.value = true

      // Reset icon after 2 seconds
      setTimeout(() => {
        isCopied.value = false
      }, 2000)
    }
    catch (error) {
      console.error('Failed to copy identifier:', error)
    }
  }
}
</script>

<template>
  <v-tooltip
    v-if="reference.metadata.identifiers?.doi || reference.metadata.identifiers?.pmid || reference.metadata.identifiers?.pmcid"
    location="top"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        size="small"
        :icon="isCopied ? mdiCheck : mdiContentCopy"
        :color="isCopied ? 'success' : undefined"
        @click="copyIdentifier"
      />
    </template>
    <span>{{ isCopied ? $t('copy-clicked') : $t('copy-identifier-tooltip') }}</span>
  </v-tooltip>
</template>
