<script setup lang="ts">
import { mdiText } from '@mdi/js'
import { useDebounceFn } from '@vueuse/core'
import { onMessage } from 'webext-bridge/popup'
import { useAutoCheckReferences, useAutoImport } from '@/extension/logic'
import { useFileStore } from '@/extension/stores/file'
import { useMetadataStore } from '@/extension/stores/metadata'
import { useTextStore } from '@/extension/stores/text'

// TRANSLATION
const { t } = useI18n()

// TEXTAREA PLACEHOLDER
const placeholder = computed(() => useAutoImport.value ? t('reload-page-auto-import') : t('insert-references'))

// HANDLE TEXT CHANGE
const { extractAndSearchMetadata, clear } = useMetadataStore()

// AUTO CHECK REFERENCES
const handleTextChange = useDebounceFn(async (newVal: string) => {
  if (useAutoCheckReferences.value)
    await extractAndSearchMetadata(newVal)
}, 1000)

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

// DISABLED STATE
const { file } = storeToRefs(useFileStore())
const disabled = computed(() => !!file.value)
</script>

<template>
  <v-textarea
    v-model.trim="text"
    :prepend-inner-icon="mdiText"
    :placeholder
    rows="2"
    variant="solo-filled"
    clearable
    flat
    :disabled
    :messages="disabled ? [t('remove-file-to-enable-text-input')] : []"
    @click:clear="clear"
    @update:model-value="handleTextChange($event)"
  />
</template>
