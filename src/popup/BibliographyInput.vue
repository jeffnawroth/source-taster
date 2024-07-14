<script setup lang="ts">
import { onMessage } from 'webext-bridge/popup'
import { autoImportOption } from '~/logic'

// Props
const dois = defineModel<string[]>({ required: true, default: [] })

// Data
const bibliography = ref('')

// Listen for messages
onMessage('bibliography', ({ data }) => {
  bibliography.value = data.selectedText
})

onMessage('autoImportBibliography', ({ data }) => {
  if (autoImportOption.value) {
    bibliography.value = data.selectedText
  }
})

const placeholder = computed(() => autoImportOption.value ? 'Refresh the page for auto import' : 'Insert your bibliography here. For example: https://doi.org/10.1111/dome.12082')

// Watchers
watch(() => bibliography.value, () => extractDOIs())

watch(autoImportOption, () => bibliography.value = '')

// Functions

// Extracts DOIs from the bibliography
function extractDOIs() {
  dois.value = []
  const doiPattern = /(https:\/\/doi\.org\/)?(10\.\d{4,9}\/[-.\w;()/:]+)/gi

  const matches = bibliography.value.match(doiPattern)
  if (!matches)
    return []

  dois.value = matches.map((match) => {
    // Remove the prefix if it exists
    const doi = match.replace('https://doi.org/', '')
    // Remove any trailing dot
    return doi.replace(/\.$/, '')
  })
}
</script>

<template>
  <v-textarea
    v-model="bibliography"
    auto-grow
    :placeholder
    hide-details
    max-rows="8"
    :rows="3"
    autofocus
  />
</template>
