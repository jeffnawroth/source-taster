<script setup lang="ts">
import type { FieldWeights } from '@source-taster/types'
import { mdiInformationOutline, mdiLightbulbOutline, mdiRestore, mdiTune } from '@mdi/js'
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

// Helper function to check if a field is enabled (weight > 0)
const isFieldEnabled = (fieldValue: number | undefined) => (fieldValue || 0) > 0

// Toggle field enabled/disabled state
function toggleField(field: keyof FieldWeights, defaultValue = 5) {
  const currentValue = fieldWeights.value[field] || 0
  fieldWeights.value[field] = currentValue > 0 ? 0 : defaultValue
}
</script>

<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <v-icon
        :icon="mdiTune"
        class="mr-2"
      />
      <p class="text-h5 font-weight-bold mb-0">
        {{ t('expert-settings') }}
      </p>
    </div>

    <p class="text-body-2 text-medium-emphasis mb-4">
      {{ t('expert-settings-description') }}
    </p>

    <v-divider class="my-4" />

    <v-card
      :title="t('field-weights')"
      :subtitle="t('field-weights-description')"
      flat
    >
      <template #append>
        <v-tooltip
          location="left"
          max-width="400"
        >
          <template #activator="{ props: activatorProps }">
            <v-icon
              :icon="mdiInformationOutline"
              v-bind="activatorProps"
              size="large"
              class="text-medium-emphasis"
            />
          </template>

          <div class="pa-2">
            <div class="d-flex align-center mb-3">
              <v-icon
                :icon="mdiInformationOutline"
                class="mr-2"
                size="small"
              />
              <span class="font-weight-medium">{{ t('how-field-weights-work') }}</span>
            </div>

            <p class="text-body-2 mb-3">
              {{ t('field-weights-explanation') }}
            </p>

            <div class="d-flex align-center mb-2">
              <v-icon
                :icon="mdiLightbulbOutline"
                class="mr-2"
                size="small"
              />
              <span class="font-weight-medium">{{ t('practical-example') }}</span>
            </div>

            <p class="text-caption mb-2">
              <strong>{{ t('scenario') }}:</strong> {{ t('example-scenario') }}
            </p>

            <v-table
              density="compact"
              class="mb-3"
            >
              <thead>
                <tr>
                  <th class="text-caption">
                    {{ t('field') }}
                  </th>
                  <th class="text-caption">
                    {{ t('weight') }}
                  </th>
                  <th class="text-caption">
                    {{ t('impact') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="text-caption">
                    {{ t('title') }}
                  </td>
                  <td class="text-caption">
                    50%
                  </td>
                  <td class="text-caption">
                    {{ t('high-impact') }}
                  </td>
                </tr>
                <tr>
                  <td class="text-caption">
                    DOI
                  </td>
                  <td class="text-caption">
                    30%
                  </td>
                  <td class="text-caption">
                    {{ t('medium-impact') }}
                  </td>
                </tr>
                <tr>
                  <td class="text-caption">
                    {{ t('authors') }}
                  </td>
                  <td class="text-caption">
                    20%
                  </td>
                  <td class="text-caption">
                    {{ t('low-impact') }}
                  </td>
                </tr>
                <tr>
                  <td class="text-caption">
                    {{ t('other-fields') }}
                  </td>
                  <td class="text-caption">
                    0%
                  </td>
                  <td class="text-caption">
                    {{ t('no-impact') }}
                  </td>
                </tr>
              </tbody>
            </v-table>

            <p class="text-caption text-medium-emphasis">
              {{ t('example-explanation') }}
            </p>
          </div>
        </v-tooltip>
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

        <v-expansion-panels
          flat
        >
          <!-- Core Fields -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              {{ t('core-fields') }} ({{ coreFieldsWeight }}%)
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="py-2">
                <!-- Title -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.title)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('title', 25)"
                      />
                      <label class="font-weight-medium">{{ t('title') }}</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.title) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.title || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.title"
                    :disabled="!isFieldEnabled(fieldWeights.title)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-title') }}
                  </p>
                </div>

                <!-- Authors -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.authors)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('authors', 20)"
                      />
                      <label class="font-weight-medium">{{ t('authors') }}</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.authors) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.authors || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.authors"
                    :disabled="!isFieldEnabled(fieldWeights.authors)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-authors') }}
                  </p>
                </div>

                <!-- Year -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.year)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('year', 5)"
                      />
                      <label class="font-weight-medium">{{ t('year') }}</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.year) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.year || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.year"
                    :disabled="!isFieldEnabled(fieldWeights.year)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-year') }}
                  </p>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Identifier Fields -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              {{ t('identifier-fields') }} ({{ identifierFieldsWeight }}%)
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="py-2">
                <!-- DOI -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.doi)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('doi', 15)"
                      />
                      <label class="font-weight-medium">DOI</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.doi) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.doi || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.doi"
                    :disabled="!isFieldEnabled(fieldWeights.doi)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-doi') }}
                  </p>
                </div>

                <!-- ArXiv ID -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.arxivId)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('arxivId', 8)"
                      />
                      <label class="font-weight-medium">ArXiv ID</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.arxivId) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.arxivId || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.arxivId"
                    :disabled="!isFieldEnabled(fieldWeights.arxivId)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-arxivId') }}
                  </p>
                </div>

                <!-- PMID -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.pmid)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('pmid', 3)"
                      />
                      <label class="font-weight-medium">PMID</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.pmid) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.pmid || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.pmid"
                    :disabled="!isFieldEnabled(fieldWeights.pmid)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-pmid') }}
                  </p>
                </div>

                <!-- PMCID -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.pmcid)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('pmcid', 2)"
                      />
                      <label class="font-weight-medium">PMC ID</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.pmcid) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.pmcid || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.pmcid"
                    :disabled="!isFieldEnabled(fieldWeights.pmcid)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-pmcid') }}
                  </p>
                </div>

                <!-- ISBN -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.isbn)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('isbn', 1)"
                      />
                      <label class="font-weight-medium">ISBN</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.isbn) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.isbn || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.isbn"
                    :disabled="!isFieldEnabled(fieldWeights.isbn)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-isbn') }}
                  </p>
                </div>

                <!-- ISSN -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.issn)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('issn', 1)"
                      />
                      <label class="font-weight-medium">ISSN</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.issn) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.issn || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.issn"
                    :disabled="!isFieldEnabled(fieldWeights.issn)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-issn') }}
                  </p>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Source Fields -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              {{ t('source-fields') }} ({{ sourceFieldsWeight }}%)
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="py-2">
                <!-- Container Title -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.containerTitle)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('containerTitle', 10)"
                      />
                      <label class="font-weight-medium">{{ t('container-title') }}</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.containerTitle) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.containerTitle || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.containerTitle"
                    :disabled="!isFieldEnabled(fieldWeights.containerTitle)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-containerTitle') }}
                  </p>
                </div>

                <!-- Volume -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.volume)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('volume', 5)"
                      />
                      <label class="font-weight-medium">{{ t('volume') }}</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.volume) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.volume || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.volume"
                    :disabled="!isFieldEnabled(fieldWeights.volume)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-volume') }}
                  </p>
                </div>

                <!-- Issue -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.issue)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('issue', 3)"
                      />
                      <label class="font-weight-medium">{{ t('issue') }}</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.issue) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.issue || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.issue"
                    :disabled="!isFieldEnabled(fieldWeights.issue)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-issue') }}
                  </p>
                </div>

                <!-- Pages -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.pages)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('pages', 2)"
                      />
                      <label class="font-weight-medium">{{ t('pages') }}</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.pages) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.pages || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.pages"
                    :disabled="!isFieldEnabled(fieldWeights.pages)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-pages') }}
                  </p>
                </div>

                <!-- Publisher -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.publisher)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('publisher', 3)"
                      />
                      <label class="font-weight-medium">{{ t('publisher') }}</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.publisher) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.publisher || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.publisher"
                    :disabled="!isFieldEnabled(fieldWeights.publisher)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-publisher') }}
                  </p>
                </div>

                <!-- URL -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.url)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('url', 2)"
                      />
                      <label class="font-weight-medium">URL</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.url) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.url || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.url"
                    :disabled="!isFieldEnabled(fieldWeights.url)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-url') }}
                  </p>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Advanced Fields -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              {{ t('advanced-fields') }} ({{ additionalFieldsWeight }}%)
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="py-2">
                <v-alert
                  type="info"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                >
                  {{ t('advanced-fields-description') }}
                </v-alert>

                <!-- Source Type -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.sourceType)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('sourceType', 2)"
                      />
                      <label class="font-weight-medium">{{ t('source-type') }}</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.sourceType) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.sourceType || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.sourceType"
                    :disabled="!isFieldEnabled(fieldWeights.sourceType)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-sourceType') }}
                  </p>
                </div>

                <!-- Conference -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.conference)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('conference', 5)"
                      />
                      <label class="font-weight-medium">{{ t('conference') }}</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.conference) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.conference || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.conference"
                    :disabled="!isFieldEnabled(fieldWeights.conference)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-conference') }}
                  </p>
                </div>

                <!-- Subtitle -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-switch
                        :model-value="isFieldEnabled(fieldWeights.subtitle)"
                        density="compact"
                        color="primary"
                        hide-details
                        class="mr-3"
                        @update:model-value="toggleField('subtitle', 3)"
                      />
                      <label class="font-weight-medium">{{ t('subtitle') }}</label>
                    </div>
                    <v-chip
                      size="small"
                      :color="isFieldEnabled(fieldWeights.subtitle) ? 'primary' : 'default'"
                    >
                      {{ fieldWeights.subtitle || 0 }}%
                    </v-chip>
                  </div>
                  <v-slider
                    v-model="fieldWeights.subtitle"
                    :disabled="!isFieldEnabled(fieldWeights.subtitle)"
                    :min="0"
                    :max="100"
                    :step="1"
                    color="primary"
                    show-ticks="always"
                    thumb-label
                  />
                  <p class="text-caption text-medium-emphasis">
                    {{ t('field-description-subtitle') }}
                  </p>
                </div>

                <!-- Advanced Fields (Limited to database-available fields) -->
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

                      <!-- Institution -->
                      <div class="mb-4">
                        <div class="d-flex justify-space-between align-center mb-2">
                          <div class="d-flex align-center">
                            <v-switch
                              :model-value="isFieldEnabled(fieldWeights.institution)"
                              density="compact"
                              color="primary"
                              hide-details
                              class="mr-3"
                              @update:model-value="toggleField('institution', 3)"
                            />
                            <label class="font-weight-medium">{{ t('institution') }}</label>
                          </div>
                          <v-chip
                            size="small"
                            :color="isFieldEnabled(fieldWeights.institution) ? 'primary' : 'default'"
                          >
                            {{ fieldWeights.institution || 0 }}%
                          </v-chip>
                        </div>
                        <v-slider
                          v-model="fieldWeights.institution"
                          :disabled="!isFieldEnabled(fieldWeights.institution)"
                          :min="0"
                          :max="100"
                          :step="1"
                          color="primary"
                          show-ticks="always"
                          thumb-label
                        />
                        <p class="text-caption text-medium-emphasis">
                          {{ t('field-description-institution') }}
                        </p>
                      </div>

                      <!-- Edition -->
                      <div class="mb-4">
                        <div class="d-flex justify-space-between align-center mb-2">
                          <div class="d-flex align-center">
                            <v-switch
                              :model-value="isFieldEnabled(fieldWeights.edition)"
                              density="compact"
                              color="primary"
                              hide-details
                              class="mr-3"
                              @update:model-value="toggleField('edition', 2)"
                            />
                            <label class="font-weight-medium">{{ t('edition') }}</label>
                          </div>
                          <v-chip
                            size="small"
                            :color="isFieldEnabled(fieldWeights.edition) ? 'primary' : 'default'"
                          >
                            {{ fieldWeights.edition || 0 }}%
                          </v-chip>
                        </div>
                        <v-slider
                          v-model="fieldWeights.edition"
                          :disabled="!isFieldEnabled(fieldWeights.edition)"
                          :min="0"
                          :max="100"
                          :step="1"
                          color="primary"
                          show-ticks="always"
                          thumb-label
                        />
                        <p class="text-caption text-medium-emphasis">
                          {{ t('field-description-edition') }}
                        </p>
                      </div>

                      <!-- Article Number -->
                      <div class="mb-4">
                        <div class="d-flex justify-space-between align-center mb-2">
                          <div class="d-flex align-center">
                            <v-switch
                              :model-value="isFieldEnabled(fieldWeights.articleNumber)"
                              density="compact"
                              color="primary"
                              hide-details
                              class="mr-3"
                              @update:model-value="toggleField('articleNumber', 1)"
                            />
                            <label class="font-weight-medium">{{ t('article-number') }}</label>
                          </div>
                          <v-chip
                            size="small"
                            :color="isFieldEnabled(fieldWeights.articleNumber) ? 'primary' : 'default'"
                          >
                            {{ fieldWeights.articleNumber || 0 }}%
                          </v-chip>
                        </div>
                        <v-slider
                          v-model="fieldWeights.articleNumber"
                          :disabled="!isFieldEnabled(fieldWeights.articleNumber)"
                          :min="0"
                          :max="100"
                          :step="1"
                          color="primary"
                          show-ticks="always"
                          thumb-label
                        />
                        <p class="text-caption text-medium-emphasis">
                          {{ t('field-description-articleNumber') }}
                        </p>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-card-actions>
        <!-- Action buttons for field weights -->
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
  </v-container>
</template>
