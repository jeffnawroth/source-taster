<script setup lang="ts">
import type { ExtractionActionType, Mode } from '@source-taster/types'
import { mdiCheckCircleOutline, mdiCloseCircleOutline, mdiCogOutline, mdiLock, mdiScale } from '@mdi/js'

import { ExtractionActionTypeSchema } from '@source-taster/types'
import { EXTRACTION_MODE_PRESETS } from '@/extension/constants/extractionModePresets'
import { extractionSettings } from '@/extension/logic'

// Get all available extraction action types from the schema
const ALL_EXTRACTION_ACTION_TYPES: ExtractionActionType[] = ExtractionActionTypeSchema.options

// TRANSLATION
const { t } = useI18n()

watch(() => extractionSettings.value.extractionStrategy.mode, (newMode) => {
  if (newMode === 'custom') {
    deselectAll()
  }
  else {
    loadRuleSet(newMode)
  }
})

function loadRuleSet(preset: Mode) {
  extractionSettings.value.extractionStrategy.actionTypes = EXTRACTION_MODE_PRESETS[preset]
}
function selectAll() {
  // Get all available action types
  extractionSettings.value.extractionStrategy.actionTypes = [...ALL_EXTRACTION_ACTION_TYPES]
}
function deselectAll() {
  extractionSettings.value.extractionStrategy.actionTypes = []
}

const modeOptions = computed(() =>
  Object.entries(EXTRACTION_MODE_PRESETS)
    .map(([mode]) => {
      const iconMap: Record<string, string> = {
        strict: mdiLock,
        balanced: mdiScale,
        custom: mdiCogOutline,
      }

      const modeKey = mode.toLowerCase()
      return {
        value: mode,
        icon: iconMap[mode as Mode],
        label: t(`extraction-mode-${modeKey}`),
        description: t(`extraction-mode-${modeKey}-description`),
        tooltipTitle: t(`extraction-mode-${modeKey}-tooltip-title`),
        tooltipDescription: t(`extraction-mode-${modeKey}-tooltip-description`),
      }
    }),
)

// Simplified settings - direct array instead of groups
const settings = computed(() => {
  return ALL_EXTRACTION_ACTION_TYPES.map((actionType: ExtractionActionType) => ({
    key: actionType,
    label: t(`setting-${actionType}`),
    description: t(`setting-${actionType}-short-description`),
    detailedDescription: t(`setting-${actionType}-description`),
    example: t(`setting-${actionType}-example`),
  }))
})

const presetButtons = computed(() => [
  {
    label: t('load-strict'),
    icon: mdiLock,
    onClick: () => loadRuleSet('strict'),
  },
  {
    label: t('load-balanced'),
    icon: mdiScale,
    onClick: () => loadRuleSet('balanced'),
  },
  {
    label: t('select-all'),
    icon: mdiCheckCircleOutline,
    onClick: selectAll,
  },
  {
    label: t('deselect-all'),
    icon: mdiCloseCircleOutline,
    onClick: deselectAll,
  },
])
</script>

<template>
  <ModeSelector
    v-model:mode="extractionSettings.extractionStrategy.mode"
    v-model:selected-actions="extractionSettings.extractionStrategy.actionTypes"
    :mode-options
    custom-value="custom"
    :settings
    :custom-settings-description="t('custom-extraction-settings-description')"
    :preset-buttons
  />
</template>
