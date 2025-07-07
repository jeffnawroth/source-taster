<script setup lang="ts">
// Props
defineProps<{
  score: string | null
  color?: string
}>()
</script>

<template>
  <v-chip
    v-if="score"
    :color
    size="small"
    variant="tonal"
    class="font-weight-bold"
  >
    {{ score }}
  </v-chip>
</template>
