<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  prependIcon?: string
  appendIcon?: string
}>()
</script>

<template>
  <v-list-item
    :title
    :subtitle
    :prepend-icon
    :append-icon
  >
    <template #append>
      <v-icon v-if="appendIcon">
        {{ appendIcon }}
      </v-icon>
      <slot />
    </template>
  </v-list-item>
</template>
