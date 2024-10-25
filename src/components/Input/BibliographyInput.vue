<script setup lang="ts">
import { onMessage } from 'webext-bridge/popup'
import { autoImportOption } from '~/logic'
import { useDoiStore } from '~/stores/doi'

// App Store
const { bibliography, dois } = storeToRefs(useDoiStore())

// Listen for messages
onMessage('bibliography', ({ data }) => {
  bibliography.value = data.selectedText
})

onMessage('autoImportBibliography', ({ data }) => {
  if (!autoImportOption.value)
    return

  bibliography.value = data.selectedText

  bibliography.value = dois.value.length > 0 ? dois.value.join('\n') : ''
})

// I18n
const { t } = useI18n()

// Data

// Computed
const placeholder = computed(() => autoImportOption.value ? t('reload-page-auto-import') : t('insert-dois'))

// Watchers
watch(autoImportOption, () => bibliography.value = '')
</script>

<template>
  <v-card
    title="DOI(s)"
    prepend-icon="mdi-text"
    flat
  >
    <v-card-text
      class="pa-0"
    >
      <v-textarea
        v-model="bibliography"
        auto-grow
        :placeholder
        hide-details
        max-rows="8"
        rows="2"
        variant="outlined"
        autofocus
        clearable
      />
    </v-card-text>
  </v-card>
</template>
