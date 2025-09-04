<script setup lang="ts">
import type { ExtractedReference } from '@/extension/types/reference'
import { mdiCheck, mdiContentCopy } from '@mdi/js'

const { reference } = defineProps<{
  reference: ExtractedReference
}>()

// COPY STATE
const isCopied = ref(false)

// COPY IDENTIFIER function
async function copyIdentifier() {
  let identifier = ''

  // Priority: DOI > PMCID > PMID > arXiv > ISBN > ISSN
  if (reference.metadata.DOI) {
    identifier = reference.metadata.DOI
  }
  else if (reference.metadata.PMCID) {
    identifier = reference.metadata.PMCID
  }
  else if (reference.metadata.PMID) {
    identifier = reference.metadata.PMID
  }
  else if (reference.metadata.arxivId) {
    identifier = reference.metadata.arxivId
  }
  else if (reference.metadata.ISBN) {
    identifier = reference.metadata.ISBN
  }
  else if (reference.metadata.ISSN) {
    identifier = reference.metadata.ISSN
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
    v-if="reference.metadata.DOI || reference.metadata.PMID || reference.metadata.PMCID"
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
