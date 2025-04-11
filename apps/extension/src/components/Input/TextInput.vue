<script setup lang="ts">
import { useAutoImport } from '@/extension/logic'
import { useDoiStore } from '@/extension/stores/doi'
import { useIssnStore } from '@/extension/stores/issn'
import { useTextStore } from '@/extension/stores/text'
import { mdiText } from '@mdi/js'
import { onMessage } from 'webext-bridge/popup'

// TRANSLATION
const { t } = useI18n()

// Doi Store
const doiStore = useDoiStore()
const { dois } = storeToRefs(doiStore)
const { processDois } = doiStore

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
  text.value = dois.value.length > 0 ? dois.value.join('\n') : ''
})

// HANDLE TEXT CHANGE
const { processIssns } = useIssnStore()

async function handleTextChange(newVal: string) {
  Promise.all([
    processDois(newVal),
    processIssns(newVal),
  ])
}
</script>

<template>
  <v-textarea
    v-model="text"
    auto-grow
    :prepend-inner-icon="mdiText"
    :placeholder
    hide-details="auto"
    max-rows="4"
    rows="2"
    variant="solo-filled"
    clearable
    @update:model-value="handleTextChange($event)"
  />
</template>
