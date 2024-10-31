<script setup lang="ts">
import { extractText, getDocumentProxy } from 'unpdf'
import { onMessage } from 'webext-bridge/popup'
import { autoImportOption } from '~/logic/storage'
import { useDoiStore } from '~/stores/doi'

// Doi Store
const doiStore = useDoiStore()
const { bibliography, file, url } = storeToRefs(doiStore)

// Data

// Listen for messages
onMessage('autoImportPDFText', ({ data }) => {
  if (!autoImportOption.value)
    return
  url.value = data.url
})

// Methods

async function extractPdfText() {
  try {
    // PDF aus der URL laden
    const response = await fetch(url.value)
    const buffer = await response.arrayBuffer()
    const pdf = await getDocumentProxy(new Uint8Array(buffer))
    const { text } = await extractText(pdf, { mergePages: true })
    bibliography.value = text
  }
  catch (error) {
    console.error('Fehler beim Laden oder Extrahieren der PDF:', error)
  }
}

// Validation
// function validateUrl(value: string | null) {
//   return value?.match(/(http(s)?:\/\/.)?(www\.)?[-\w@:%.+~#=]{2,256}\.[a-z]{2,6}\b([-\w@:%+.~#?&/=]*)/g) || t('invalid-url')
// }

// Watchers
watch(url, (newValue) => {
  if (newValue) {
    extractPdfText()
  }
  else {
    bibliography.value = ''
  }
})
</script>

<template>
  <v-text-field
    v-model="url"
    :placeholder="$t('enter-url')"
    prepend-inner-icon="mdi-link"
    clearable
    variant="solo-filled"
    flat
    :disabled="!!file"
    hide-details="auto"
  />
</template>
