<script setup lang="ts">
// Props
defineProps<{
  score: string | null
  color?: string
}>()

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <v-tooltip
    v-if="score"
    location="top"
    width="200"
  >
    <template #activator="{ props }">
      <v-chip
        v-bind="props"
        :color
        size="small"
        variant="tonal"
        class="font-weight-bold"
      >
        {{ score }}
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
