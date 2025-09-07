<script setup lang="ts">
import { mdiText } from '@mdi/js'
import { onMessage } from 'webext-bridge/popup'
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

// TEXTAREA PLACEHOLDER
const placeholder = `${t('example')}:
Smith, J. (2020). Example article. Journal of Examples, 15(3), 123-145.

Doe, J., & Brown, A. (2019). Another reference. Science Publishing, New York.`

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
    rows="2"
    variant="solo-filled"
    clearable
    flat
    :disabled
    @click:clear="handleClear"
  />
</template>
