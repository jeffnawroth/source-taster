<script setup lang="ts">
import { mdiAutoFix } from '@mdi/js'
import { useMagicKeys } from '@vueuse/core'
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
    await extractionStore.extractReferences(props.inputText)
  }
  catch (error) {
    console.error('Extraction failed:', error)
  }
}

// Check if button should be disabled
const isDisabled = computed(() => !props.inputText.trim() || extractionStore.isExtracting)

// Setup keyboard shortcuts: Cmd+Enter (Mac) / Ctrl+Enter (Windows/Linux)
const keys = useMagicKeys()
const cmdEnter = keys['Cmd+Enter']
const ctrlEnter = keys['Ctrl+Enter']

// Watch for keyboard shortcuts
watch(cmdEnter, (pressed) => {
  if (pressed && !isDisabled.value) {
    handleExtractClick()
  }
})

watch(ctrlEnter, (pressed) => {
  if (pressed && !isDisabled.value) {
    handleExtractClick()
  }
})
</script>

<template>
  <v-btn
    variant="tonal"
    color="primary"
    :disabled="isDisabled"
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
