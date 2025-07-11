<script setup lang="ts">
import type { FieldWeights } from '@source-taster/types'
import { mdiRestore, mdiTune } from '@mdi/js'
import { fieldWeights } from '@/extension/logic'

// TRANSLATION
const { t } = useI18n()

const panel = ref([1])

// Default field weights (could be extracted to a constant)
const defaultFieldWeights: FieldWeights = {
  title: 25,
  authors: 20,
  year: 5,
  doi: 15,
  containerTitle: 10,
  volume: 5,
  issue: 3,
  pages: 2,
  arxivId: 8,
  pmid: 3,
  pmcid: 2,
  isbn: 1,
  issn: 1,
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
  return (fieldWeights.value.containerTitle || 0) + (fieldWeights.value.volume || 0) + (fieldWeights.value.issue || 0) + (fieldWeights.value.pages || 0)
})
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

    <v-expansion-panels
      v-model="panel"
      flat
    >
      <v-expansion-panel
        :value="1"
        :title="$t('field-weights')"
      >
        <template #text>
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

          <v-card-subtitle>{{ t('field-weights-description') }}</v-card-subtitle>

          <v-expansion-panels class="my-4">
            <v-expansion-panel>
              <v-expansion-panel-title>
                {{ t('core-fields') }} ({{ coreFieldsWeight }}%)
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="py-2">
                  <!-- Title -->
                  <div class="mb-4">
                    <div class="d-flex justify-space-between align-center mb-2">
                      <label class="font-weight-medium">{{ t('title') }}</label>
                      <v-chip size="small">
                        {{ fieldWeights.title }}%
                      </v-chip>
                    </div>
                    <v-slider
                      v-model="fieldWeights.title"
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
                      <label class="font-weight-medium">{{ t('authors') }}</label>
                      <v-chip size="small">
                        {{ fieldWeights.authors }}%
                      </v-chip>
                    </div>
                    <v-slider
                      v-model="fieldWeights.authors"
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
                      <label class="font-weight-medium">{{ t('year') }}</label>
                      <v-chip size="small">
                        {{ fieldWeights.year }}%
                      </v-chip>
                    </div>
                    <v-slider
                      v-model="fieldWeights.year"
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
                      <label class="font-weight-medium">DOI</label>
                      <v-chip size="small">
                        {{ fieldWeights.doi || 0 }}%
                      </v-chip>
                    </div>
                    <v-slider
                      v-model="fieldWeights.doi"
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
                      <label class="font-weight-medium">ArXiv ID</label>
                      <v-chip size="small">
                        {{ fieldWeights.arxivId || 0 }}%
                      </v-chip>
                    </div>
                    <v-slider
                      v-model="fieldWeights.arxivId"
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
                      <label class="font-weight-medium">PMID</label>
                      <v-chip size="small">
                        {{ fieldWeights.pmid || 0 }}%
                      </v-chip>
                    </div>
                    <v-slider
                      v-model="fieldWeights.pmid"
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
                      <label class="font-weight-medium">PMC ID</label>
                      <v-chip size="small">
                        {{ fieldWeights.pmcid || 0 }}%
                      </v-chip>
                    </div>
                    <v-slider
                      v-model="fieldWeights.pmcid"
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
                      <label class="font-weight-medium">ISBN</label>
                      <v-chip size="small">
                        {{ fieldWeights.isbn || 0 }}%
                      </v-chip>
                    </div>
                    <v-slider
                      v-model="fieldWeights.isbn"
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
                      <label class="font-weight-medium">ISSN</label>
                      <v-chip size="small">
                        {{ fieldWeights.issn || 0 }}%
                      </v-chip>
                    </div>
                    <v-slider
                      v-model="fieldWeights.issn"
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
                      <label class="font-weight-medium">{{ t('container-title') }}</label>
                      <v-chip size="small">
                        {{ fieldWeights.containerTitle || 0 }}%
                      </v-chip>
                    </div>
                    <v-slider
                      v-model="fieldWeights.containerTitle"
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
                      <label class="font-weight-medium">{{ t('volume') }}</label>
                      <v-chip size="small">
                        {{ fieldWeights.volume || 0 }}%
                      </v-chip>
                    </div>
                    <v-slider
                      v-model="fieldWeights.volume"
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
                      <label class="font-weight-medium">{{ t('issue') }}</label>
                      <v-chip size="small">
                        {{ fieldWeights.issue || 0 }}%
                      </v-chip>
                    </div>
                    <v-slider
                      v-model="fieldWeights.issue"
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
                      <label class="font-weight-medium">{{ t('pages') }}</label>
                      <v-chip size="small">
                        {{ fieldWeights.pages || 0 }}%
                      </v-chip>
                    </div>
                    <v-slider
                      v-model="fieldWeights.pages"
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
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- Action buttons for field weights -->
          <div class="d-flex justify-end my-4">
            <v-btn
              :prepend-icon="mdiRestore"
              size="small"
              variant="tonal"
              @click="resetToDefaults"
            >
              {{ t('reset-to-defaults') }}
            </v-btn>
          </div>
        </template>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>
