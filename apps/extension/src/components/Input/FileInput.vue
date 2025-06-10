<script setup lang="ts">
import { mdiFilePdfBox } from '@mdi/js'
import { useAutoCheckReferences } from '@/extension/logic'
import { useFileStore } from '@/extension/stores/file'
import { useMetadataStore } from '@/extension/stores/metadata'
import { useTextStore } from '@/extension/stores/text'
import { extractTextFromPdfFile } from '@/extension/utils/pdfUtils'

// Doi Store

// FILE
const { file } = storeToRefs(useFileStore())

// PDF TEXT
const { extractAndSearchMetadata, clear } = useMetadataStore()

const { text } = storeToRefs(useTextStore())

watch(file, async (newValue) => {
  if (!newValue)
    return

  // Extract text from PDF file
  const pdfText = await extractTextFromPdfFile(newValue)

  // Set global text
  text.value = pdfText

  // Handle extraction

  if (useAutoCheckReferences.value)
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
    @click:clear="clear"
  />
</template>
