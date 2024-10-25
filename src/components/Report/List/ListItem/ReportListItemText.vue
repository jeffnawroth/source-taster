<script setup lang="ts">
import type { HttpResponse, Item, Work } from '@jamesgopsill/crossref-client'
import { useDoiStore } from '~/stores/doi'

// Props
const { work } = defineProps<{
  work: HttpResponse<Item<Work>>
  index: number
}>()

// Doi Store
const { dois } = storeToRefs(useDoiStore())
</script>

<template>
  <v-list-item-title>
    {{ work.ok && work.content ? work.content.message.title[0] : dois[index] }}
  </v-list-item-title>

  <v-list-item-subtitle>
    {{ work.ok && work.content ? work.content?.message.DOI : '' }}
  </v-list-item-subtitle>
</template>
