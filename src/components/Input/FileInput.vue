<script setup lang="ts">
import { mdiFilePdfBox } from '@mdi/js'
import { useDoiStore } from '~/stores/doi'
import { extractTextFromPdfFile } from '~/utils/pdfUtils'

// Doi Store
const doiStore = useDoiStore()
const { file, dois } = storeToRefs(doiStore)
const { reset, handleDoisExtraction } = doiStore

// PDF TEXT
const { text } = storeToRefs(doiStore)

watch(file, async (newValue) => {
  if (!newValue)
    return
  const pdfText = await extractTextFromPdfFile(newValue)
  handleDoisExtraction(pdfText)
  text.value = dois.value.length > 0 ? dois.value.join('\n') : ''
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
