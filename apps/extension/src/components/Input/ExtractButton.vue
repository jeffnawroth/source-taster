<script setup lang="ts">
import { mdiAutoFix } from '@mdi/js'
import { aiSettings, extractionSettings } from '@/extension/logic/storage'
import { useExtractionStore } from '@/extension/stores/extraction'

// Props
interface Props {
  inputText: string
}

const props = defineProps<Props>()

// Stores
const extractionStore = useExtractionStore()

// Translation
const { t } = useI18n()

// Extract references from input text
async function handleExtractClick() {
  if (!props.inputText.trim())
    return

  try {
    await extractionStore.extractReferences({
      text: props.inputText,
      extractionSettings: extractionSettings.value,
      aiSettings: aiSettings.value,
    })
  }
  catch (error) {
    console.error('Extraction failed:', error)
  }
}
</script>

<template>
  <v-btn
    variant="tonal"
    color="primary"
    :disabled="!inputText.trim() || extractionStore.isExtracting"
    :loading="extractionStore.isExtracting"
    block
    :text="t('extract-references')"
    :prepend-icon="mdiAutoFix"
    @click="handleExtractClick"
  />

  <!-- Error display -->
  <v-alert
    v-if="extractionStore.extractionError"
    type="error"
    variant="tonal"
    closable
    class="mt-2"
    :text="extractionStore.extractionError"
    @click:close="extractionStore.clearExtractionError()"
  />
</template>
