<script setup lang="ts">
import type { MatchingToleranceOptions } from '@source-taster/types'
import {
  mdiCogOutline,
  mdiDeleteOutline,
  mdiFormTextbox,
  mdiLock,
  mdiPalette,
  mdiScale,
  mdiSelectAll,
  mdiTarget,
} from '@mdi/js'
import {
  BALANCED_MATCHING_TOLERANCE_OPTIONS,
  MatchingToleranceMode,
  STRICT_MATCHING_TOLERANCE_OPTIONS,
  TOLERANT_MATCHING_TOLERANCE_OPTIONS,
} from '@source-taster/types'
import { matchingSettings } from '@/extension/logic'

// TRANSLATION
const { t } = useI18n()

// Mode options configuration
const modeOptions = computed(() => [
  {
    value: MatchingToleranceMode.STRICT,
    icon: mdiLock,
    label: t('matching-mode-strict'),
    description: t('matching-mode-strict-description'),
    tooltipTitle: t('matching-mode-strict-tooltip-title'),
    tooltipDescription: t('matching-mode-strict-tooltip-description'),
  },
  {
    value: MatchingToleranceMode.BALANCED,
    icon: mdiScale,
    label: t('matching-mode-balanced'),
    description: t('matching-mode-balanced-description'),
    tooltipTitle: t('matching-mode-balanced-tooltip-title'),
    tooltipDescription: t('matching-mode-balanced-tooltip-description'),
  },
  {
    value: MatchingToleranceMode.TOLERANT,
    icon: mdiTarget,
    label: t('matching-mode-tolerant'),
    description: t('matching-mode-tolerant-description'),
    tooltipTitle: t('matching-mode-tolerant-tooltip-title'),
    tooltipDescription: t('matching-mode-tolerant-tooltip-description'),
  },
  {
    value: MatchingToleranceMode.CUSTOM,
    icon: mdiCogOutline,
    label: t('matching-mode-custom'),
    description: t('matching-mode-custom-description'),
    tooltipTitle: t('matching-mode-custom-tooltip-title'),
    tooltipDescription: t('matching-mode-custom-tooltip-description'),
  },
])

// Setting groups configuration
const settingGroups = computed(() => [
  {
    key: 'text-matching',
    title: t('text-matching-options'),
    description: t('text-matching-options-description'),
    icon: mdiFormTextbox,
    settings: [
      {
        key: 'ignoreCaseForText' as keyof MatchingToleranceOptions,
        label: t('ignore-case'),
        description: t('ignore-case-description'),
        example: t('ignore-case-example'),
      },
      {
        key: 'ignorePunctuation' as keyof MatchingToleranceOptions,
        label: t('ignore-punctuation'),
        description: t('ignore-punctuation-description'),
        example: t('ignore-punctuation-example'),
      },
      {
        key: 'ignoreWhitespace' as keyof MatchingToleranceOptions,
        label: t('ignore-whitespace'),
        description: t('ignore-whitespace-description'),
        example: t('ignore-whitespace-example'),
      },
      {
        key: 'normalizeCharacters' as keyof MatchingToleranceOptions,
        label: t('normalize-characters'),
        description: t('normalize-characters-description'),
        example: t('normalize-characters-example'),
      },
    ],
  },
  {
    key: 'format-variations',
    title: t('format-variations'),
    description: t('format-variations-description'),
    icon: mdiPalette,
    settings: [
      {
        key: 'allowAuthorFormatVariations' as keyof MatchingToleranceOptions,
        label: t('allow-author-format-variations'),
        description: t('allow-author-format-variations-description'),
        example: t('allow-author-format-variations-example'),
      },
      {
        key: 'allowJournalAbbreviations' as keyof MatchingToleranceOptions,
        label: t('allow-journal-abbreviations'),
        description: t('allow-journal-abbreviations-description'),
        example: t('allow-journal-abbreviations-example'),
      },
      {
        key: 'allowPageFormatVariations' as keyof MatchingToleranceOptions,
        label: t('allow-page-format-variations'),
        description: t('allow-page-format-variations-description'),
        example: t('allow-page-format-variations-example'),
      },
      {
        key: 'allowDateFormatVariations' as keyof MatchingToleranceOptions,
        label: t('allow-date-format-variations'),
        description: t('allow-date-format-variations-description'),
        example: t('allow-date-format-variations-example'),
      },
    ],
  },
])

// Preset buttons configuration
const presetButtons = computed(() => [
  {
    label: t('load-strict'),
    icon: mdiLock,
    onClick: loadStrictPreset,
  },
  {
    label: t('load-balanced'),
    icon: mdiScale,
    onClick: loadBalancedPreset,
  },
  {
    label: t('load-tolerant'),
    icon: mdiTarget,
    onClick: loadTolerantPreset,
  },
  {
    label: t('clear-all'),
    icon: mdiDeleteOutline,
    onClick: clearAll,
  },
  {
    label: t('select-all'),
    icon: mdiSelectAll,
    onClick: selectAll,
  },
])

// Base function to ensure custom mode and tolerance options initialization
function ensureCustomModeSettings(): MatchingToleranceOptions {
  if (!matchingSettings.value.toleranceSettings) {
    matchingSettings.value.toleranceSettings = {
      mode: MatchingToleranceMode.CUSTOM,
      options: {} as MatchingToleranceOptions,
    }
  }
  else {
    matchingSettings.value.toleranceSettings.mode = MatchingToleranceMode.CUSTOM
  }

  if (!matchingSettings.value.toleranceSettings.options) {
    matchingSettings.value.toleranceSettings.options = {} as MatchingToleranceOptions
  }

  return { ...matchingSettings.value.toleranceSettings.options }
}

// Base function to apply preset settings
function applyPreset(presetConfig: Partial<MatchingToleranceOptions>) {
  const newSettings = ensureCustomModeSettings()
  Object.assign(newSettings, presetConfig)
  matchingSettings.value.toleranceSettings!.options = newSettings
}

// Preset functions using predefined configurations
function loadStrictPreset() {
  applyPreset(STRICT_MATCHING_TOLERANCE_OPTIONS)
}

function loadBalancedPreset() {
  applyPreset(BALANCED_MATCHING_TOLERANCE_OPTIONS)
}

function loadTolerantPreset() {
  applyPreset(TOLERANT_MATCHING_TOLERANCE_OPTIONS)
}

function clearAll() {
  const newSettings = ensureCustomModeSettings()

  // Use template keys to ensure we have all available properties
  const templateKeys = Object.keys(STRICT_MATCHING_TOLERANCE_OPTIONS) as Array<keyof MatchingToleranceOptions>
  templateKeys.forEach((key) => {
    newSettings[key] = false as any
  })

  matchingSettings.value.toleranceSettings!.options = newSettings
}

function selectAll() {
  const newSettings = ensureCustomModeSettings()

  // Use template keys to ensure we have all available properties
  const templateKeys = Object.keys(STRICT_MATCHING_TOLERANCE_OPTIONS) as Array<keyof MatchingToleranceOptions>
  templateKeys.forEach((key) => {
    newSettings[key] = true as any
  })

  matchingSettings.value.toleranceSettings!.options = newSettings
}
</script>

<template>
  <ModeSelector
    v-model="matchingSettings.toleranceSettings.mode"
    v-model:custom-settings="matchingSettings.toleranceSettings.options"
    :custom-value="MatchingToleranceMode.CUSTOM"
    :mode-options
    :setting-groups
    :preset-buttons
    :custom-settings-title="t('custom-matching-settings')"
    :custom-settings-description="t('custom-matching-settings-description')"
  />
</template>
