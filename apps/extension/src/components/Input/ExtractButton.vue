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
    block
    @click="handleExtractClick"
  >
    <template #prepend>
      <v-progress-circular
        v-if="extractionStore.isExtracting"
        size="20"
        width="2"
        indeterminate
      />
      <v-icon
        v-else
        :icon="mdiAutoFix"
      />
    </template>

    {{ extractionStore.isExtracting ? `${t('extracting')}...` : t('extract-references') }}
  </v-btn>
</template>
