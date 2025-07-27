<script setup lang="ts">
import type { ProcessedReference } from '@/extension/types/reference'
import { getScoreColor } from '@/extension/utils/scoreUtils'
import ReferenceActions from './Actions/ReferenceActions.vue'

// PROPS
const { reference, isCurrentlyMatching = false } = defineProps<{
  reference: ProcessedReference
  isCurrentlyMatching?: boolean
}>()

// TRANSLATION
const { t } = useI18n()

// CARD COLOR based on matching score
const color = computed(() => {
  // If currently matching, show special color
  if (isCurrentlyMatching) {
    return 'primary'
  }

  // If there's an error, show error color
  if (reference.status === 'error') {
    return 'error'
  }

  // If still pending, no color
  if (reference.status === 'pending') {
    return undefined
  }

  // Get the overall score from matching details
  const score = reference.matchingResult?.matchingDetails?.allSourceEvaluations?.[0]?.matchDetails?.overallScore

  if (score === undefined) {
    return 'warning' // No score available
  }

  // Use consistent score-based color mapping from scoreUtils
  return getScoreColor(score)
})

// TITLE
const title = computed(() => reference.metadata.title || t('no-title'))

// MATCHING SCORE
const matchingScore = computed(() =>
  reference.matchingResult?.matchingDetails?.allSourceEvaluations?.[0]?.matchDetails?.overallScore,
)

// SCORE DISPLAY TEXT
const scoreText = computed(() => {
  if (matchingScore.value === undefined)
    return null
  return `${Math.round(matchingScore.value)} %`
})

// SHOW DETAILS - managed by ReferenceActions component
const showDetails = ref(false)
</script>

<template>
  <v-card
    density="compact"
    variant="outlined"
    class="mb-2"
    :class="{ 'currently-matching': isCurrentlyMatching }"
    :title
    :color
  >
    <!-- STATUS ICON & SCORE -->
    <template #append>
      <ReferenceScore
        :score="scoreText"
        :color
      />
    </template>

    <!-- SUBTITLE -->
    <ReferenceSubtitle :reference />

    <!-- ACTIONS -->
    <v-card-actions>
      <ReferenceActions
        v-model:show-details="showDetails"
        :reference
      />
    </v-card-actions>

    <!-- DETAILS -->
    <ReferenceDetails
      v-show="showDetails"
      :reference
    />
  </v-card>
</template>

<style scoped>
.currently-matching {
  position: relative;
  overflow: hidden;
}

.currently-matching::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.1), transparent);
  animation: shimmer 2s infinite;
  z-index: 1;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>
