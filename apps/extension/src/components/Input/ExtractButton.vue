<script setup lang="ts">
import { mdiAutoFix } from '@mdi/js'
import { useMagicKeys } from '@vueuse/core'
import { settings } from '@/extension/logic'
import { useExtractionStore } from '@/extension/stores/extraction'
import { useUIStore } from '@/extension/stores/ui'
// Stores
const extractionStore = useExtractionStore()
const uiStore = useUIStore()

// Get input text directly from UI store
const { inputText } = storeToRefs(uiStore)

// Translation
const { t } = useI18n()

// Extract references from input text
async function handleExtractClick() {
  if (!inputText.value.trim())
    return

  await extractionStore.extractReferences(inputText.value)
}

// Check if button should be disabled
const isDisabled = computed(() => !inputText.value.trim() || extractionStore.isExtracting || !settings.value.extract.useAi)

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
    :text="$t(extractionStore.extractionError)"
    @click:close="extractionStore.clearExtractionError()"
  />
</template>
