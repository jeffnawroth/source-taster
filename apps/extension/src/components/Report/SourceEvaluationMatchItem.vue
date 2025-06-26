<script setup lang="ts">
import { mdiCheckCircle, mdiCloseCircle } from '@mdi/js'

defineProps<{
  match: boolean
  text: string
}>()
</script>

<template>
  <v-icon
    :icon="match ? mdiCheckCircle : mdiCloseCircle"
    :color="match ? 'success' : 'error'"
    size="small"
    class="me-2"
  />
  <span class="text-caption">{{ text }}</span>
</template>
