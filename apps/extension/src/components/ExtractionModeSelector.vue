<script setup lang="ts">
import type { CustomExtractionSettings } from '@source-taster/types'
import {
  mdiCogOutline,
  mdiDeleteOutline,
  mdiFormTextbox,
  mdiLock,
  mdiPalette,
  mdiScale,
  mdiSelectAll,
  mdiTarget,
  mdiWrench,
} from '@mdi/js'
import {
  BALANCED_EXTRACTION_SETTINGS,
  ExtractionMode,
  STRICT_EXTRACTION_SETTINGS,
  TOLERANT_EXTRACTION_SETTINGS,
} from '@source-taster/types'
import { extractionSettings } from '@/extension/logic'
import ModeSelector from './ModeSelector.vue'

// TRANSLATION
const { t } = useI18n()

// Safe access to custom settings with initialization
const customSettings = computed({
  get: () => {
    if (!extractionSettings.value.customSettings) {
      extractionSettings.value.customSettings = {} as CustomExtractionSettings
    }
    return extractionSettings.value.customSettings
  },
  set: (value) => {
    extractionSettings.value.customSettings = value
  },
})

// Mode options configuration
const modeOptions = computed(() => [
  {
    value: ExtractionMode.STRICT,
    icon: mdiLock,
    label: t('extraction-mode-strict'),
    description: t('extraction-mode-strict-description'),
    tooltipTitle: t('extraction-mode-strict-tooltip-title'),
    tooltipDescription: t('extraction-mode-strict-tooltip-description'),
  },
  {
    value: ExtractionMode.BALANCED,
    icon: mdiScale,
    label: t('extraction-mode-balanced'),
    description: t('extraction-mode-balanced-description'),
    tooltipTitle: t('extraction-mode-balanced-tooltip-title'),
    tooltipDescription: t('extraction-mode-balanced-tooltip-description'),
  },
  {
    value: ExtractionMode.TOLERANT,
    icon: mdiTarget,
    label: t('extraction-mode-tolerant'),
    description: t('extraction-mode-tolerant-description'),
    tooltipTitle: t('extraction-mode-tolerant-tooltip-title'),
    tooltipDescription: t('extraction-mode-tolerant-tooltip-description'),
  },
  {
    value: ExtractionMode.CUSTOM,
    icon: mdiCogOutline,
    label: t('extraction-mode-custom'),
    description: t('extraction-mode-custom-description'),
    tooltipTitle: t('extraction-mode-custom-tooltip-title'),
    tooltipDescription: t('extraction-mode-custom-tooltip-description'),
  },
])

