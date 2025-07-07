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

watch(file, async (newValue) => {
  if (!newValue)
    return

  // Extract text from PDF file
  const pdfText = await extractTextFromPdfFile(newValue)

  inputText.value = pdfText
})

// CLEAR HANDLER
const { clearReferences } = referencesStore

function handleClear() {
  clearReferences()
  file.value = null
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
    @click:clear="handleClear"
  />
</template>
