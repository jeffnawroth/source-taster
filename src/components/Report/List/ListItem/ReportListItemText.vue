<script setup lang="ts">
import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client'

// Props
defineProps<{
  work: HttpResponse<Item<Work>>
  index: number
}>()

// Doi Store
const { extractedDois } = storeToRefs(useDoiStore())
</script>

<template>
  <v-list-item-title>
    {{ extractedDois[index] }}
  </v-list-item-title>
</template>
