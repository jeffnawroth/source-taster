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
  >
    <template #prepend>
      <v-list-item-action start>
        <v-icon v-if="prependIcon">
          {{ prependIcon }}
        </v-icon>
        <slot />
      </v-list-item-action>
    </template>
  </v-list-item>
</template>
