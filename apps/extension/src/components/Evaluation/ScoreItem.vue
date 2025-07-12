<script setup lang="ts">
import { mdiCheckCircle, mdiCloseCircle, mdiMinusCircle } from '@mdi/js'
import { computed } from 'vue'
import { getScoreColor } from '@/extension/utils/scoreUtils'

const props = defineProps<{
  score: number
  text: string
}>()

// Define the color based on score thresholds (using consistent scoreUtils)
const scoreColor = computed(() => getScoreColor(props.score))

// Define the icon based on score thresholds (aligned with color logic)
const scoreIcon = computed(() => {
  if (props.score >= 75) // High confidence (verified)
    return mdiCheckCircle
  if (props.score >= 50) // Medium confidence
    return mdiMinusCircle
  return mdiCloseCircle // Low confidence
})

// Display text combining the base text and score
const displayText = computed(() => {
  const baseText = props.text
  const scoreText = `(${props.score} %)`
  return `${baseText} ${scoreText}`
})
</script>

<template>
  <div class="d-flex align-center">
    <v-icon
      :icon="scoreIcon"
      :color="scoreColor"
      size="small"
      class="me-2"
    />
    <span class="text-caption">{{ displayText }}</span>
  </div>
</template>
