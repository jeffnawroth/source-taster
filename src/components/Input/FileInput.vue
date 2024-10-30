<script setup lang="ts">
import { extractText, getDocumentProxy } from 'unpdf'
import { useDoiStore } from '~/stores/doi'

// Doi Store
const doiStore = useDoiStore()
const { bibliography, url, file } = storeToRefs(doiStore)

// Data

// Functions
async function extractPDFText() {
  if (file.value && file.value.type === 'application/pdf') {
    try {
      const buffer = await file.value.arrayBuffer()

      const pdf = await getDocumentProxy(new Uint8Array(buffer))

      const { text } = await extractText(pdf, { mergePages: true })

      bibliography.value = text
    }
    catch (error) {
      console.error('Error extracting text:', error)
    }
  }
  else {
    bibliography.value = ''
    console.warn('Please upload a valid PDF file.')
  }
}

watch(file, (newValue) => {
  if (newValue) {
    extractPDFText()
  }
  else {
    bibliography.value = ''
  }
})
</script>

<template>
  <v-file-input
    v-model="file"
    accept=".pdf"
    :label="$t('upload-pdf')"
    variant="solo-filled"
    flat
    prepend-inner-icon="mdi-file-pdf-box"
    prepend-icon=""
    clearable
    :disabled="!!url"
  />
</template>
