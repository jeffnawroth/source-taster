<script setup lang="ts">
import { mdiFilePdfBox } from '@mdi/js'
import { useReferencesStore } from '@/extension/stores/references'
import { extractTextFromPdfFile } from '@/extension/utils/pdfUtils'

// REFERENCES STORE
const referencesStore = useReferencesStore()

// FILE
const { file } = storeToRefs(referencesStore)

// PDF TEXT
const { inputText } = storeToRefs(referencesStore)

// Loading state for PDF processing
const isProcessingPdf = ref(false)

watch(file, async (newValue) => {
  if (!newValue) {
    inputText.value = ''
    return
  }

  try {
    isProcessingPdf.value = true

    // Extract text from PDF file
    const pdfText = await extractTextFromPdfFile(newValue)

    if (pdfText) {
      inputText.value = pdfText
    }
    else {
      // Handle case where PDF extraction failed
      console.warn('Failed to extract text from PDF file')
      inputText.value = ''
    }
  }
  catch (error) {
    console.error('Error processing PDF file:', error)
    inputText.value = ''
  }
  finally {
    isProcessingPdf.value = false
  }
})

// CLEAR HANDLER
const { clearReferences } = referencesStore

function handleClear() {
  clearReferences()
  file.value = null
  inputText.value = ''
}
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
    :loading="isProcessingPdf"
    :disabled="isProcessingPdf"
    @click:clear="handleClear"
  />
</template>
