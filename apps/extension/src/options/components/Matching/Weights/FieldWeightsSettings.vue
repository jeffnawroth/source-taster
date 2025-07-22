<script setup lang="ts">
import { DEFAULT_FIELD_WEIGHTS, type FieldWeights } from '@source-taster/types'
import { matchingSettings } from '@/extension/logic'

// Computed property to access field weights from matching settings
const fieldWeights = computed({
  get: () => matchingSettings.value.fieldWeights,
  set: (value: FieldWeights) => {
    matchingSettings.value = {
      ...matchingSettings.value,
      fieldWeights: value,
    }
  },
})

// Reset to defaults
function resetToDefaults() {
  fieldWeights.value = { ...DEFAULT_FIELD_WEIGHTS }
}

// Calculate total weight for validation
const totalWeight = computed(() => {
  return Object.values(fieldWeights.value).reduce((sum: number, weight) => sum + (weight || 0), 0)
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
  <!-- <template #append>
      <FieldWeightsTooltip />
    </template> -->

  <FieldWeightsValidationAlert
    :total-weight
    :is-valid-configuration
  />

  <FieldWeightsPanels
    v-model="fieldWeights"
    :core-fields-weight
    :identifier-fields-weight
    :source-fields-weight
    :additional-fields-weight
  />

  <v-card-actions>
    <ResetButton @click="resetToDefaults" />
  </v-card-actions>
</template>
