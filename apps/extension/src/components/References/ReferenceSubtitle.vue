<script setup lang="ts">
import type { ExtractedReference } from '@/extension/types/reference'

const { reference } = defineProps<{
  reference: ExtractedReference
}>()

// AUTHORS
// If there are more than 2 authors, show first 2 and "et al."
const authors = computed(() => {
  if (reference.metadata.author && reference.metadata.author.length > 2) {
    const first2Authors = reference.metadata.author.slice(0, 2).map(author =>
      typeof author === 'string' ? author : `${author.given || ''} ${author.family || ''}`.trim(),
    )
    return `${first2Authors.join(', ')} et al.`
  }
  return reference.metadata.author?.map(author =>
    typeof author === 'string' ? author : `${author.given || ''} ${author.family || ''}`.trim(),
  ).join(', ')
})

// CARD SUBTITLE
// Combine year, authors, and journal into a single subtitle string
const subtitle = computed(() => {
  const parts = []

  // Extract year from CSL issued date
  if (reference.metadata.issued) {
    if (typeof reference.metadata.issued === 'string') {
      parts.push(reference.metadata.issued)
    }
    else if (reference.metadata.issued['date-parts']?.[0]?.[0]) {
      parts.push(reference.metadata.issued['date-parts'][0][0].toString())
    }
    else if (reference.metadata.issued.literal) {
      parts.push(reference.metadata.issued.literal)
    }
  }

  if (authors.value)
    parts.push(authors.value)
  if (reference.metadata['container-title'])
    parts.push(reference.metadata['container-title'])
  return parts.join(' · ')
})
</script>

<template>
  <v-card-subtitle>
    {{ subtitle }}
  </v-card-subtitle>
</template>
