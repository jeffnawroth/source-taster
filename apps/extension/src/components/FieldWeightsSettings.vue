<script setup lang="ts">
import type { FieldWeights } from '@source-taster/types'
import { mdiRestore } from '@mdi/js'
import FieldWeightControl from '@/extension/components/FieldWeightControl.vue'
import FieldWeightSection from '@/extension/components/FieldWeightSection.vue'
import FieldWeightsTooltip from '@/extension/components/FieldWeightsTooltip.vue'
import { fieldWeights } from '@/extension/logic'

// TRANSLATION
const { t } = useI18n()

// Default field weights (only available fields)
const defaultFieldWeights: FieldWeights = {
  // Core fields (enabled by default)
  title: 25,
  authors: 20,
  year: 5,

  // Identifier fields (most important ones enabled)
  doi: 15,
  arxivId: 8,
  pmid: 3,
  pmcid: 2,
  isbn: 1,
  issn: 1,

  // Source fields (basic ones enabled)
  containerTitle: 10,
  volume: 5,
  issue: 3,
  pages: 2,

  // Additional fields (disabled by default, available for expert users)
  publisher: 0,
  url: 0,
  sourceType: 0,
  conference: 0,
  institution: 0,
  edition: 0,
  articleNumber: 0,
  subtitle: 0,
}

// Reset to defaults
function resetToDefaults() {
  fieldWeights.value = { ...defaultFieldWeights }
}

// Calculate total weight for validation
const totalWeight = computed(() => {
  return Object.values(fieldWeights.value).reduce((sum, weight) => sum + (weight || 0), 0)
})

// Validation
const isValidConfiguration = computed(() => {
  return totalWeight.value === 100
})

// Core fields weight
const coreFieldsWeight = computed(() => {
  return fieldWeights.value.title + fieldWeights.value.authors + fieldWeights.value.year
})

// Identifier fields weight
const identifierFieldsWeight = computed(() => {
  return (fieldWeights.value.doi || 0) + (fieldWeights.value.arxivId || 0) + (fieldWeights.value.pmid || 0) + (fieldWeights.value.pmcid || 0) + (fieldWeights.value.isbn || 0) + (fieldWeights.value.issn || 0)
})

// Source fields weight
const sourceFieldsWeight = computed(() => {
  return (fieldWeights.value.containerTitle || 0) + (fieldWeights.value.volume || 0) + (fieldWeights.value.issue || 0) + (fieldWeights.value.pages || 0) + (fieldWeights.value.publisher || 0) + (fieldWeights.value.url || 0)
})

// Additional fields weight (specialized/advanced fields)
const additionalFieldsWeight = computed(() => {
  return (fieldWeights.value.sourceType || 0) + (fieldWeights.value.conference || 0) + (fieldWeights.value.institution || 0) + (fieldWeights.value.edition || 0) + (fieldWeights.value.articleNumber || 0) + (fieldWeights.value.subtitle || 0)
})
</script>

