<script setup lang="ts">
import { mdiText } from '@mdi/js'
import { onMessage } from 'webext-bridge/popup'
import { useAutoImport } from '~/logic'
import { useDoiStore } from '~/stores/doi'

// TRANSLATION
const { t } = useI18n()

// Doi Store
const doiStore = useDoiStore()
const { text, dois } = storeToRefs(doiStore)
const { reset, handleDoisExtraction } = doiStore

// TEXTAREA PLACEHOLDER
const placeholder = computed(() => useAutoImport.value ? t('reload-page-auto-import') : t('insert-dois'))

// SET SELECTED TEXT
onMessage('selectedText', ({ data }) => {
  text.value = data.text
  handleTextChange(data.text)
})

// SET AUTO IMPORTED TEXT
onMessage('autoImportText', ({ data }) => {
  if (!useAutoImport.value)
    return

  handleTextChange(data.text)
  text.value = dois.value.length > 0 ? dois.value.join('\n') : ''
})

// HANDLE TEXT CHANGE
function handleTextChange(newVal: string) {
  if (newVal.trim() === '')
    return
  handleDoisExtraction(newVal)
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
