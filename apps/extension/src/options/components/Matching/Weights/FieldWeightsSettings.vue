<script setup lang="ts">
import { DEFAULT_FIELDS_CONFIG } from '@source-taster/types'
import { matchingSettings } from '@/extension/logic'

// Reset to defaults
function resetToDefaults() {
  matchingSettings.value.matchingConfig.fieldConfigurations = { ...DEFAULT_FIELDS_CONFIG }
}

// Calculate total weight for validation
const totalWeight = computed(() => {
  return Object.values(matchingSettings.value.matchingConfig.fieldConfigurations).reduce((sum: number, config) => sum + (config.weight || 0), 0)
})

// Validation
const isValidConfiguration = computed(() => {
  return totalWeight.value === 100
})

// Core fields weight
const coreFieldsWeight = computed(() => {
  return (matchingSettings.value.matchingConfig.fieldConfigurations.title?.weight || 0) + (matchingSettings.value.matchingConfig.fieldConfigurations.authors?.weight || 0) + (matchingSettings.value.matchingConfig.fieldConfigurations.year?.weight || 0)
})

// Identifier fields weight
const identifierFieldsWeight = computed(() => {
  return (matchingSettings.value.matchingConfig.fieldConfigurations.doi?.weight || 0) + (matchingSettings.value.matchingConfig.fieldConfigurations.arxivId?.weight || 0) + (matchingSettings.value.matchingConfig.fieldConfigurations.pmid?.weight || 0) + (matchingSettings.value.matchingConfig.fieldConfigurations.pmcid?.weight || 0) + (matchingSettings.value.matchingConfig.fieldConfigurations.isbn?.weight || 0) + (matchingSettings.value.matchingConfig.fieldConfigurations.issn?.weight || 0)
})

// Source fields weight
const sourceFieldsWeight = computed(() => {
  return (matchingSettings.value.matchingConfig.fieldConfigurations.containerTitle?.weight || 0) + (matchingSettings.value.matchingConfig.fieldConfigurations.volume?.weight || 0) + (matchingSettings.value.matchingConfig.fieldConfigurations.issue?.weight || 0) + (matchingSettings.value.matchingConfig.fieldConfigurations.pages?.weight || 0) + (matchingSettings.value.matchingConfig.fieldConfigurations.publisher?.weight || 0) + (matchingSettings.value.matchingConfig.fieldConfigurations.url?.weight || 0)
})

// Additional fields weight (specialized/advanced fields)
const additionalFieldsWeight = computed(() => {
  return (matchingSettings.value.matchingConfig.fieldConfigurations.sourceType?.weight || 0) + (matchingSettings.value.matchingConfig.fieldConfigurations.conference?.weight || 0) + (matchingSettings.value.matchingConfig.fieldConfigurations.institution?.weight || 0) + (matchingSettings.value.matchingConfig.fieldConfigurations.edition?.weight || 0) + (matchingSettings.value.matchingConfig.fieldConfigurations.articleNumber?.weight || 0) + (matchingSettings.value.matchingConfig.fieldConfigurations.subtitle?.weight || 0)
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
    v-model="matchingSettings.matchingConfig.fieldConfigurations"
    :core-fields-weight
    :identifier-fields-weight
    :source-fields-weight
    :additional-fields-weight
  />

  <v-card-actions>
    <ResetButton @click="resetToDefaults" />
  </v-card-actions>
</template>
