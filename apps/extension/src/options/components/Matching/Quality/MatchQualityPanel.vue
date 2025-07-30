<script setup lang="ts">
import { mdiAlertCircle, mdiCheckCircle, mdiPalette } from '@mdi/js'
import { DEFAULT_MATCH_QUALITY_THRESHOLDS } from '@/extension/constants/defaults/defaultMatchingSettings'
import { matchingSettings } from '@/extension/logic'

const { t } = useI18n()

// Reset to defaults
function resetToDefaults() {
  matchingSettings.value.matchingConfig.matchThresholds = { ...DEFAULT_MATCH_QUALITY_THRESHOLDS }
}

// Computed values for dynamic min/max constraints
const exactMatchThreshold = computed({
  get: () => matchingSettings.value.matchingConfig.matchThresholds.exactMatchThreshold,
  set: (value) => {
    // Ensure exact match is at least 1 point higher than high match
    const minValue = Math.max(value, matchingSettings.value.matchingConfig.matchThresholds.highMatchThreshold + 1)
    matchingSettings.value.matchingConfig.matchThresholds.exactMatchThreshold = minValue
  },
})

const highMatchThreshold = computed({
  get: () => matchingSettings.value.matchingConfig.matchThresholds.highMatchThreshold,
  set: (value) => {
    // Ensure high match is at least 1 point lower than exact match
    const maxValue = Math.min(value, matchingSettings.value.matchingConfig.matchThresholds.exactMatchThreshold - 1)
    matchingSettings.value.matchingConfig.matchThresholds.highMatchThreshold = maxValue
  },
})

// Threshold slider items with dynamic constraints
const thresholdSliderItems = computed(() => [
  {
    label: t('exact-match-threshold'),
    min: Math.max(91, highMatchThreshold.value + 1), // Never below 91 and always at least 1 higher than high match
    max: 100,
    color: 'success',
    description: t('exact-match-threshold-description'),
    icon: mdiCheckCircle,
  },
  {
    label: t('high-match-threshold'),
    min: 50,
    max: Math.min(99, exactMatchThreshold.value - 1), // Never above 99 and always at least 1 lower than exact match
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
