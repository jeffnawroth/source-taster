<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  text?: string | number
  color?: string
  link?: boolean
}>()
</script>

<template>
  <v-list-item
    v-if="text"
  >
    <v-icon
      class="me-1 pb-1"
      :icon
      :color
    />

    <strong :class="`text-${color}`">{{ title }}: </strong>

    <span v-if="link">
      <a
        class="text-primary"
        :href="text.toString()"
        target="_blank"
      >
        {{ text }}
      </a>
    </span>
    <span
      v-else
      class="text-medium-emphasis"
    >
      {{ text }}
    </span>
  </v-list-item>
</template>
