<script setup lang="ts">
import { mdiAutoFix } from '@mdi/js'
import { useMagicKeys } from '@vueuse/core'
import { useExtractThenVerify } from '@/extension/composables/useExtractThenVerify'
import { settings } from '@/extension/logic'
import { useUIStore } from '@/extension/stores/ui'

// Stores
const uiStore = useUIStore()

// Get input text directly from UI store
const { inputText } = storeToRefs(uiStore)

// Composable
const { extractThenVerify, isRunning, error } = useExtractThenVerify()

// Translation
const { t } = useI18n()

// Extract and verify in one step
async function handleExtractClick() {
  if (!inputText.value.trim())
    return

  await extractThenVerify(inputText.value)
}

// Check if button should be disabled
const isDisabled = computed(() =>
  !inputText.value.trim() || isRunning.value || !settings.value.extract.useAi,
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
        v-if="isRunning"
        size="20"
        width="2"
        indeterminate
      />
      <v-icon
        v-else
        :icon="mdiAutoFix"
      />
    </template>

    {{ isRunning ? `${t('extracting')}...` : t('extract-references') }}
  </v-btn>

  <v-alert
    v-if="error"
    type="error"
    variant="tonal"
    class="mt-3"
    closable
    @click:close="error = null"
  >
    {{ error }}
  </v-alert>
</template>
