<script setup lang="ts">
import { mdiText } from '@mdi/js'
import { useDebounceFn } from '@vueuse/core'
import { onMessage } from 'webext-bridge/popup'
import { useAutoImport } from '@/extension/logic'
import { useMetadataStore } from '@/extension/stores/metadata'
import { useTextStore } from '@/extension/stores/text'

// TRANSLATION
const { t } = useI18n()

// TEXTAREA PLACEHOLDER
const placeholder = computed(() => useAutoImport.value ? t('reload-page-auto-import') : t('insert-dois'))

// HANDLE TEXT CHANGE
const { extractAndSearchMetadata } = useMetadataStore()

const handleTextChange = useDebounceFn(async (newVal: string) => await extractAndSearchMetadata(newVal), 1000)

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

  text.value = data.text
  await handleTextChange(data.text)
})
</script>

<template>
  <v-textarea
    v-model.trim="text"
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
