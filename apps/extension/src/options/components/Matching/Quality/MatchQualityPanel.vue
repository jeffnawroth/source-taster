<script setup lang="ts">
import { mdiAlertCircle, mdiCheckCircle, mdiPalette } from '@mdi/js'
import { DEFAULT_MATCH_QUALITY_SETTINGS } from '@source-taster/types'
import { matchQualitySettings } from '@/extension/logic/storage'

const { t } = useI18n()

// Reset to defaults
function resetToDefaults() {
  matchQualitySettings.value = { ...DEFAULT_MATCH_QUALITY_SETTINGS }
}

// Threshold slider items
const thresholdSliderItems = [
  {
    modelValue: matchQualitySettings.value.thresholds.exactMatchThreshold,
    label: t('exact-match-threshold'),
    min: 90,
    max: 100,
    color: 'success',
    description: t('exact-match-threshold-description'),
    icon: mdiCheckCircle,
  },
  {
    modelValue: matchQualitySettings.value.thresholds.highMatchThreshold,
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
          v-for="item in thresholdSliderItems"
          :key="item.label"
          v-bind="item"
        />
      </v-card-text>
      <v-card-actions>
        <ResetButton @click="resetToDefaults" />
      </v-card-actions>
    </v-card>
  </SettingsPanel>
</template>
