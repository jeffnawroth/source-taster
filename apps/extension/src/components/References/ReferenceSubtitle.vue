<script setup lang="ts">
import type { ApiExtractReference } from '@source-taster/types'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'
import { extractYearFromCSLDate, formatAuthorsCompact } from '@source-taster/types'

const { reference } = defineProps<{
  reference: DeepReadonly<UnwrapNestedRefs<ApiExtractReference>>
}>()

// AUTHORS - using the compact formatter utility
const authors = computed(() => {
  if (!reference.metadata.author)
    return null
  try {
    // Convert readonly type to mutable for the utility function
    const authorsData = reference.metadata.author as any
    return formatAuthorsCompact(authorsData)
  }
  catch (error) {
    console.warn('Error formatting authors:', error)
    return null
  }
})

// CARD SUBTITLE
// Combine year, authors, and journal into a single subtitle string
const subtitle = computed(() => {
  const parts = []

  // Extract year using the utility function
  try {
    if (reference.metadata.issued) {
      const issuedData = reference.metadata.issued as any
      const year = extractYearFromCSLDate(issuedData)
      if (year)
        parts.push(year)
    }
  }
  catch (error) {
    console.warn('Error parsing issued date:', error)
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
