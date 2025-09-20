<script setup lang="ts">
import { mdiAutoFix } from '@mdi/js'
import { useMagicKeys } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { settings } from '@/extension/logic'
import { useExtractionStore } from '@/extension/stores/extraction'
import { useUIStore } from '@/extension/stores/ui'
import { useVerificationStore } from '@/extension/stores/verification'

// Stores
const uiStore = useUIStore()
const extractionStore = useExtractionStore()

// Get input text directly from UI store
const { inputText } = storeToRefs(uiStore)
const { isExtracting } = storeToRefs(extractionStore)

// Composable
const verificationStore = useVerificationStore()
const { isVerifying } = storeToRefs(verificationStore)
const { verify } = verificationStore

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
  || !settings.value.ai.canUseAI,
)

// Setup keyboard shortcuts: Cmd+Enter (Mac) / Ctrl+Enter (Windows/Linux)
const keys = useMagicKeys()
const cmdEnter = keys['Cmd+Enter']
const ctrlEnter = keys['Ctrl+Enter']
const shift = keys.Shift
const alt = computed(() => keys.Alt?.value || keys.alt?.value || false)

watch(cmdEnter, (pressed) => {
  if (pressed && !shift.value && !alt.value && !isDisabled.value) {
    handleExtractClick()
  }
})

watch(ctrlEnter, (pressed) => {
  if (pressed && !shift.value && !alt.value && !isDisabled.value) {
    handleExtractClick()
  }
})
</script>

<template>
  <v-btn
    variant="tonal"
    :disabled="isDisabled"
    color="primary"
    block
    @click="handleExtractClick"
  >
    <template #prepend>
      <v-progress-circular
        v-if="isExtracting"
        size="16"
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
