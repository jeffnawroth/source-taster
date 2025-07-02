<script setup lang="ts">
import type { SourceEvaluation } from '@source-taster/types'
import { mdiDatabaseOutline, mdiSourceBranch, mdiWeb } from '@mdi/js'
import { getScoreColor } from '@/extension/utils/scoreUtils'

const { sourceEvaluations } = defineProps<{
  sourceEvaluations: SourceEvaluation[]
}>()

const { t } = useI18n()

// Helper function to format source names
function formatSourceName(source: string): string {
  const sourceMap: Record<string, string> = {
    openalex: 'OpenAlex',
    crossref: 'Crossref',
    europepmc: 'Europe PMC',
    semanticscholar: 'Semantic Scholar',
    pubmed: 'PubMed',
    website: 'Website',
  }
  return sourceMap[source] || source.charAt(0).toUpperCase() + source.slice(1)
}

// Sort sources by score (highest first)
const sortedEvaluations = computed(() =>
  [...sourceEvaluations].sort((a, b) => b.matchDetails.overallScore - a.matchDetails.overallScore),
)
</script>

<template>
  <div v-if="sourceEvaluations.length > 0">
    <!-- <v-divider class="my-4" /> -->

    <!-- <div class="text-subtitle-1 font-weight-medium mb-3">
      <v-icon
        :icon="mdiDatabaseOutline"
        class="me-2"
      />
      {{ t('all-found-sources') }} ({{ sourceEvaluations.length }})
    </div> -->

    <v-list-subheader>
      <v-icon
        :icon="mdiSourceBranch"
      />
      {{ t('all-found-sources') }} ({{ sourceEvaluations.length }})
    </v-list-subheader>

    <v-expansion-panels
      multiple
      flat
      static
    >
      <v-expansion-panel
        v-for="(evaluation, index) in sortedEvaluations"
        :key="evaluation.source.id"
        :title="formatSourceName(evaluation.source.source)"
      >
        <template #text>
          <div class="pa-2">
            <!-- Overall Score -->
            <div class="mb-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-subtitle-2">{{ t('match-score') }}</span>
                <v-chip
                  :color="getScoreColor(evaluation.matchDetails.overallScore)"
                  size="small"
                  variant="elevated"
                >
                  {{ evaluation.matchDetails.overallScore }} %
                </v-chip>
              </div>
              <v-progress-linear
                :model-value="evaluation.matchDetails.overallScore"
                :color="getScoreColor(evaluation.matchDetails.overallScore)"
                height="6"
                rounded
              />
            </div>

            <!-- Match Details -->
            <SourceEvaluationMatchDetails
              :evaluation
            />

            <!-- Source Metadata -->
            <v-divider class="my-3" />

            <ReferenceMetadataList
              :reference="evaluation.source"
              :subheader="$t('source-metadata')"
            />
          </div>
        </template>

        <template #title>
          <v-row
            dense
            align="center"
            align-content="center"
          >
            <v-col
              cols="auto"
              align-self="center"
            >
              <v-icon
                :icon="evaluation.source.source === 'website' ? mdiWeb : mdiDatabaseOutline"
                class="me-2"
              />
            </v-col>
            <v-col cols="auto">
              <span>{{ formatSourceName(evaluation.source.source) }}</span>
            </v-col>
            <v-col cols="auto">
              <v-chip
                v-if="index === 0"
                size="x-small"
                color="primary"
                class="ms-2"
              >
                {{ t('best-match') }}
              </v-chip>
            </v-col>
            <v-spacer />
            <v-col cols="auto">
              <v-chip
                :color="getScoreColor(evaluation.matchDetails.overallScore)"
                size="small"
              >
                {{ evaluation.matchDetails.overallScore }} %
              </v-chip>
            </v-col>
          </v-row>
        </template>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>
