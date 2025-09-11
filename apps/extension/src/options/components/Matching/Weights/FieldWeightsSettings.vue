<script setup lang="ts">
import { makeDefaultUISettings } from '@source-taster/types'
import { settings } from '@/extension/logic'

// Reset to defaults
function resetToDefaults() {
  settings.value.matching.matchingConfig.fieldConfigurations = { ...makeDefaultUISettings().matching.matchingConfig.fieldConfigurations }
}

// Calculate total weight for validation - only enabled fields
const totalWeight = computed(() => {
  return Object.values(settings.value.matching.matchingConfig.fieldConfigurations).reduce((sum: number, config) => {
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
    v-model="settings.matching.matchingConfig.fieldConfigurations"
  />

  <v-card-actions>
    <ResetButton @click="resetToDefaults" />
  </v-card-actions>
</template>
