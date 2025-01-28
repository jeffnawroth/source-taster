<script setup lang="ts">
import { mdiFilePdfBox } from '@mdi/js'
import { useDoiStore } from '~/stores/doi'
import { extractPDFTextFromFile } from '~/utils/pdfUtils'

// Doi Store
const doiStore = useDoiStore()
const { file, dois } = storeToRefs(doiStore)
const { reset } = doiStore

// PDF TEXT
const { text } = storeToRefs(doiStore)

watch(file, async (newValue) => {
  if (!newValue)
    return
  await extractTextFromPDF(newValue)
})

async function extractTextFromPDF(file: File) {
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
    @click:clear="reset"
  />
</template>
