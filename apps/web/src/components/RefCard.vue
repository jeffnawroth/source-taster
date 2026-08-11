<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ title: string, originalText: string }>()
const title = computed(() => props.title || props.originalText.slice(0, 80))
</script>

<template>
  <v-card class="mb-2" variant="outlined">
    <v-card-text>
      <div class="d-flex align-center">
        <span class="text-subtitle-1">{{ title }}</span>
        <v-spacer />
        <slot name="badge" />
      </div>
      <p class="text-body-2 text-medium-emphasis mt-2">
        {{ originalText }}
      </p>
    </v-card-text>
  </v-card>
</template>
