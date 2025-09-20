<script setup lang="ts">
import { mergeProps } from 'vue'

// Props
defineProps<{
  score: number | null
  color?: string
}>()

const attrs = useAttrs()

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <v-tooltip
    v-if="score !== null"
    location="top"
    width="200"
  >
    <template #activator="{ props }">
      <v-chip
        v-bind="mergeProps(props, attrs)"
        :color
        variant="tonal"
        class="font-weight-bold"
      >
        {{ `${score} %` }}
      </v-chip>
    </template>

    <!-- Tooltip content with fallback -->
    <div class="text-center">
      <div class="font-weight-bold">
        {{ t('reference-score-title') }}
      </div>
      <div class="text-caption mt-1">
        {{ t('reference-score-description') }}
      </div>
    </div>
  </v-tooltip>
</template>
