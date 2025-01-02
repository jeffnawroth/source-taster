<script setup lang="ts">
import { mdiText } from '@mdi/js'
import { onMessage } from 'webext-bridge/popup'
import { autoImportOption } from '~/logic'
import { useDoiStore } from '~/stores/doi'

// App Store
const { textInput, url, extractedDOIs } = storeToRefs(useDoiStore())

// Listen for messages
onMessage('bibliography', ({ data }) => {
  textInput.value = data.selectedText
})

onMessage('autoImportBibliography', ({ data }) => {
  if (!autoImportOption.value)
    return

  url.value = data.url

  textInput.value = data.selectedText
  textInput.value = extractedDOIs.value.length > 0 ? extractedDOIs.value.join('\n') : ''
})

// I18n
const { t } = useI18n()

// Data

// Computed
const placeholder = computed(() => autoImportOption.value ? t('reload-page-auto-import') : t('insert-dois'))
</script>

<template>
  <v-textarea
    v-model="textInput"
    auto-grow
    :prepend-inner-icon="mdiText"
    :placeholder
    hide-details="auto"
    max-rows="8"
    rows="2"
    variant="solo-filled"
    autofocus
    clearable
  />
</template>
