<script setup lang="ts">
import { mdiText } from '@mdi/js'
import { onMessage } from 'webext-bridge/popup'
import { autoImportOption } from '~/logic'
import { useDoiStore } from '~/stores/doi'

// App Store
const { text, dois } = storeToRefs(useDoiStore())

// Listen for messages
onMessage('bibliography', ({ data }) => {
  text.value = data.selectedText
})

onMessage('autoImportText', ({ data }) => {
  if (!autoImportOption.value)
    return

  text.value = data.text

  text.value = dois.value.length > 0 ? dois.value.join('\n') : ''
})

// I18n
const { t } = useI18n()

// Data

// Computed
const placeholder = computed(() => autoImportOption.value ? t('reload-page-auto-import') : t('insert-dois'))
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
    autofocus
    clearable
  />
</template>
