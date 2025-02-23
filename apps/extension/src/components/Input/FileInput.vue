<script setup lang="ts">
import { useDoiStore } from '@/extension/stores/doi'
import { useFileStore } from '@/extension/stores/file'
import { useTextStore } from '@/extension/stores/text'
import { extractTextFromPdfFile } from '@/extension/utils/pdfUtils'
import { mdiFilePdfBox } from '@mdi/js'

// Doi Store
const doiStore = useDoiStore()
const { extractedDois } = storeToRefs(doiStore)
const { handleDoisExtraction } = doiStore

// FILE
const { file } = storeToRefs(useFileStore())

// PDF TEXT
const { text } = storeToRefs(useTextStore())

watch(file, async (newValue) => {
  if (!newValue)
    return

  // Extract text from PDF file
  const pdfText = await extractTextFromPdfFile(newValue)

  // Handle DOIs extraction
  await handleDoisExtraction(pdfText)

  // Set text value to DOIs
  text.value = extractedDois.value.length > 0 ? extractedDois.value.join('\n') : ''
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
