<script setup lang="ts">
import { mdiText } from '@mdi/js'
import { onMessage } from 'webext-bridge/popup'
import { useReferencesStore } from '@/extension/stores/references'

// TRANSLATION
const { t } = useI18n()

// REFERENCES STORE
const referencesStore = useReferencesStore()
const { inputText } = storeToRefs(referencesStore)

// TEXTAREA PLACEHOLDER
const placeholder = computed(() => t('insert-references'))

// SYNC TEXT
const currentText = ref('')

watch(currentText, async (newVal) => {
  if (newVal !== inputText.value) {
    inputText.value = newVal
  }
})

onMessage('selectedText', async ({ data }) => {
  currentText.value = data.text
})

// CLEAR HANDLER
const { clearReferences } = referencesStore
function handleClear() {
  clearReferences()
  currentText.value = ''
}

// DISABLED STATE
const { isExtraction, file } = storeToRefs(referencesStore)
const disabled = computed(() => !!file.value || isExtraction.value)
</script>

<template>
  <v-textarea
    v-model.trim="currentText"
    :prepend-inner-icon="mdiText"
    :placeholder
    hide-details="auto"
    rows="2"
    variant="solo-filled"
    clearable
    flat
    :disabled
    @click:clear="handleClear"
  />
</template>
