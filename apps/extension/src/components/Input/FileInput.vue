<script setup lang="ts">
import { useFileStore } from '@/extension/stores/file'
import { useMetadataStore } from '@/extension/stores/metadata'
import { useTextStore } from '@/extension/stores/text'
import { extractTextFromPdfFile } from '@/extension/utils/pdfUtils'
import { mdiFilePdfBox } from '@mdi/js'

// Doi Store

// FILE
const { file } = storeToRefs(useFileStore())

// PDF TEXT
const { text } = storeToRefs(useTextStore())
const { extractAndSearchMetadata } = useMetadataStore()

watch(file, async (newValue) => {
  if (!newValue)
    return

  // Extract text from PDF file
  const pdfText = await extractTextFromPdfFile(newValue)

  text.value = pdfText

  // Handle extraction
  await extractAndSearchMetadata(pdfText)
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
