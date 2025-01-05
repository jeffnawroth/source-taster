<script setup lang="ts">
import { mdiFilePdfBox } from '@mdi/js'
import { useDoiStore } from '~/stores/doi'
import { extractPDFTextFromFile } from '~/utils/pdfUtils'

// Doi Store
const doiStore = useDoiStore()
const { text, file, dois } = storeToRefs(doiStore)

// Handle File Change
async function handleFileChange(files: File | File[]) {
  if (!files)
    return
  const file = Array.isArray(files) ? files[0] : files
  const pdfText = await extractPDFTextFromFile(file)
  text.value = pdfText
  text.value = dois.value.length > 0 ? dois.value.join('\n') : ''
}
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
    @update:model-value="handleFileChange"
  />
</template>
