<script setup lang="ts">
import { mdiPalette, mdiRestart } from '@mdi/js'
import { DEFAULT_MATCH_QUALITY_SETTINGS } from '@source-taster/types'
import { matchQualitySettings } from '@/extension/logic/storage'
import SettingsPanel from './SettingsPanel.vue'

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
      <div class="mb-6">
        <div class="d-flex align-center justify-space-between mb-2">
          <label class="font-weight-medium">
            {{ t('exact-match-threshold') }}
          </label>
          <v-chip
            color="success"
            variant="flat"
            size="small"
          >
            {{ matchQualitySettings.thresholds.exactMatchThreshold }}%
          </v-chip>
        </div>
        <v-slider
          v-model="matchQualitySettings.thresholds.exactMatchThreshold"
          :min="90"
          :max="100"
          :step="1"
          :thumb-label="true"
          color="success"
        />
        <p class="text-caption text-medium-emphasis">
          {{ t('exact-match-threshold-description') }}
        </p>
      </div>

      <!-- High Match Threshold -->
      <div class="mb-6">
        <div class="d-flex align-center justify-space-between mb-2">
          <label class="font-weight-medium">
            {{ t('high-match-threshold') }}
          </label>
          <v-chip
            color="warning"
            variant="flat"
            size="small"
          >
            {{ matchQualitySettings.thresholds.highMatchThreshold }}%
          </v-chip>
        </div>
        <v-slider
          v-model="matchQualitySettings.thresholds.highMatchThreshold"
          :min="50"
          :max="95"
          :step="1"
          :thumb-label="true"
          color="warning"
        />
        <p class="text-caption text-medium-emphasis">
          {{ t('high-match-threshold-description') }}
        </p>
      </div>
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
