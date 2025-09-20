<script setup lang="ts">
import { mdiCheckCircle, mdiCloseCircle, mdiMinusCircle } from '@mdi/js'
import { computed } from 'vue'
import { settings } from '@/extension/logic'
import { getScoreColor } from '@/extension/utils/scoreUtils'

const props = defineProps<{
  score: number
  text: string
}>()

// Define the color based on score thresholds (using consistent scoreUtils)
const scoreColor = computed(() => getScoreColor(props.score))

// Define the icon based on user-defined thresholds
const scoreIcon = computed(() => {
  const thresholds = settings.value.matching.matchingConfig.displayThresholds

  if (props.score >= thresholds.strongMatchThreshold) // High confidence
    return mdiCheckCircle
  if (props.score >= thresholds.possibleMatchThreshold) // Medium confidence
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
      class="me-2"
    />
    <span class="text-caption">{{ displayText }}</span>
  </div>
</template>
