<script setup lang="ts">
import { mdiFilePdfBox } from '@mdi/js'
import { extractText, getDocumentProxy } from 'unpdf'
import { useDoiStore } from '~/stores/doi'

// Doi Store
const doiStore = useDoiStore()
const { bibliography, file, dois } = storeToRefs(doiStore)

// Data

// Functions
async function extractPDFText() {
  if (file.value && file.value.type === 'application/pdf') {
    try {
      const buffer = await file.value.arrayBuffer()

      const pdf = await getDocumentProxy(new Uint8Array(buffer))

      const { text } = await extractText(pdf, { mergePages: true })

      bibliography.value = text

      bibliography.value = dois.value.length > 0 ? dois.value.join('\n') : ''
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
    :prepend-inner-icon="mdiFilePdfBox"
    prepend-icon=""
    clearable
    hide-details="auto"
  />
</template>
