<script setup lang="ts">
const props = defineProps<{
  icon: string
  title: string
  text?: string | number
  color?: string
  link?: boolean
}>()

const href = computed(() => {
  return String(props.text).startsWith('http') ? String(props.text) : `https://${props.text}`
})
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
        :href
        target="_blank"
        rel="noopener noreferrer"
      >{{ text }}</a>
    </span>
    <span v-else>{{ text }}</span>
  </v-list-item>
</template>
