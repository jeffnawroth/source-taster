<script setup lang="ts">
import type { ApiMatchEvaluation } from '@source-taster/types'
import { computed } from 'vue'
import ScoreBadge from '@/components/ScoreBadge.vue'
import { useExtractionStore } from '@/stores/extraction'
import { useVerificationStore } from '@/stores/verification'
import { cslToBibtex } from '@/utils/bibtex'

const extraction = useExtractionStore()
const verification = useVerificationStore()

const bestMatches = computed<Record<string, ApiMatchEvaluation[]>>(() => verification.bestEvaluations)

async function run() {
  await verification.verifyAll(extraction.references)
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function exportJson() {
  download('references.json', JSON.stringify(extraction.references, null, 2), 'application/json')
}

function exportBibtex() {
  const bibtex = extraction.references.map(ref => cslToBibtex(ref.metadata)).join('\n\n')
  download('references.bib', bibtex, 'application/x-bibtex')
}
</script>

<template>
  <div>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <div class="d-flex align-center mb-4">
          <v-btn variant="text" to="/" prepend-icon="mdi-arrow-left">
            {{ $t('results.back') }}
          </v-btn>
          <v-spacer />
          <v-btn color="primary" :loading="verification.running" :disabled="extraction.references.length === 0" @click="run">
            {{ $t('results.verifyButton') }}
          </v-btn>
          <v-menu>
            <template #activator="{ props }">
              <v-btn v-bind="props" variant="tonal" class="ml-2" prepend-icon="mdi-download">
                {{ $t('results.export') }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="exportJson">
                <v-list-item-title>JSON (CSL)</v-list-item-title>
              </v-list-item>
              <v-list-item @click="exportBibtex">
                <v-list-item-title>BibTeX</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <v-progress-linear v-if="verification.running" indeterminate color="primary" class="mb-4" />

        <v-alert v-if="verification.error" type="error" class="mb-4">
          {{ verification.error }}
        </v-alert>
        <v-alert v-else-if="!verification.running && !extraction.references.length" type="info" class="mb-4">
          {{ $t('results.empty') }}
        </v-alert>

        <v-expansion-panels v-for="ref in extraction.references" :key="ref.id" class="mb-2" variant="accordion">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <div class="d-flex align-center w-100">
                <span class="text-subtitle-1 mr-4">{{ ref.metadata.title || ref.originalText.slice(0, 80) }}</span>
                <v-spacer />
                <ScoreBadge v-if="verification.results[ref.id]" :status="verification.results[ref.id].status" :score="verification.results[ref.id].bestScore" />
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p class="text-body-2 text-medium-emphasis mb-3">
                {{ ref.originalText }}
              </p>
              <template v-if="verification.results[ref.id] && verification.results[ref.id].status !== 'not-found'">
                <v-list v-for="evalItem in bestMatches[ref.id] || []" :key="evalItem.candidateId" density="compact">
                  <v-list-item>
                    <v-list-item-title>{{ $t('results.match') }}: {{ evalItem.matchDetails.overallScore }}%</v-list-item-title>
                    <v-list-item-subtitle v-for="fd in evalItem.matchDetails.fieldDetails.slice(0, 5)" :key="fd.field">
                      {{ fd.field }}: {{ fd.fieldScore }}%
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </template>
              <v-alert v-else-if="verification.results[ref.id]?.status === 'not-found'" type="warning" density="compact">
                {{ $t('results.notFound') }}
              </v-alert>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </div>
</template>
