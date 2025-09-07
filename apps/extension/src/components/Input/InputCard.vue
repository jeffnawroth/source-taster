<script setup lang="ts">
import { useMagicKeys } from '@vueuse/core'
import { useExtractionStore } from '@/extension/stores/extraction'
import { useUIStore } from '@/extension/stores/ui'
import ExtractButton from './ExtractButton.vue'
import FileInput from './FileInput.vue'
import ParseButton from './ParseButton.vue'
import TextInput from './TextInput.vue'

// KEYBOARD SHORTCUT FOR CHECK REFERENCES
const uiStore = useUIStore()
const extractionStore = useExtractionStore()

// Get state from new stores
const { inputText, file } = storeToRefs(uiStore)
const { isExtracting } = storeToRefs(extractionStore)

// Check if button should be disabled
const isDisabled = computed(() => (!inputText.value.trim() && !file.value) || isExtracting.value)

// Setup keyboard shortcuts: Cmd+Enter (Mac) / Ctrl+Enter (Windows/Linux)
const keys = useMagicKeys()
const cmdEnter = keys['Cmd+Enter']
const ctrlEnter = keys['Ctrl+Enter']

// Trigger extraction on keyboard shortcut (using new extraction store)
async function triggerExtraction() {
  if (!isDisabled.value && inputText.value.trim()) {
    try {
      await extractionStore.extractReferences(inputText.value)
    }
    catch (error) {
      console.error('Error extraction references via keyboard shortcut:', error)
    }
  }
}

// Watch for keyboard shortcuts
watch(cmdEnter, (pressed) => {
  if (pressed) {
    triggerExtraction()
  }
})

watch(ctrlEnter, (pressed) => {
  if (pressed) {
    triggerExtraction()
  }
})
</script>

<template>
  <v-card
    flat
    :title="`1. ${$t('parse')}`"
    :subtitle="$t('input-references-as-text-or-upload-a-file')"
  >
    <v-card-text
      class="pa-0"
    >
      <v-row dense>
        <!-- File Input -->
        <v-col cols="12">
          <FileInput />
        </v-col>

        <!-- Text Input -->
        <v-col cols="12">
          <TextInput />
        </v-col>

        <!-- Extract Button -->
        <v-col cols="12">
          <ExtractButton
            :input-text
          />
        </v-col>

        <!-- Parse Button -->
        <v-col cols="12">
          <ParseButton
            :input-text
          />
        </v-col>

        <!-- Check Button -->
        <!-- <v-col cols="12">
          <CheckButton />
        </v-col> -->
      </v-row>
    </v-card-text>
  </v-card>
</template>
