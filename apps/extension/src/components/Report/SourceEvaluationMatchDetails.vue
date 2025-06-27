<script setup lang="ts">
import type { SourceEvaluation } from '@source-taster/types'

defineProps<{
  evaluation: SourceEvaluation
}>()
</script>

<template>
  <div class="mb-3">
    <div class="text-subtitle-2 mb-2">
      {{ $t('match-details') }}
    </div>

    <!-- Field Details (if available) -->
    <v-row
      v-if="evaluation.matchDetails.fieldDetails?.length"
      dense
    >
      <v-col
        v-for="fieldDetail in evaluation.matchDetails.fieldDetails"
        :key="fieldDetail.field"
        cols="6"
      >
        <SourceEvaluationScoreItem
          :score="fieldDetail.match_score"
          :text="$t(`${fieldDetail.field}-match`)"
          :weight="fieldDetail.weight"
        />
      </v-col>
    </v-row>

    <!-- Fallback: Show overall match if no field details -->
    <v-row
      v-else
      dense
    >
      <v-col cols="12">
        <SourceEvaluationMatchItem
          :match="evaluation.isMatch"
          :text="$t('overall-match')"
        />
      </v-col>
    </v-row>
  </div>
</template>
