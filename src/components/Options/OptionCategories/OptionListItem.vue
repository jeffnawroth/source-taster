<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  prependIcon?: string
}>()
</script>

<template>
  <v-list-item
    :title
    :subtitle
    :prepend-icon
  >
    <template #append>
      <slot />
    </template>
  </v-list-item>
</template>