// Setting groups configuration
const settingGroups = computed(() => [
  {
    key: 'text-processing',
    title: t('text-processing-settings'),
    description: t('text-processing-settings-description'),
    icon: mdiFormTextbox,
    settings: [
      {
        key: 'correctTypos' as keyof CustomExtractionSettings,
        label: t('setting-typo-correction'),
        description: t('setting-typo-correction-description'),
        example: t('setting-typo-correction-example'),
      },
      {
        key: 'normalizeCapitalization' as keyof CustomExtractionSettings,
        label: t('setting-normalize-capitalization'),
        description: t('setting-normalize-capitalization-description'),
        example: t('setting-normalize-capitalization-example'),
      },
      {
        key: 'standardizeAbbreviations' as keyof CustomExtractionSettings,
        label: t('setting-standardize-abbreviations'),
        description: t('setting-standardize-abbreviations-description'),
        example: t('setting-standardize-abbreviations-example'),
      },
      {
        key: 'standardizePunctuation' as keyof CustomExtractionSettings,
        label: t('setting-standardize-punctuation'),
        description: t('setting-standardize-punctuation-description'),
        example: t('setting-standardize-punctuation-example'),
      },
    ],
  },
  {
    key: 'content-formatting',
    title: t('content-formatting-settings'),
    description: t('content-formatting-settings-description'),
    icon: mdiPalette,
    settings: [
      {
        key: 'formatAuthorNames' as keyof CustomExtractionSettings,
        label: t('setting-format-author-names'),
        description: t('setting-format-author-names-description'),
        example: t('setting-format-author-names-example'),
      },
      {
        key: 'removeDuplicateAuthors' as keyof CustomExtractionSettings,
        label: t('setting-remove-duplicate-authors'),
        description: t('setting-remove-duplicate-authors-description'),
        example: t('setting-remove-duplicate-authors-example'),
      },
      {
        key: 'standardizeDateFormatting' as keyof CustomExtractionSettings,
        label: t('setting-standardize-date-formatting'),
        description: t('setting-standardize-date-formatting-description'),
        example: t('setting-standardize-date-formatting-example'),
      },
      {
        key: 'standardizeIdentifiers' as keyof CustomExtractionSettings,
        label: t('setting-standardize-identifiers'),
        description: t('setting-standardize-identifiers-description'),
        example: t('setting-standardize-identifiers-example'),
      },
      {
        key: 'convertToTitleCase' as keyof CustomExtractionSettings,
        label: t('setting-convert-to-title-case'),
        description: t('setting-convert-to-title-case-description'),
        example: t('setting-convert-to-title-case-example'),
      },
    ],
  },
  {
    key: 'technical-processing',
    title: t('technical-processing-settings'),
    description: t('technical-processing-settings-description'),
    icon: mdiWrench,
    settings: [
      {
        key: 'fixUnicodeIssues' as keyof CustomExtractionSettings,
        label: t('setting-fix-unicode-issues'),
        description: t('setting-fix-unicode-issues-description'),
        example: t('setting-fix-unicode-issues-example'),
      },
      {
        key: 'handleOcrErrors' as keyof CustomExtractionSettings,
        label: t('setting-handle-ocr-errors'),
        description: t('setting-handle-ocr-errors-description'),
        example: t('setting-handle-ocr-errors-example'),
      },
      {
        key: 'reconstructSeparatedInfo' as keyof CustomExtractionSettings,
        label: t('setting-reconstruct-separated-info'),
        description: t('setting-reconstruct-separated-info-description'),
        example: t('setting-reconstruct-separated-info-example'),
      },
      {
        key: 'completeIncompleteData' as keyof CustomExtractionSettings,
        label: t('setting-complete-incomplete-data'),
        description: t('setting-complete-incomplete-data-description'),
        example: t('setting-complete-incomplete-data-example'),
      },
      {
        key: 'fixFormattingProblems' as keyof CustomExtractionSettings,
        label: t('setting-fix-formatting-problems'),
        description: t('setting-fix-formatting-problems-description'),
        example: t('setting-fix-formatting-problems-example'),
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

// Base function to ensure custom mode and settings initialization
function ensureCustomModeSettings(): CustomExtractionSettings {
  extractionSettings.value.extractionMode = ExtractionMode.CUSTOM

  if (!extractionSettings.value.customSettings) {
    extractionSettings.value.customSettings = {} as CustomExtractionSettings
  }

  return { ...extractionSettings.value.customSettings }
}

// Base function to apply preset settings
function applyPreset(presetConfig: Partial<CustomExtractionSettings>) {
  const newSettings = ensureCustomModeSettings()
  Object.assign(newSettings, presetConfig)
  extractionSettings.value.customSettings = newSettings
}

// Preset functions using predefined constants
function loadStrictPreset() {
  applyPreset(STRICT_EXTRACTION_SETTINGS)
}

function loadBalancedPreset() {
  applyPreset(BALANCED_EXTRACTION_SETTINGS)
}

function loadTolerantPreset() {
  applyPreset(TOLERANT_EXTRACTION_SETTINGS)
}

function clearAll() {
  const newSettings = ensureCustomModeSettings()

  // Use template keys to ensure we have all available properties
  const templateKeys = Object.keys(STRICT_EXTRACTION_SETTINGS) as Array<keyof CustomExtractionSettings>
  templateKeys.forEach((key) => {
    newSettings[key] = false
  })

  extractionSettings.value.customSettings = newSettings
}

function selectAll() {
  const newSettings = ensureCustomModeSettings()

  // Use template keys to ensure we have all available properties
  const templateKeys = Object.keys(STRICT_EXTRACTION_SETTINGS) as Array<keyof CustomExtractionSettings>
  templateKeys.forEach((key) => {
    newSettings[key] = true
  })

  extractionSettings.value.customSettings = newSettings
}
</script>

<template>
  <ModeSelector
    v-model="extractionSettings.extractionMode"
    v-model:custom-settings="customSettings"
    :custom-value="ExtractionMode.CUSTOM"
    :mode-options
    :setting-groups
    :preset-buttons
    :custom-settings-title="t('custom-extraction-settings')"
    :custom-settings-description="t('custom-extraction-settings-description')"
  />
</template>
