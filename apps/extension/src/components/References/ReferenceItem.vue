<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'
import { getScoreColor } from '@/extension/utils/scoreUtils'
import ReferenceActions from './Actions/ReferenceActions.vue'

// PROPS
const { reference, isCurrentlyVerifying = false } = defineProps<{
  reference: ProcessedReference
  isCurrentlyVerifying?: boolean
}>()

// TRANSLATION
const { t } = useI18n()

// CARD COLOR based on verification score
const color = computed(() => {
  // If currently verifying, show special color
  if (isCurrentlyVerifying) {
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

  // Get the overall score from verification details
  const score = reference.verificationResult?.verificationDetails?.matchDetails?.overallScore

  if (score === undefined) {
    return 'warning' // No score available
  }

  // Use consistent score-based color mapping from scoreUtils
  return getScoreColor(score)
})

// TITLE
const title = computed(() => reference.metadata.title || t('no-title'))

// VERIFICATION SCORE
const verificationScore = computed(() =>
  reference.verificationResult?.verificationDetails?.matchDetails?.overallScore,
)

// SCORE DISPLAY TEXT
const scoreText = computed(() => {
  if (verificationScore.value === undefined)
    return null
  return `${Math.round(verificationScore.value)} %`
})

// SHOW DETAILS - managed by ReferenceActions component
const showDetails = ref(false)
</script>

<template>
  <v-card
    density="compact"
    variant="outlined"
    class="mb-2"
    :class="{ 'currently-verifying': isCurrentlyVerifying }"
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

    <ReferenceDetails
      v-show="showDetails"
      :reference
    />
  </v-card>
</template>

<style scoped>
.currently-verifying {
  position: relative;
  overflow: hidden;
}

.currently-verifying::before {
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
