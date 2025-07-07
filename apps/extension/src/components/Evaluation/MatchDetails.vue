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
        <ScoreItem
          :score="fieldDetail.match_score"
          :text="$t(`${fieldDetail.field}`)"
          :weight="fieldDetail.weight"
        />
      </v-col>
    </v-row>
  </div>
</template>
