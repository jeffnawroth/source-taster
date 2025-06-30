<script setup lang="ts">
import type { ProcessedReference } from '@source-taster/types'
import { mdiAlertCircle } from '@mdi/js'
import SourceEvaluationList from './SourceEvaluationList.vue'

const { reference } = defineProps<{
  reference: ProcessedReference
}>()

const { t } = useI18n()

// Helper function to format source names for better user experience
// function formatSourceName(source: string): string {
//   const sourceMap: Record<string, string> = {
//     openalex: 'OpenAlex',
//     crossref: 'Crossref',
//     europepmc: 'Europe PMC',
//     semanticscholar: 'Semantic Scholar',
//     pubmed: 'PubMed',
//   }

//   return sourceMap[source] || source.charAt(0).toUpperCase() + source.slice(1)
// }
</script>

<template>
  <v-expand-transition>
    <div>
      <v-divider />

      <ReferenceMetadataList
        :reference
        :subheader="$t('reference-metadata')"
      />

      <v-divider class="my-2" />

      <!-- VERIFIED -->
      <!-- <div v-if="reference.status === 'verified' && reference.verificationResult?.matchedSource">
        <ReferenceCardDetailsItem
          :icon="mdiCheckCircleOutline"
          :title="t('verified-against')"
          color="success"
          text=" "
        />

        <ReferenceCardDetailsItem
          :icon="mdiDatabaseOutline"
          :title="t('source')"
          :text="formatSourceName(reference.verificationResult.matchedSource.source)"
        />

        <div v-if="reference.verificationResult?.verificationDetails?.matchDetails">
          <v-divider class="my-2" />

          <div class="pa-2">
            <div class="text-caption mb-1">
              {{ t('match-score') }}: {{ reference.verificationResult.verificationDetails.matchDetails.overallScore }}%
            </div>
            <v-progress-linear
              :model-value="reference.verificationResult.verificationDetails.matchDetails.overallScore"
              color="success"
              height="4"
            />
          </div>

          <v-divider class="my-2" />
        </div>

        <ReferenceCardDetailsItem
          :icon="mdiIdentifier"
          title="DOI"
          :text="reference.verificationResult.matchedSource.metadata.identifiers?.doi"
        />

        <ReferenceCardDetailsItem
          :icon="mdiLink"
          title="URL"
          :text="reference.verificationResult.matchedSource.url"
          link
        />
      </div> -->

      <!-- ERROR -->
      <ReferenceCardDetailsItem
        v-if="reference.status === 'error' && reference.error"
        :icon="mdiAlertCircle"
        :title="t('error')"
        color="error"
        :text="reference.error || t('no-additional-error-info')"
      />

      <!-- NOT VERIFIED -->
      <!-- <div v-if="reference.status === 'not-verified'">
          <ReferenceCardDetailsItem
            :icon="mdiHelpCircleOutline"
            :title="t('not-verified')"
            color="warning"
            :text="t('no-matching-source-found')"
          />

          <div v-if="reference.verificationResult?.verificationDetails?.matchDetails">
            <v-divider class="my-2" />

            <ReferenceCardDetailsItem
              v-if="reference.verificationResult.verificationDetails.sourcesFound?.length > 0"
              :icon="mdiDatabaseOutline"
              :title="t('sources-found')"
              :text="reference.verificationResult.verificationDetails.sourcesFound.map(s => formatSourceName(s.source)).join(', ')"
            />

            <div class="pa-2">
              <div class="text-caption mb-2">
          {{ t('match-analysis') }}:
              </div>

              <div class="d-flex flex-column ga-1">
          <div class="d-flex align-center ga-2">
            <v-icon
              :icon="reference.verificationResult.verificationDetails.matchDetails.titleMatch ? mdiCheckCircleOutline : mdiAlertCircle"
              :color="reference.verificationResult.verificationDetails.matchDetails.titleMatch ? 'success' : 'error'"
              size="x-small"
            />
            <span class="text-caption">{{ t('title-match') }}</span>
          </div>

          <div class="d-flex align-center ga-2">
            <v-icon
              :icon="reference.verificationResult.verificationDetails.matchDetails.authorsMatch ? mdiCheckCircleOutline : mdiAlertCircle"
              :color="reference.verificationResult.verificationDetails.matchDetails.authorsMatch ? 'success' : 'error'"
              size="x-small"
            />
            <span class="text-caption">{{ t('authors-match') }}</span>
          </div>

          <div class="d-flex align-center ga-2">
            <v-icon
              :icon="reference.verificationResult.verificationDetails.matchDetails.yearMatch ? mdiCheckCircleOutline : mdiAlertCircle"
              :color="reference.verificationResult.verificationDetails.matchDetails.yearMatch ? 'success' : 'error'"
              size="x-small"
            />
            <span class="text-caption">{{ t('year-match') }}</span>
          </div>

          <div class="d-flex align-center ga-2">
            <v-icon
              :icon="reference.verificationResult.verificationDetails.matchDetails.doiMatch ? mdiCheckCircleOutline : mdiAlertCircle"
              :color="reference.verificationResult.verificationDetails.matchDetails.doiMatch ? 'success' : 'error'"
              size="x-small"
            />
            <span class="text-caption">{{ t('doi-match') }}</span>
          </div>

          <div class="d-flex align-center ga-2">
            <v-icon
              :icon="reference.verificationResult.verificationDetails.matchDetails.journalMatch ? mdiCheckCircleOutline : mdiAlertCircle"
              :color="reference.verificationResult.verificationDetails.matchDetails.journalMatch ? 'success' : 'error'"
              size="x-small"
            />
            <span class="text-caption">{{ t('journal-match') }}</span>
          </div>
              </div>

              <div class="mt-2">
          <div class="text-caption mb-1">
            {{ t('match-score') }}: {{ reference.verificationResult.verificationDetails.matchDetails.overallScore }}%
          </div>
          <v-progress-linear
            :model-value="reference.verificationResult.verificationDetails.matchDetails.overallScore"
            :color="getScoreColor(reference.verificationResult.verificationDetails.matchDetails.overallScore)"
            height="4"
          />
              </div>
            </div>

            <div v-if="reference.verificationResult.matchedSource">
              <v-divider class="my-2" />
              <div class="text-caption mb-2">
          {{ t('best-match-from') }} {{ formatSourceName(reference.verificationResult.matchedSource.source) }}:
              </div>

              <ReferenceCardDetailsItem
          :icon="mdiFileDocumentOutline"
          :title="t('title')"
          :text="reference.verificationResult.matchedSource.metadata.title"
              />

              <ReferenceCardDetailsItem
          :icon="mdiAccountGroup"
          :title="t('authors')"
          :text="reference.verificationResult.matchedSource.metadata.authors?.map(author =>
            typeof author === 'string' ? author : `${author.firstName || ''} ${author.lastName || ''}`.trim()
          ).join(', ')"
              />

              <ReferenceCardDetailsItem
          :icon="mdiCalendarOutline"
          :title="t('year')"
          :text="reference.verificationResult.matchedSource.metadata.date.year"
              />

              <ReferenceCardDetailsItem
          v-if="reference.verificationResult.matchedSource.metadata.identifiers?.doi"
          :icon="mdiIdentifier"
          title="DOI"
          :text="reference.verificationResult.matchedSource.metadata.identifiers.doi"
              />
            </div>
          </div>
        </div> -->

      <!-- All Source Evaluations for Transparency -->
      <SourceEvaluationList
        v-if="reference.verificationResult?.verificationDetails?.allSourceEvaluations?.length"
        :source-evaluations="reference.verificationResult.verificationDetails.allSourceEvaluations"
      />
    </div>
  </v-expand-transition>
</template>
