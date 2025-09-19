<script setup lang="ts">
import { mdiAlertCircleOutline, mdiBullseye, mdiHelpCircleOutline, mdiPalette, mdiTarget } from '@mdi/js'
import { DEFAULT_UI_SETTINGS } from '@source-taster/types'
import { settings } from '@/extension/logic'

const { t } = useI18n()

// Reset to defaults
function resetToDefaults() {
  settings.value.matching.matchingConfig.displayThresholds = { ...DEFAULT_UI_SETTINGS.matching.matchingConfig.displayThresholds }
}

// Computed values for dynamic min/max constraints
const strongMatchThreshold = computed({
  get: () => settings.value.matching.matchingConfig.displayThresholds.strongMatchThreshold,
  set: (value) => {
    // Ensure strong match is at least 1 point higher than possible match, but less than 100
    const minValue = Math.max(value, settings.value.matching.matchingConfig.displayThresholds.possibleMatchThreshold + 1)
    const maxValue = Math.min(minValue, 99)
    settings.value.matching.matchingConfig.displayThresholds.strongMatchThreshold = maxValue
  },
})

const possibleMatchThreshold = computed({
  get: () => settings.value.matching.matchingConfig.displayThresholds.possibleMatchThreshold,
  set: (value) => {
    // Ensure possible match is at least 1 point lower than strong match
    const maxValue = Math.min(value, settings.value.matching.matchingConfig.displayThresholds.strongMatchThreshold - 1)
    settings.value.matching.matchingConfig.displayThresholds.possibleMatchThreshold = Math.max(maxValue, 1)
  },
})

// Threshold slider items with dynamic constraints (only editable ones)
const thresholdSliderItems = computed(() => [
  {
    label: t('strong-match-threshold'),
    min: Math.max(51, possibleMatchThreshold.value + 1),
    max: 99,
    color: 'success',
    description: t('strong-match-threshold-description'),
    icon: mdiTarget,
  },
  {
    label: t('possible-match-threshold'),
    min: 1,
    max: Math.min(98, strongMatchThreshold.value - 1),
    color: 'warning',
    description: t('possible-match-threshold-description'),
    icon: mdiHelpCircleOutline,
  },
])
</script>

<template>
  <SettingsPanel
    :icon="mdiPalette"
    :title="t('match-quality-settings-title')"
    :description="t('match-quality-settings-description')"
    :subtitle="t('quality-thresholds-description')"
  >
    <!-- Threshold Settings -->
    <v-card
      flat
    >
      <v-card-text>
        <div class="mb-6">
          <div class="d-flex align-center justify-space-between mb-2">
            <label class="font-weight-medium d-flex align-center">
              <v-icon
                :icon="mdiBullseye"
                color="success"
                class="me-2"
              />
              {{ t('exact-match-threshold') }}
            </label>
            <v-chip
              color="success"
              variant="flat"
            >
              {{ 100 }}%
            </v-chip>
          </div>
          <p class="text-body-2 text-medium-emphasis">
            {{ t('exact-match-threshold-description') }}
          </p>
        </div>

        <!-- Strong Match Threshold -->
        <ThresholdSlider
          v-model="strongMatchThreshold"
          v-bind="thresholdSliderItems[0]"
        />

        <!-- Possible Match Threshold -->
        <ThresholdSlider
          v-model="possibleMatchThreshold"
          v-bind="thresholdSliderItems[1]"
        />

        <div class="mb-6">
          <div class="d-flex align-center justify-space-between mb-2">
            <label class="font-weight-medium d-flex align-center">
              <v-icon
                :icon="mdiAlertCircleOutline"
                color="error"
                class="me-2"
              />
              {{ t('no-match-threshold') }}
            </label>
            <v-chip
              color="error"
              variant="flat"
            >
              &lt; {{ possibleMatchThreshold }}%
            </v-chip>
          </div>
          <p class="text-body-2 text-medium-emphasis">
            {{ t('no-match-threshold-description') }}
          </p>
        </div>
      </v-card-text>
      <v-card-actions>
        <ResetButton @click="resetToDefaults" />
      </v-card-actions>
    </v-card>
  </SettingsPanel>
</template>