<template>
  <v-card
    :title="t('field-weights')"
    :subtitle="t('field-weights-description')"
    flat
  >
    <template #append>
      <FieldWeightsTooltip />
    </template>

    <v-card-text>
      <v-alert
        :type="isValidConfiguration ? 'success' : 'warning'"
        class="mb-4"
        density="compact"
      >
        <div class="d-flex justify-space-between align-center">
          <span>{{ t('total-weight') }}: {{ totalWeight }}%</span>
          <span
            v-if="!isValidConfiguration"
            class="text-caption"
          >
            {{ t('weights-should-sum-to-100') }}
          </span>
        </div>
      </v-alert>

      <v-expansion-panels flat>
        <!-- Core Fields -->
        <FieldWeightSection
          :title="t('core-fields')"
          :weight="coreFieldsWeight"
        >
          <FieldWeightControl
            v-model="fieldWeights.title"
            :label="t('title')"
            :description="t('field-description-title')"
            :default-value="25"
          />

          <FieldWeightControl
            v-model="fieldWeights.authors"
            :label="t('authors')"
            :description="t('field-description-authors')"
            :default-value="20"
          />

          <FieldWeightControl
            v-model="fieldWeights.year"
            :label="t('year')"
            :description="t('field-description-year')"
            :default-value="5"
          />
        </FieldWeightSection>

        <!-- Identifier Fields -->
        <FieldWeightSection
          :title="t('identifier-fields')"
          :weight="identifierFieldsWeight"
        >
          <FieldWeightControl
            v-model="fieldWeights.doi"
            label="DOI"
            :description="t('field-description-doi')"
            :default-value="15"
          />

          <FieldWeightControl
            v-model="fieldWeights.arxivId"
            label="ArXiv ID"
            :description="t('field-description-arxivId')"
            :default-value="8"
          />

          <FieldWeightControl
            v-model="fieldWeights.pmid"
            label="PMID"
            :description="t('field-description-pmid')"
            :default-value="3"
          />

          <FieldWeightControl
            v-model="fieldWeights.pmcid"
            label="PMC ID"
            :description="t('field-description-pmcid')"
            :default-value="2"
          />

          <FieldWeightControl
            v-model="fieldWeights.isbn"
            label="ISBN"
            :description="t('field-description-isbn')"
            :default-value="1"
          />

          <FieldWeightControl
            v-model="fieldWeights.issn"
            label="ISSN"
            :description="t('field-description-issn')"
            :default-value="1"
          />
        </FieldWeightSection>

        <!-- Source Fields -->
        <FieldWeightSection
          :title="t('source-fields')"
          :weight="sourceFieldsWeight"
        >
          <FieldWeightControl
            v-model="fieldWeights.containerTitle"
            :label="t('container-title')"
            :description="t('field-description-containerTitle')"
            :default-value="10"
          />

          <FieldWeightControl
            v-model="fieldWeights.volume"
            :label="t('volume')"
            :description="t('field-description-volume')"
            :default-value="5"
          />

          <FieldWeightControl
            v-model="fieldWeights.issue"
            :label="t('issue')"
            :description="t('field-description-issue')"
            :default-value="3"
          />

          <FieldWeightControl
            v-model="fieldWeights.pages"
            :label="t('pages')"
            :description="t('field-description-pages')"
            :default-value="2"
          />

          <FieldWeightControl
            v-model="fieldWeights.publisher"
            :label="t('publisher')"
            :description="t('field-description-publisher')"
            :default-value="3"
          />

          <FieldWeightControl
            v-model="fieldWeights.url"
            label="URL"
            :description="t('field-description-url')"
            :default-value="2"
          />
        </FieldWeightSection>

        <!-- Advanced Fields -->
        <FieldWeightSection
          :title="t('advanced-fields')"
          :weight="additionalFieldsWeight"
          :show-alert="true"
          :alert-text="t('advanced-fields-description')"
        >
          <FieldWeightControl
            v-model="fieldWeights.sourceType"
            :label="t('source-type')"
            :description="t('field-description-sourceType')"
            :default-value="2"
          />

          <FieldWeightControl
            v-model="fieldWeights.conference"
            :label="t('conference')"
            :description="t('field-description-conference')"
            :default-value="5"
          />

          <FieldWeightControl
            v-model="fieldWeights.subtitle"
            :label="t('subtitle')"
            :description="t('field-description-subtitle')"
            :default-value="3"
          />

          <!-- More Advanced Fields -->
          <v-expansion-panels
            variant="accordion"
            class="mt-4"
          >
            <v-expansion-panel>
              <v-expansion-panel-title class="text-body-2">
                {{ t('more-advanced-fields') }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="text-caption text-medium-emphasis mb-4">
                  {{ t('more-advanced-fields-description') }}
                </div>

                <FieldWeightControl
                  v-model="fieldWeights.institution"
                  :label="t('institution')"
                  :description="t('field-description-institution')"
                  :default-value="3"
                />

                <FieldWeightControl
                  v-model="fieldWeights.edition"
                  :label="t('edition')"
                  :description="t('field-description-edition')"
                  :default-value="2"
                />

                <FieldWeightControl
                  v-model="fieldWeights.articleNumber"
                  :label="t('article-number')"
                  :description="t('field-description-articleNumber')"
                  :default-value="1"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </FieldWeightSection>
      </v-expansion-panels>
    </v-card-text>

    <v-card-actions>
      <v-btn
        :prepend-icon="mdiRestore"
        size="small"
        variant="outlined"
        block
        @click="resetToDefaults"
      >
        {{ t('reset-to-defaults') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
