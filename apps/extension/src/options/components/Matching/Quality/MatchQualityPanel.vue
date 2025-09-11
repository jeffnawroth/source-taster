<script setup lang="ts">
import { mdiAlertCircle, mdiCheckCircle, mdiPalette } from '@mdi/js'
import { DEFAULT_UI_SETTINGS } from '@source-taster/types'
import { settings } from '@/extension/logic'

const { t } = useI18n()

// Reset to defaults
function resetToDefaults() {
  settings.value.matching.matchingConfig.displayThresholds = { ...DEFAULT_UI_SETTINGS.matching.matchingConfig.displayThresholds }
}

// Computed values for dynamic min/max constraints
const exactMatchThreshold = computed({
  get: () => settings.value.matching.matchingConfig.displayThresholds.highMatchThreshold,
  set: (value) => {
    // Ensure exact match is at least 1 point higher than partial match
    const minValue = Math.max(value, settings.value.matching.matchingConfig.displayThresholds.partialMatchThreshold + 1)
    settings.value.matching.matchingConfig.displayThresholds.highMatchThreshold = minValue
  },
})

const highMatchThreshold = computed({
  get: () => settings.value.matching.matchingConfig.displayThresholds.partialMatchThreshold,
  set: (value) => {
    // Ensure partial match is at least 1 point lower than exact match
    const maxValue = Math.min(value, settings.value.matching.matchingConfig.displayThresholds.highMatchThreshold - 1)
    settings.value.matching.matchingConfig.displayThresholds.partialMatchThreshold = maxValue
  },
})

// Threshold slider items with dynamic constraints
const thresholdSliderItems = computed(() => [
  {
    label: t('exact-match-threshold'),
    min: Math.max(51, highMatchThreshold.value + 1), // Always at least 1 higher than high match
    max: 100,
    color: 'success',
    description: t('exact-match-threshold-description'),
    icon: mdiCheckCircle,
  },
  {
    label: t('high-match-threshold'),
    min: 1,
    max: Math.min(99, exactMatchThreshold.value - 1), // Always at least 1 lower than exact match
    color: 'warning',
    description: t('high-match-threshold-description'),
    icon: mdiAlertCircle,
  },
])
</script>

<template>
  <SettingsPanel
    :icon="mdiPalette"
    :title="t('match-quality-settings-title')"
    :description="t('match-quality-settings-description')"
  >
    <!-- Threshold Settings -->
    <v-card
      flat
      :subtitle="$t('quality-thresholds-description')"
    >
      <v-card-text>
        <!-- Exact Match Threshold -->
        <ThresholdSlider
          v-model="exactMatchThreshold"
          v-bind="thresholdSliderItems[0]"
        />

        <ThresholdSlider
          v-model="highMatchThreshold"
          v-bind="thresholdSliderItems[1]"
        />
      </v-card-text>
      <v-card-actions>
        <ResetButton @click="resetToDefaults" />
      </v-card-actions>
    </v-card>
  </SettingsPanel>
</template>
