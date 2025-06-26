<script setup lang="ts">
const props = defineProps<{
  icon: string
  title?: string | number
  text?: string | number
  color?: string
  link?: boolean
}>()

const href = computed(() => {
  return String(props.text).startsWith('http') ? String(props.text) : `https://${props.text}`
})
</script>

<template>
  <!-- <v-list-item
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
  </v-list-item> -->
  <v-list-item>
    <div
      class="mb-1"
    >
      <div class="d-flex align-start">
        <v-icon
          :icon
          size="small"
          class="me-2 mt-1"
        />
        <div>
          <div class="text-caption text-medium-emphasis">
            {{ title }}
          </div>
          <div
            v-if="!link"
            class="text-body-2"
          >
            {{ text }}
          </div>
          <div v-else>
            <a
              :href
              target="_blank"
              rel="noopener noreferrer"
              class="text-body-2 text-primary text-decoration-none"
            >{{ text }}</a>
          </div>
        </div>
      </div>
    </div>
  </v-list-item>
</template>
