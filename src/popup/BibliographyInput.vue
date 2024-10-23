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

// Computed
const placeholder = computed(() => autoImportOption.value ? 'Refresh the page for auto import' : 'Insert your DOIs here. For example: https://doi.org/10.1111/dome.12082')

// Watchers
watch(autoImportOption, () => bibliography.value = '')

// Functions

// Extracts DOIs from the bibliography
function extractDOIs(textInput: string) {
  let extractedDOIs = []
  dois.value = []

  // Array of various DOI patterns
  const doiPatterns = [
    /10\.\d{4,9}\/[-.\w;()/:]+/g, // Modern Crossref DOIs
    /10\.1002\/\S+/g, // Early Crossref DOIs
    // eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/no-misleading-capturing-group, regexp/optimal-quantifier-concatenation
    /10\.\d{4}\/\d+-\d+X?(\d+)\d+<\w+:\w*>\d+\.\d+\.\w+;\d/gi, // Rare DOI type 1
    /10\.1021\/\w\w\d+/g, // Rare DOI type 2
    /10\.1207\/\w+&\d+_\d+/g, // Rare DOI type 3
  ]

  // Extended pattern for URLs containing DOIs (global flag 'g' to match multiple occurrences)
  const urlPattern = /https?:\/\/[\w.]+\/doi\/(10\.\d{4,9}\/[-.\w;()/:]+)/gi

  // Check for embedded DOIs in URLs (using global flag 'g')
  let urlMatches
  // eslint-disable-next-line no-cond-assign
  while ((urlMatches = urlPattern.exec(textInput)) !== null) {
    extractedDOIs.push(urlMatches[1].replace(/\.$/, '')) // Remove any trailing period
  }

  // Check for normal DOIs based on the defined patterns
  doiPatterns.forEach((pattern) => {
    const matches = textInput.match(pattern)
    if (matches) {
      extractedDOIs.push(
        ...matches.map(match => match.replace(/\.$/, '')), // Remove any trailing period if present
      )
    }
  })

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
