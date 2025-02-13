<script setup lang="ts">
import { mdiText } from '@mdi/js'
import { onMessage } from 'webext-bridge/popup'
import { useAutoImport } from '~/logic'

// TRANSLATION
const { t } = useI18n()

// Doi Store
const doiStore = useDoiStore()
const { extractedDois } = storeToRefs(doiStore)
const { reset, handleDoisExtraction } = doiStore

// TEXTAREA PLACEHOLDER
const placeholder = computed(() => useAutoImport.value ? t('reload-page-auto-import') : t('insert-dois'))

// SET SELECTED TEXT
const { text } = storeToRefs(useTextStore())

onMessage('selectedText', async ({ data }) => {
  text.value = data.text
  await handleTextChange(data.text)
})

// SET AUTO IMPORTED TEXT
onMessage('autoImportText', async ({ data }) => {
  if (!useAutoImport.value)
    return

  await handleTextChange(data.text)
  text.value = extractedDois.value.length > 0 ? extractedDois.value.join('\n') : ''
})

// HANDLE TEXT CHANGE
async function handleTextChange(newVal: string) {
  await handleDoisExtraction(newVal)
}
</script>

<template>
  <v-textarea
    v-model="text"
    auto-grow
    :prepend-inner-icon="mdiText"
    :placeholder
    hide-details="auto"
    max-rows="8"
    rows="2"
    variant="solo-filled"
    clearable
    @update:model-value="handleTextChange($event)"
    @click:clear="reset"
  />
</template>
