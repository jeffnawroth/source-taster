<script setup lang="ts">
import { mdiAutoFix } from '@mdi/js'
import { useMagicKeys } from '@vueuse/core'
import { useVerification } from '@/extension/composables/useVerification'
import { settings } from '@/extension/logic'
import { useExtractionStore } from '@/extension/stores/extraction'
import { useUIStore } from '@/extension/stores/ui'

// Stores
const uiStore = useUIStore()
const extractionStore = useExtractionStore()

// Get input text directly from UI store
const { inputText } = storeToRefs(uiStore)
const { isExtracting } = storeToRefs(extractionStore)

// Composable
const { isVerifying, verify } = useVerification()

// Translation
const { t } = useI18n()

// Extract and verify in one step
async function handleExtractClick() {
  if (!inputText.value.trim())
    return

  const res = await extractionStore.extractReferences(inputText.value)
  if (!res.success)
    return

  await verify()
}

// Check if button should be disabled
const isDisabled = computed(() =>
  !inputText.value.trim()
  || isExtracting.value
  || isVerifying.value
  || !settings.value.extract.useAi,
)

// Setup keyboard shortcuts: Cmd+Enter (Mac) / Ctrl+Enter (Windows/Linux)
const keys = useMagicKeys()
const cmdEnter = keys['Cmd+Enter']
const ctrlEnter = keys['Ctrl+Enter']

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
        v-if="isExtracting"
        size="20"
        width="2"
        indeterminate
      />
      <v-icon
        v-else
        :icon="mdiAutoFix"
      />
    </template>

    {{ isExtracting ? `${t('extracting')}...` : t('extract-references') }}
  </v-btn>
</template>
