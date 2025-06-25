<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'

const { reference } = defineProps<{
  reference: ProcessedReference
}>()

// AUTHORS
// If there are more than 2 authors, show first 2 and "et al."
const authors = computed(() => {
  if (reference.metadata.authors && reference.metadata.authors.length > 2) {
    return `${reference.metadata.authors.slice(0, 2).join(', ')} et al.`
  }
  return reference.metadata.authors?.join(', ')
})

// CARD SUBTITLE
// Combine year, authors, and journal into a single subtitle string
const subtitle = computed(() => {
  const parts = []
  if (reference.metadata.year)
    parts.push(reference.metadata.year)
  if (authors.value)
    parts.push(authors.value)
  if (reference.metadata.journal)
    parts.push(reference.metadata.journal)
  return parts.join(' · ')
})
</script>

<template>
  <v-card-subtitle>
    {{ subtitle }}
  </v-card-subtitle>
</template>
