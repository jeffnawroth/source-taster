<script setup lang="ts">
import { mdiAlertCircle, mdiCheckCircle, mdiPalette } from '@mdi/js'
import { DEFAULT_MATCH_QUALITY_THRESHOLDS } from '@source-taster/types'
import { matchingSettings } from '@/extension/logic'

const { t } = useI18n()

// Reset to defaults
function resetToDefaults() {
  matchingSettings.value.matchingConfig.matchThresholds = { ...DEFAULT_MATCH_QUALITY_THRESHOLDS }
}

// Threshold slider items
const thresholdSliderItems = [
  {
    label: t('exact-match-threshold'),
    min: 90,
    max: 100,
    color: 'success',
    description: t('exact-match-threshold-description'),
    icon: mdiCheckCircle,
  },
  {
    label: t('high-match-threshold'),
    min: 50,
    max: 95,
    color: 'warning',
    description: t('high-match-threshold-description'),
    icon: mdiAlertCircle,
  },
]
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
          v-model="matchingSettings.matchingConfig.matchThresholds.exactMatchThreshold"
          v-bind="thresholdSliderItems[0]"
        />

        <ThresholdSlider
          v-model="matchingSettings.matchingConfig.matchThresholds.highMatchThreshold"
          v-bind="thresholdSliderItems[1]"
        />
      </v-card-text>
      <v-card-actions>
        <ResetButton @click="resetToDefaults" />
      </v-card-actions>
    </v-card>
  </SettingsPanel>
</template>
