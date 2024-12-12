<script setup lang="ts">
import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client'
import { useDoiStore } from '~/stores/doi'

// Props
defineProps<{
  work: HttpResponse<Item<Work>>
  index: number
}>()

// Doi Store
const { dois } = storeToRefs(useDoiStore())
</script>

<template>
  <v-list-item-title>
    {{ dois[index] }}
  </v-list-item-title>
</template>
