<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
}>()
</script>

<template>
  <v-list-item
    :title
    :subtitle
  >
    <template #prepend>
      <v-list-item-action start>
        <slot />
      </v-list-item-action>
    </template>
  </v-list-item>
</template>
