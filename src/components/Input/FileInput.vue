<script setup lang="ts">
import { mdiFilePdfBox } from '@mdi/js'
import { useDoiStore } from '~/stores/doi'
import { useFileStore } from '~/stores/file'
import { useTextStore } from '~/stores/text'
import { extractTextFromPdfFile } from '~/utils/pdfUtils'

// Doi Store
const doiStore = useDoiStore()
const { extractedDois } = storeToRefs(doiStore)
const { reset, handleDoisExtraction } = doiStore

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
    @click:clear="reset"
  />
</template>
