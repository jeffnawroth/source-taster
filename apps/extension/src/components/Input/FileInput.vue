<script setup lang="ts">
import { mdiFilePdfBox } from '@mdi/js'
import { useAutoCheckReferences } from '@/extension/logic'
import { useAppStore } from '@/extension/stores/app'
import { useReferencesStore } from '@/extension/stores/references'
import { extractTextFromPdfFile } from '@/extension/utils/pdfUtils'

// REFERENCES STORE
const referencesStore = useReferencesStore()

// FILE
const { file } = storeToRefs(useAppStore())

// PDF TEXT
const { inputText } = storeToRefs(referencesStore)
const { extractAndVerifyReferences } = useReferencesStore()

watch(file, async (newValue) => {
  if (!newValue)
    return

  // Extract text from PDF file
  const pdfText = await extractTextFromPdfFile(newValue)

  inputText.value = pdfText

  if (useAutoCheckReferences.value)
    await extractAndVerifyReferences()
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
