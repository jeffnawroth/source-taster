<script setup lang="ts">
import { mdiFlash } from '@mdi/js'
import { DEFAULT_UI_SETTINGS } from '@source-taster/types'
import { settings } from '@/extension/logic'

// TRANSLATION
const { t } = useI18n()

// Reset to defaults
function resetToDefaults() {
  settings.value.matching.matchingConfig.earlyTermination = { ...DEFAULT_UI_SETTINGS.matching.matchingConfig.earlyTermination }
}
</script>

<template>
  <SettingsPanel
    :icon="mdiFlash"
    :title="t('early-termination-title')"
    :description="t('early-termination-description')"
  >
    <!-- Enable/Disable Switch -->
    <v-card flat>
      <v-card-text>
        <v-switch
          v-model="settings.matching.matchingConfig.earlyTermination.enabled"
          :label="t('early-termination-enabled')"
          color="primary"
          class="mb-3"
          inset
        />

        <!-- Threshold Slider -->
        <v-expand-transition>
          <div v-if="settings.matching.matchingConfig.earlyTermination.enabled">
            <v-divider class="mb-4" />

            <div class="mb-2">
              <v-label class="text-body-2 font-weight-medium mb-2 d-block">
                {{ t('early-termination-threshold') }}
              </v-label>
              <p class="text-caption text-medium-emphasis mb-3">
                {{ t('early-termination-threshold-description') }}
              </p>
            </div>

            <v-slider
              v-model="settings.matching.matchingConfig.earlyTermination.threshold"
              :min="50"
              :max="99"
              :step="1"
              thumb-label="always"
              color="primary"
              track-color="grey-lighten-1"
              class="mb-2"
            >
              <template #thumb-label="{ modelValue }">
                {{ modelValue }}%
              </template>
            </v-slider>

            <!-- Threshold Helper Text -->
            <div class="d-flex justify-space-between text-caption text-medium-emphasis">
              <span>{{ t('early-termination-threshold-low') }}</span>
              <span>{{ t('early-termination-threshold-high') }}</span>
            </div>

            <!-- Current Setting Display -->
            <v-alert
              :text="t('early-termination-current-setting', { threshold: settings.matching.matchingConfig.earlyTermination.threshold })"
              type="info"
              variant="tonal"
              class="mt-4"
            />
          </div>
        </v-expand-transition>
      </v-card-text>
    </v-card>

    <!-- Reset Button -->
    <template #actions>
      <ResetButton @click="resetToDefaults" />
    </template>
  </SettingsPanel>
</template>
