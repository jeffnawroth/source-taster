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
  return formatAuthorsCompact(JSON.parse(JSON.stringify(reference.metadata.author)))
})

// CARD SUBTITLE
// Combine year, authors, and journal into a single subtitle string
const subtitle = computed(() => {
  const parts = []

  // Extract year using the utility function
  const year = extractYearFromCSLDate(JSON.parse(JSON.stringify(reference.metadata.issued)))
  if (year)
    parts.push(year)

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
