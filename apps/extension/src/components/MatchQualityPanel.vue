<script setup lang="ts">
import { mdiAlertCircle, mdiCheckCircle, mdiPalette, mdiRestart } from '@mdi/js'
import { DEFAULT_MATCH_QUALITY_SETTINGS } from '@source-taster/types'
import { matchQualitySettings } from '@/extension/logic/storage'
import SettingsPanel from './SettingsPanel.vue'
import ThresholdSlider from './ThresholdSlider.vue'

const { t } = useI18n()

// Reset to defaults
function resetToDefaults() {
  matchQualitySettings.value = { ...DEFAULT_MATCH_QUALITY_SETTINGS }
}
</script>

<template>
  <SettingsPanel
    :icon="mdiPalette"
    :title="t('match-quality-settings-title')"
    :description="t('match-quality-settings-description')"
  >
    <!-- Threshold Settings -->
    <div class="mb-4">
      <h3 class="text-h6 mb-3">
        {{ t('quality-thresholds') }}
      </h3>
      <p class="text-body-2 text-medium-emphasis mb-4">
        {{ t('quality-thresholds-description') }}
      </p>

      <!-- Exact Match Threshold -->
      <ThresholdSlider
        v-model="matchQualitySettings.thresholds.exactMatchThreshold"
        :label="t('exact-match-threshold')"
        :min="90"
        :max="100"
        color="success"
        :description="t('exact-match-threshold-description')"
        :icon="mdiCheckCircle"
      />

      <!-- High Match Threshold -->
      <ThresholdSlider
        v-model="matchQualitySettings.thresholds.highMatchThreshold"
        :label="t('high-match-threshold')"
        :min="50"
        :max="95"
        color="warning"
        :description="t('high-match-threshold-description')"
        :icon="mdiAlertCircle"
      />
    </div>

    <!-- Actions -->
    <v-row class="mt-4">
      <v-col cols="auto">
        <v-btn
          variant="tonal"
          color="primary"
          @click="resetToDefaults"
        >
          <v-icon
            start
            :icon="mdiRestart"
          />
          {{ t('reset-to-defaults') }}
        </v-btn>
      </v-col>
    </v-row>
  </SettingsPanel>
</template>
