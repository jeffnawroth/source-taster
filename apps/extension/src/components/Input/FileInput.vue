<script setup lang="ts">
import { mdiFilePdfBox } from '@mdi/js'
import { useUIStore } from '@/extension/stores/ui'
import { extractTextFromPdfFile } from '@/extension/utils/pdfUtils'

interface Props {
  /** Disable the file input */
  disabled?: boolean
  /** Messages to display */
  messages?: string | string[]
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  messages: () => [],
})

// UI STORE
const uiStore = useUIStore()
const { file, inputText } = storeToRefs(uiStore)

// Loading state for PDF extraction
const isExtractionPdf = ref(false)

watch(file, async (newValue) => {
  if (!newValue) {
    inputText.value = ''
    return
  }

  try {
    isExtractionPdf.value = true

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
    console.error('Error extraction PDF file:', error)
    inputText.value = ''
  }
  finally {
    isExtractionPdf.value = false
  }
})

// CLEAR HANDLER
function handleClear() {
  uiStore.clearAll()
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
    :loading="isExtractionPdf"
    :disabled="isExtractionPdf || props.disabled"
    :messages="props.messages"
    @click:clear="handleClear"
  />
</template>
