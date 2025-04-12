<script setup lang="ts">
import { useDoiStore } from '@/extension/stores/doi'
import { useFileStore } from '@/extension/stores/file'
import { useIssnStore } from '@/extension/stores/issn'
import { useTextStore } from '@/extension/stores/text'
import { extractTextFromPdfFile } from '@/extension/utils/pdfUtils'
import { mdiFilePdfBox } from '@mdi/js'

// Doi Store

// FILE
const { file } = storeToRefs(useFileStore())

// PDF TEXT
const { text } = storeToRefs(useTextStore())

const doiStore = useDoiStore()
const { dois } = storeToRefs(doiStore)
const { processDois } = doiStore

const issnStore = useIssnStore()
const { issns } = storeToRefs(issnStore)
const { processIssns } = issnStore
watch(file, async (newValue) => {
  if (!newValue)
    return

  // Extract text from PDF file
  const pdfText = await extractTextFromPdfFile(newValue)

  // Handle extraction
  await Promise.all([processDois(pdfText), processIssns(pdfText)])

  // Set text value to DOIs and ISSNs
  text.value = dois.value.length > 0 ? dois.value.map(doi => doi.value).join('\n') : ''
  text.value += issns.value.length > 0 ? issns.value.map(issn => issn.value).join('\n') : ''
})
</script>

<template>
  <v-file-input
    v-model="file"
    accept=".pdf"
    :label="$t('pdf-file')"
    variant="solo-filled"
    flat
    :prepend-inner-icon="mdiFilePdfBox"
    prepend-icon=""
    clearable
    hide-details="auto"
  />
</template>
