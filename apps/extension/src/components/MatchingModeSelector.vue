<script setup lang="ts">
import type { CustomMatchingSettings } from '@source-taster/types'
import { mdiHelpCircleOutline } from '@mdi/js'
import { MatchingMode } from '@source-taster/types'
import { matchingSettings } from '@/extension/logic'

// TRANSLATION
const { t } = useI18n()

// Show custom settings when CUSTOM mode is selected
const showCustomSettings = computed(() => matchingSettings.value.matchingMode === MatchingMode.CUSTOM)

// Safe access to custom settings with initialization
const customSettings = computed({
  get: () => {
    if (!matchingSettings.value.customSettings) {
      matchingSettings.value.customSettings = {} as CustomMatchingSettings
    }
    return matchingSettings.value.customSettings
  },
  set: (value) => {
    matchingSettings.value.customSettings = value
  },
})

// Preset functions
function loadStrictPreset() {
  // Ensure we're in CUSTOM mode
  if (matchingSettings.value.matchingMode !== MatchingMode.CUSTOM) {
    matchingSettings.value.matchingMode = MatchingMode.CUSTOM
  }

  // Initialize if needed
  if (!matchingSettings.value.customSettings) {
    matchingSettings.value.customSettings = {} as CustomMatchingSettings
  }

  const newSettings = { ...matchingSettings.value.customSettings }

  // Strict settings: exact matching only
  newSettings.ignoreCaseForText = false
  newSettings.ignorePunctuation = false
  newSettings.allowAuthorFormatVariations = false
  newSettings.allowJournalAbbreviations = false
  newSettings.allowPageFormatVariations = false
  newSettings.allowDateFormatVariations = false
  newSettings.ignoreWhitespace = false
  newSettings.normalizeCharacters = false
  newSettings.minimumMatchThreshold = 95
  newSettings.enableFuzzyMatching = false
  newSettings.fuzzyMatchingThreshold = 0.9

  matchingSettings.value.customSettings = newSettings
}

function loadBalancedPreset() {
  // Ensure we're in CUSTOM mode
  if (matchingSettings.value.matchingMode !== MatchingMode.CUSTOM) {
    matchingSettings.value.matchingMode = MatchingMode.CUSTOM
  }

  // Initialize if needed
  if (!matchingSettings.value.customSettings) {
    matchingSettings.value.customSettings = {} as CustomMatchingSettings
  }

  const newSettings = { ...matchingSettings.value.customSettings }

  // Balanced settings: reasonable flexibility
  newSettings.ignoreCaseForText = true
  newSettings.ignorePunctuation = true
  newSettings.allowAuthorFormatVariations = true
  newSettings.allowJournalAbbreviations = true
  newSettings.allowPageFormatVariations = true
  newSettings.allowDateFormatVariations = true
  newSettings.ignoreWhitespace = true
  newSettings.normalizeCharacters = true
  newSettings.minimumMatchThreshold = 75
  newSettings.enableFuzzyMatching = false
  newSettings.fuzzyMatchingThreshold = 0.8

  matchingSettings.value.customSettings = newSettings
}

function loadTolerantPreset() {
  // Ensure we're in CUSTOM mode
  if (matchingSettings.value.matchingMode !== MatchingMode.CUSTOM) {
    matchingSettings.value.matchingMode = MatchingMode.CUSTOM
  }

  // Initialize if needed
  if (!matchingSettings.value.customSettings) {
    matchingSettings.value.customSettings = {} as CustomMatchingSettings
  }

  const newSettings = { ...matchingSettings.value.customSettings }

  // Tolerant settings: maximum flexibility
  newSettings.ignoreCaseForText = true
  newSettings.ignorePunctuation = true
  newSettings.allowAuthorFormatVariations = true
  newSettings.allowJournalAbbreviations = true
  newSettings.allowPageFormatVariations = true
  newSettings.allowDateFormatVariations = true
  newSettings.ignoreWhitespace = true
  newSettings.normalizeCharacters = true
  newSettings.minimumMatchThreshold = 60
  newSettings.enableFuzzyMatching = true
  newSettings.fuzzyMatchingThreshold = 0.7

  matchingSettings.value.customSettings = newSettings
}
</script>

