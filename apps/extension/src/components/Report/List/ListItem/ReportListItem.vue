<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'

// PROPS
const { reference } = defineProps<{
  reference: ProcessedReference
}>()

// TRANSLATION
const { t } = useI18n()

// CARD COLOR based on verification score
const color = computed(() => {
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

  // Score-based color mapping:
  // 80-100%: Green (success) - High confidence match
  // 60-79%:  Blue (info) - Medium-high confidence
  // 40-59%:  Orange (warning) - Medium confidence
  // 0-39%:   Red (error) - Low confidence
  if (score >= 80)
    return 'success'
  if (score >= 60)
    return 'warning'
  return 'error'
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

// SHOW DETAILS
const showDetails = ref(false)
</script>

<template>
  <v-card
    density="compact"
    variant="outlined"
    class="mb-2"
    :title
    :color
  >
    <!-- STATUS ICON & SCORE -->
    <template #append>
      <ReportListItemStatusIcon
        :score-text
        :color
      />
    </template>

    <!-- SUBTITLE -->
    <ReferenceCardSubtitle :reference />

    <!-- ACTIONS -->
    <v-card-actions>
      <v-row dense>
        <v-col cols="auto">
          <ReportListItemOpenBtn :reference />
        </v-col>
        <v-col cols="auto">
          <ReportListItemBtnSearchWeb :query="reference.originalText" />
        </v-col>

        <v-col cols="auto">
          <ReportListItemCopyBtn :value="reference.originalText" />
        </v-col>

        <v-spacer />

        <v-col cols="auto">
          <ReferenceShowDetailsBtn v-model="showDetails" />
        </v-col>
      </v-row>
    </v-card-actions>

    <ReferenceCardDetails
      v-show="showDetails"
      :reference
    />
  </v-card>
</template>
