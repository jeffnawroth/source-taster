<script setup lang="ts">
import { useMagicKeys } from '@vueuse/core'
import { useReferencesStore } from '@/extension/stores/references'
import CheckButton from './CheckButton.vue'
import FileInput from './FileInput.vue'
import TextInput from './TextInput.vue'

// COMPONENTS
const components = [
  FileInput,
  TextInput,
  CheckButton,
]

// KEYBOARD SHORTCUT FOR CHECK REFERENCES
const referencesStore = useReferencesStore()
const { inputText, isProcessing, file } = storeToRefs(referencesStore)
const { extractAndVerifyReferences } = referencesStore

// Check if button should be disabled (same logic as in CheckReferencesButton)
const isDisabled = computed(() => (!inputText.value.trim() && !file.value) || isProcessing.value)

// Setup keyboard shortcuts: Cmd+Enter (Mac) / Ctrl+Enter (Windows/Linux)
const keys = useMagicKeys()
const cmdEnter = keys['Cmd+Enter']
const ctrlEnter = keys['Ctrl+Enter']

// Trigger check references on keyboard shortcut
async function triggerCheckReferences() {
  if (!isDisabled.value) {
    try {
      await extractAndVerifyReferences()
    }
    catch (error) {
      console.error('Error processing references via keyboard shortcut:', error)
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
  >
    <v-card-text
      class="pa-0"
    >
      <v-row dense>
        <v-col
          v-for="(component, index) in components"
          :key="index"
          cols="12"
        >
          <component :is="component" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
