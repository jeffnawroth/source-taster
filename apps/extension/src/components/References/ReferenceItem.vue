<script setup lang="ts">
import type { ApiExtractReference } from '@source-taster/types'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'
import ReferenceActions from './Actions/ReferenceActions.vue'

// PROPS
const { reference } = defineProps<{
  reference: DeepReadonly<UnwrapNestedRefs<ApiExtractReference>>
}>()

// TRANSLATION
const { t } = useI18n()

// CARD COLOR based on matching status
// const color = computed(() => {
//   // If there's an error, show error color
//   if (reference.status === 'error') {
//     return 'error'
//   }

//   // If still pending, no color
//   if (reference.status === 'pending') {
//     return undefined
//   }

//   // Get the overall score from matching details
//   const score = reference.matchingResult?.sourceEvaluations?.[0]?.matchDetails?.overallScore

//   if (score === undefined) {
//     return 'warning' // No score available
//   }

//   // Use consistent score-based color mapping from scoreUtils
//   return getScoreColor(score)
// })

// TITLE
const title = computed(() => reference.metadata.title || t('no-title'))

// MATCHING SCORE
// const matchingScore = computed(() =>
//   reference.matchingResult?.sourceEvaluations?.[0]?.matchDetails?.overallScore,
// )

// SCORE DISPLAY TEXT
// const scoreText = computed(() => {
//   if (matchingScore.value === undefined)
//     return null
//   return `${Math.round(matchingScore.value)} %`
// })

// SHOW DETAILS - managed by ReferenceActions component
const showDetails = ref(false)
</script>

<template>
  <v-card
    density="compact"
    variant="outlined"
    class="mb-2"
    :title
  >
    <!-- :color -->
    <!-- STATUS ICON & SCORE -->
    <template #append>
      <!-- <ReferenceScore
        :score="scoreText"
        :color
      /> -->
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
/* Progress animation styles removed as we simplified the progress feedback */
</style>
