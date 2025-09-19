<script setup lang="ts">
import type { ApiMatchEvaluation } from '@source-taster/types'
import { mdiDatabaseOutline, mdiSourceBranch, mdiWeb } from '@mdi/js'
import { useSearchStore } from '@/extension/stores/search'
import { getScoreColor } from '@/extension/utils/scoreUtils'

const props = defineProps<{
  evaluations: ApiMatchEvaluation[]
  referenceId: string
}>()

const { t } = useI18n()

const searchStore = useSearchStore()
const { getCandidateById } = searchStore

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
  [...props.evaluations].sort((a, b) => b.matchDetails.overallScore - a.matchDetails.overallScore),
)

// Helper function to get candidate source
function getCandidateSource(candidateId: string): string {
  const candidate = getCandidateById(candidateId)
  return candidate?.source || 'unknown'
}
</script>

<template>
  <div v-if="evaluations.length > 0">
    <v-list-subheader>
      <v-icon
        :icon="mdiSourceBranch"
      />
      {{ t('all-found-sources') }} ({{ evaluations.length }})
    </v-list-subheader>

    <v-expansion-panels
      multiple
      static
    >
      <v-expansion-panel
        v-for="(evaluation, index) in sortedEvaluations"
        :key="evaluation.candidateId"
        :title="getCandidateById(evaluation.candidateId)?.metadata.title || t('no-title')"
      >
        <template #text>
          <div class="pa-2">
            <!-- Overall Score -->
            <div class="mb-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-subtitle-2">{{ t('match-score') }}</span>
                <v-chip
                  :color="getScoreColor(evaluation.matchDetails.overallScore)"
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
            <MatchDetails
              :evaluation
            />

            <!-- Source Metadata -->
            <v-divider class="my-3" />

            <ReferenceMetadataList
              v-if="getCandidateById(evaluation.candidateId)"
              :reference="getCandidateById(evaluation.candidateId)!"
              :subheader="$t('source-metadata')"
            />
          </div>
        </template>

        <template #title>
          <v-row
            align="center"
            align-content="center"
          >
            <v-col
              cols="auto"
              align-self="center"
            >
              <v-icon
                :icon="getCandidateSource(evaluation.candidateId) === 'website' ? mdiWeb : mdiDatabaseOutline"
                class="me-2"
              />
            </v-col>
            <v-col cols="auto">
              <span>{{ formatSourceName(getCandidateSource(evaluation.candidateId)) }}</span>
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
