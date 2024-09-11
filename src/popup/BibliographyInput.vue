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
  extractDOIs(data.selectedText)
})

onMessage('autoImportBibliography', ({ data }) => {
  if (!autoImportOption.value)
    return

  const extractedDois = extractDOIs(data.selectedText)

  bibliography.value = extractedDois.length > 0 ? extractedDois.join('\n') : ''
})

const placeholder = computed(() => autoImportOption.value ? 'Refresh the page for auto import' : 'Insert your DOIs here. For example: https://doi.org/10.1111/dome.12082')

watch(autoImportOption, () => bibliography.value = '')

// Functions

// Extracts DOIs from the bibliography
function extractDOIs(textInput: string) {
  let extractedDOIs = []

  const doiPattern = /(https:\/\/doi\.org\/)?(10\.\d{4,9}\/[-.\w;()/:]+)/gi

  const matches = textInput.match(doiPattern)

  extractedDOIs = matches?.map((match) => {
    // Remove the prefix if it exists
    const doi = match.replace('https://doi.org/', '')
    // Remove any trailing dot
    return doi.replace(/\.$/, '')
  }) || []

  // Remove duplicates
  extractedDOIs = [...new Set(extractedDOIs)]

  dois.value = extractedDOIs

  return extractedDOIs
}
</script>

<template>
  <v-textarea
    v-model="bibliography"
    label="Bibliography"
    auto-grow
    :placeholder
    hide-details
    max-rows="8"
    variant="outlined"
    :rows="3"
    autofocus
    clearable
    @update:model-value="extractDOIs(bibliography)"
  />
</template>
