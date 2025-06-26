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

    <v-row dense>
      <v-col cols="6">
        <SourceEvaluationMatchItem
          :match="evaluation.matchDetails.titleMatch"
          :text="$t('title-match')"
        />
      </v-col>
      <v-col cols="6">
        <SourceEvaluationMatchItem
          :match="evaluation.matchDetails.authorsMatch"
          :text="$t('authors-match')"
        />
      </v-col>
      <v-col cols="6">
        <SourceEvaluationMatchItem
          :match="evaluation.matchDetails.yearMatch"
          :text="$t('year-match')"
        />
      </v-col>
      <v-col cols="6">
        <SourceEvaluationMatchItem
          :match="evaluation.matchDetails.doiMatch"
          :text="$t('doi-match')"
        />
      </v-col>
      <v-col cols="6">
        <SourceEvaluationMatchItem
          :match="evaluation.matchDetails.journalMatch"
          :text="$t('journal-match')"
        />
      </v-col>
      <v-col cols="6">
        <SourceEvaluationMatchItem
          :match="evaluation.matchDetails.volumeMatch"
          :text="$t('volume-match')"
        />
      </v-col>
      <v-col cols="6">
        <SourceEvaluationMatchItem
          :match="evaluation.matchDetails.issueMatch"
          :text="$t('issue-match')"
        />
      </v-col>
      <v-col cols="6">
        <SourceEvaluationMatchItem
          :match="evaluation.matchDetails.pagesMatch"
          :text="$t('pages-match')"
        />
      </v-col>
      <v-col cols="6">
        <SourceEvaluationMatchItem
          :match="evaluation.isMatch"
          :text="$t('overall-match')"
        />
      </v-col>
    </v-row>
  </div>
</template>
