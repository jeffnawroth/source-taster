<script setup lang="ts">
import { onMessage } from 'webext-bridge/popup'
import { autoImportOption } from '~/logic'
import { useDoiStore } from '~/stores/doi'

// App Store
const { bibliography, dois, url } = storeToRefs(useDoiStore())

// Listen for messages
onMessage('bibliography', ({ data }) => {
  bibliography.value = data.selectedText
})

onMessage('autoImportBibliography', ({ data }) => {
  if (!autoImportOption.value)
    return

  url.value = data.url

  bibliography.value = data.selectedText

  bibliography.value = dois.value.length > 0 ? dois.value.join('\n') : ''
})

// I18n
const { t } = useI18n()

// Data

// Computed
const placeholder = computed(() => autoImportOption.value ? t('reload-page-auto-import') : t('insert-dois'))
</script>

<template>
  <v-textarea
    v-model="bibliography"
    auto-grow
    prepend-inner-icon="mdi-text"
    :placeholder
    hide-details="auto"
    max-rows="8"
    rows="2"
    variant="solo-filled"
    autofocus
    clearable
  />
</template>
