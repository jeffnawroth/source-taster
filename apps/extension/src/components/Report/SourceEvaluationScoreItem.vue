<script setup lang="ts">
import { mdiCheckCircle, mdiCloseCircle, mdiMinusCircle } from '@mdi/js'
import { computed } from 'vue'

const props = defineProps<{
  score: number
  text: string
  weight?: number
}>()

// Define the color based on score thresholds
const scoreColor = computed(() => {
  if (props.score >= 80)
    return 'success'
  if (props.score >= 60)
    return 'warning'
  return 'error'
})

// Define the icon based on score thresholds
const scoreIcon = computed(() => {
  if (props.score >= 80)
    return mdiCheckCircle
  if (props.score >= 40)
    return mdiMinusCircle
  return mdiCloseCircle
})

// Display text combining the base text and score
const displayText = computed(() => {
  const baseText = props.text
  const scoreText = `(${props.score}%)`
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
