<script setup lang="ts">
import type { ExtractedReference } from '@/extension/types/reference'

const { reference } = defineProps<{
  reference: ExtractedReference
}>()

// AUTHORS
// If there are more than 2 authors, show first 2 and "et al."
const authors = computed(() => {
  if (reference.metadata.authors && reference.metadata.authors.length > 2) {
    const first2Authors = reference.metadata.authors.slice(0, 2).map(author =>
      typeof author === 'string' ? author : `${author.firstName || ''} ${author.lastName || ''}`.trim(),
    )
    return `${first2Authors.join(', ')} et al.`
  }
  return reference.metadata.authors?.map(author =>
    typeof author === 'string' ? author : `${author.firstName || ''} ${author.lastName || ''}`.trim(),
  ).join(', ')
})

// CARD SUBTITLE
// Combine year, authors, and journal into a single subtitle string
const subtitle = computed(() => {
  const parts = []
  if (reference.metadata.date?.year)
    parts.push(reference.metadata.date.year)
  if (authors.value)
    parts.push(authors.value)
  if (reference.metadata.source?.containerTitle)
    parts.push(reference.metadata.source.containerTitle)
  return parts.join(' · ')
})
</script>

<template>
  <v-card-subtitle>
    {{ subtitle }}
  </v-card-subtitle>
</template>