<template>
  <v-radio-group
    v-model="matchingSettings.matchingMode"
    class="mb-0"
  >
    <div class="d-flex align-center justify-space-between mb-2">
      <v-radio
        :value="MatchingMode.STRICT"
        class="flex-grow-1"
      >
        <template #label>
          <div>
            <div class="font-weight-medium">
              🔒 {{ t('matching-mode-strict') }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ t('matching-mode-strict-description') }}
            </div>
          </div>
        </template>
      </v-radio>
      <v-tooltip
        location="left"
        max-width="400"
      >
        <template #activator="{ props }">
          <v-icon
            v-bind="props"
            :icon="mdiHelpCircleOutline"
            size="small"
            class="text-medium-emphasis ml-2"
          />
        </template>
        <div class="pa-2">
          <div class="font-weight-bold mb-2">
            {{ t('matching-mode-strict-tooltip-title') }}
          </div>
          <div class="mb-2">
            {{ t('matching-mode-strict-tooltip-description') }}
          </div>
        </div>
      </v-tooltip>
    </div>

    <div class="d-flex align-center justify-space-between mb-2">
      <v-radio
        :value="MatchingMode.BALANCED"
        class="flex-grow-1"
      >
        <template #label>
          <div>
            <div class="font-weight-medium">
              ⚖️ {{ t('matching-mode-balanced') }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ t('matching-mode-balanced-description') }}
            </div>
          </div>
        </template>
      </v-radio>
      <v-tooltip
        location="left"
        max-width="400"
      >
        <template #activator="{ props }">
          <v-icon
            v-bind="props"
            :icon="mdiHelpCircleOutline"
            size="small"
            class="text-medium-emphasis ml-2"
          />
        </template>
        <div class="pa-2">
          <div class="font-weight-bold mb-2">
            {{ t('matching-mode-balanced-tooltip-title') }}
          </div>
          <div class="mb-2">
            {{ t('matching-mode-balanced-tooltip-description') }}
          </div>
        </div>
      </v-tooltip>
    </div>

    <div class="d-flex align-center justify-space-between mb-2">
      <v-radio
        :value="MatchingMode.TOLERANT"
        class="flex-grow-1"
      >
        <template #label>
          <div>
            <div class="font-weight-medium">
              🎯 {{ t('matching-mode-tolerant') }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ t('matching-mode-tolerant-description') }}
            </div>
          </div>
        </template>
      </v-radio>
      <v-tooltip
        location="left"
        max-width="400"
      >
        <template #activator="{ props }">
          <v-icon
            v-bind="props"
            :icon="mdiHelpCircleOutline"
            size="small"
            class="text-medium-emphasis ml-2"
          />
        </template>
        <div class="pa-2">
          <div class="font-weight-bold mb-2">
            {{ t('matching-mode-tolerant-tooltip-title') }}
          </div>
          <div class="mb-2">
            {{ t('matching-mode-tolerant-tooltip-description') }}
          </div>
        </div>
      </v-tooltip>
    </div>

    <div class="d-flex align-center justify-space-between mb-2">
      <v-radio
        :value="MatchingMode.CUSTOM"
        class="flex-grow-1"
      >
        <template #label>
          <div>
            <div class="font-weight-medium">
              🔧 {{ t('matching-mode-custom') }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ t('matching-mode-custom-description') }}
            </div>
          </div>
        </template>
      </v-radio>
      <v-tooltip
        location="left"
        max-width="400"
      >
        <template #activator="{ props }">
          <v-icon
            v-bind="props"
            :icon="mdiHelpCircleOutline"
            size="small"
            class="text-medium-emphasis ml-2"
          />
        </template>
        <div class="pa-2">
          <div class="font-weight-bold mb-2">
            {{ t('matching-mode-custom-tooltip-title') }}
          </div>
          <div class="mb-2">
            {{ t('matching-mode-custom-tooltip-description') }}
          </div>
        </div>
      </v-tooltip>
    </div>
  </v-radio-group>

  <!-- Custom Settings Panel -->
  <v-expand-transition>
    <div
      v-if="showCustomSettings"
      class="mt-4"
    >
      <v-divider class="mb-4" />

      <!-- Preset Buttons -->
      <div class="d-flex flex-wrap gap-2 mb-4">
        <v-btn
          size="small"
          variant="outlined"
          color="error"
          @click="loadStrictPreset"
        >
          🔒 {{ t('load-strict-preset') }}
        </v-btn>
        <v-btn
          size="small"
          variant="outlined"
          color="success"
          @click="loadBalancedPreset"
        >
          ⚖️ {{ t('load-balanced-preset') }}
        </v-btn>
        <v-btn
          size="small"
          variant="outlined"
          color="info"
          @click="loadTolerantPreset"
        >
          🎯 {{ t('load-tolerant-preset') }}
        </v-btn>
      </div>

      <!-- Text Matching Options -->
      <v-card
        variant="outlined"
        class="mb-4"
      >
        <v-card-title class="text-h6">
          {{ t('matching-text-options-title') }}
        </v-card-title>
        <v-card-text>
          <div class="d-flex flex-column gap-3">
            <v-switch
              v-model="customSettings.ignoreCaseForText"
              color="primary"
              :label="t('matching-ignore-case')"
              hide-details
            />
            <v-switch
              v-model="customSettings.ignorePunctuation"
              color="primary"
              :label="t('matching-ignore-punctuation')"
              hide-details
            />
            <v-switch
              v-model="customSettings.ignoreWhitespace"
              color="primary"
              :label="t('matching-ignore-whitespace')"
              hide-details
            />
            <v-switch
              v-model="customSettings.normalizeCharacters"
              color="primary"
              :label="t('matching-normalize-characters')"
              hide-details
            />
          </div>
        </v-card-text>
      </v-card>

      <!-- Format Variations -->
      <v-card
        variant="outlined"
        class="mb-4"
      >
        <v-card-title class="text-h6">
          {{ t('matching-format-variations-title') }}
        </v-card-title>
        <v-card-text>
          <div class="d-flex flex-column gap-3">
            <v-switch
              v-model="customSettings.allowAuthorFormatVariations"
              color="primary"
              :label="t('matching-allow-author-variations')"
              hide-details
            />
            <v-switch
              v-model="customSettings.allowJournalAbbreviations"
              color="primary"
              :label="t('matching-allow-journal-abbreviations')"
              hide-details
            />
            <v-switch
              v-model="customSettings.allowPageFormatVariations"
              color="primary"
              :label="t('matching-allow-page-variations')"
              hide-details
            />
            <v-switch
              v-model="customSettings.allowDateFormatVariations"
              color="primary"
              :label="t('matching-allow-date-variations')"
              hide-details
            />
          </div>
        </v-card-text>
      </v-card>

      <!-- Threshold Settings -->
      <v-card
        variant="outlined"
        class="mb-4"
      >
        <v-card-title class="text-h6">
          {{ t('matching-threshold-settings') }}
        </v-card-title>
        <v-card-text>
          <v-slider
            v-model="customSettings.minimumMatchThreshold"
            :label="t('matching-minimum-threshold')"
            :min="0"
            :max="100"
            :step="5"
            thumb-label
            show-ticks="always"
            color="primary"
            class="mb-4"
          >
            <template #append>
              <span class="text-body-2 font-weight-bold">{{ customSettings.minimumMatchThreshold }}%</span>
            </template>
          </v-slider>

          <v-switch
            v-model="customSettings.enableFuzzyMatching"
            color="primary"
            :label="t('matching-enable-fuzzy')"
            hide-details
            class="mb-3"
          />

          <v-expand-transition>
            <div v-if="customSettings.enableFuzzyMatching">
              <v-slider
                v-model="customSettings.fuzzyMatchingThreshold"
                :label="t('matching-fuzzy-threshold')"
                :min="0.1"
                :max="1.0"
                :step="0.1"
                thumb-label
                color="primary"
              >
                <template #append>
                  <span class="text-body-2 font-weight-bold">{{ customSettings.fuzzyMatchingThreshold.toFixed(1) }}</span>
                </template>
              </v-slider>
            </div>
          </v-expand-transition>
        </v-card-text>
      </v-card>
    </div>
  </v-expand-transition>
</template>

<style scoped>
.v-radio :deep(.v-label) {
  opacity: 1;
}

.v-card--variant-outlined {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}
</style>
