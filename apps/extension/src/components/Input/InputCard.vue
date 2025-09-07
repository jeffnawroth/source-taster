<script setup lang="ts">
import { useMagicKeys } from '@vueuse/core'
import { useReferencesStore } from '@/extension/stores/references'
import ExtractButton from './ExtractButton.vue'
import FileInput from './FileInput.vue'
import ParseButton from './ParseButton.vue'
import TextInput from './TextInput.vue'

// KEYBOARD SHORTCUT FOR CHECK REFERENCES
const referencesStore = useReferencesStore()
const { inputText, isExtraction, file } = storeToRefs(referencesStore)
const { extractAndMatchReferences } = referencesStore

// Check if button should be disabled (same logic as in CheckReferencesButton)
const isDisabled = computed(() => (!inputText.value.trim() && !file.value) || isExtraction.value)

// Setup keyboard shortcuts: Cmd+Enter (Mac) / Ctrl+Enter (Windows/Linux)
const keys = useMagicKeys()
const cmdEnter = keys['Cmd+Enter']
const ctrlEnter = keys['Ctrl+Enter']

// Trigger check references on keyboard shortcut
async function triggerCheckReferences() {
  if (!isDisabled.value) {
    try {
      await extractAndMatchReferences()
    }
    catch (error) {
      console.error('Error extraction references via keyboard shortcut:', error)
    }
  }
}

// Watch for keyboard shortcuts
watch(cmdEnter, (pressed) => {
  if (pressed) {
    triggerCheckReferences()
  }
})

watch(ctrlEnter, (pressed) => {
  if (pressed) {
    triggerCheckReferences()
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
