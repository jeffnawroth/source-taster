<script setup lang="ts">
import { DEFAULT_FIELDS_CONFIG } from '@/extension/constants/defaults/defaultFieldConfig'
import { FIELD_GROUPS } from '@/extension/constants/fieldWeightConstants'
import { matchingSettings } from '@/extension/logic'

// Reset to defaults
function resetToDefaults() {
  matchingSettings.value.matchingConfig.fieldConfigurations = { ...DEFAULT_FIELDS_CONFIG }
}

// Helper function to calculate weight for enabled fields
function calculateWeightForFields(fieldKeys: readonly string[]): number {
  return fieldKeys.reduce((sum, key) => {
    const config = matchingSettings.value.matchingConfig.fieldConfigurations[key as keyof typeof matchingSettings.value.matchingConfig.fieldConfigurations]
    return sum + (config?.enabled ? (config.weight || 0) : 0)
  }, 0)
}

// Calculate total weight for validation - only enabled fields
const totalWeight = computed(() => {
  return Object.values(matchingSettings.value.matchingConfig.fieldConfigurations).reduce((sum: number, config) => {
    return sum + (config?.enabled ? (config.weight || 0) : 0)
  }, 0)
})

// Validation
const isValidConfiguration = computed(() => {
  return totalWeight.value === 100
})

// Dynamic weight calculations
const coreFieldsWeight = computed(() => calculateWeightForFields(FIELD_GROUPS.core))
const identifierFieldsWeight = computed(() => calculateWeightForFields(FIELD_GROUPS.identifier))
const sourceFieldsWeight = computed(() => calculateWeightForFields(FIELD_GROUPS.source))
const additionalFieldsWeight = computed(() => calculateWeightForFields(FIELD_GROUPS.additional))
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
