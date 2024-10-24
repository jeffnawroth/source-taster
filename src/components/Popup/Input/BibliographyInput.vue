<script setup lang="ts">
import { autoImportOption } from '~/logic'
import { useDoiStore } from '~/stores/doi'

// App Store
const { bibliography } = storeToRefs(useDoiStore())

// I18n
const { t } = useI18n()

// Data

// Listen for messages
// onMessage('bibliography', ({ data }) => {
//   bibliography.value = data.selectedText
//   extractDOIs(data.selectedText)
// })

// onMessage('autoImportBibliography', ({ data }) => {
//   if (!autoImportOption.value)
//     return

//   const extractedDois = extractDOIs(data.selectedText)

//   bibliography.value = extractedDois.length > 0 ? extractedDois.join('\n') : ''
// })

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
      <!-- @update:model-value="extractDOIs(bibliography)" -->
    </v-card-text>
  </v-card>
</template>
