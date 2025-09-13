<script setup lang="ts">
import { mdiText } from '@mdi/js'
import { onMessage } from 'webext-bridge/popup'
import { settings } from '@/extension/logic'
import { useExtractionStore } from '@/extension/stores/extraction'
import { useMatchingStore } from '@/extension/stores/matching'
import { useUIStore } from '@/extension/stores/ui'

// TRANSLATION
const { t } = useI18n()

// STORES
const uiStore = useUIStore()
const extractionStore = useExtractionStore()
const matchingStore = useMatchingStore()

const { inputText, file } = storeToRefs(uiStore)
const { isExtracting } = storeToRefs(extractionStore)
const { isMatching } = storeToRefs(matchingStore)

// TEXTAREA PLACEHOLDER - Dynamic based on AI setting
const placeholder = computed(() => {
  if (settings.value.extract.useAi) {
    // AI mode - can handle various formats and unstructured text
    return `${t('ai-placeholder-example')}:
"Machine learning applications in healthcare research showed significant improvements..."
Reference: Smith et al. Nature Medicine 2023, Vol 29, pp 1234-1245
DOI: 10.1038/s41591-023-01234-5`
  }
  else {
    // Parse mode - needs structured references
    return `${t('parse-placeholder-example')}:
Smith, J. (2020). Example article. Journal of Examples, 15(3), 123-145.

Doe, J., & Brown, A. (2019). Another reference. Science Publishing, New York.`
  }
})

// Handle incoming selected text from content script
onMessage('selectedText', async ({ data }) => {
  inputText.value = data.text
})

// CLEAR HANDLER
function handleClear() {
  // Clear input text and display references
  uiStore.clearAll()
  // Also clear extracted references
  extractionStore.clearExtractedReferences()
}

// DISABLED STATE - disabled when file is loaded or any process is running
const disabled = computed(() => !!file.value || isExtracting.value || isMatching.value)
</script>

<template>
  <v-textarea
    v-model.trim="inputText"
    :prepend-inner-icon="mdiText"
    :placeholder
    hide-details="auto"
    rows="4"
    variant="solo-filled"
    clearable
    flat
    :disabled
    @click:clear="handleClear"
  />
</template>
