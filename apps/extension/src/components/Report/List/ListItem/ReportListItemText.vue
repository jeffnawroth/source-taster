<script setup lang="ts">
import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client'

// Props
defineProps<{
  work: HttpResponse<Item<Work>>
}>()
</script>

<template>
  <v-list-item-title>
    {{ work.content?.message.DOI }}
  </v-list-item-title>
</template>
