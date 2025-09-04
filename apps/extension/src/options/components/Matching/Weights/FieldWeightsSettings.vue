<script setup lang="ts">
import { DEFAULT_FIELDS_CONFIG } from '@/extension/constants/defaults/defaultFieldConfig'
import { matchingSettings } from '@/extension/logic'

// Reset to defaults
function resetToDefaults() {
  matchingSettings.value.matchingConfig.fieldConfigurations = { ...DEFAULT_FIELDS_CONFIG }
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
</script>

<template>
  <FieldWeightsValidationAlert
    :total-weight
    :is-valid-configuration
  />

  <FieldWeightsPanels
    v-model="matchingSettings.matchingConfig.fieldConfigurations"
  />

  <v-card-actions>
    <ResetButton @click="resetToDefaults" />
  </v-card-actions>
</template>
