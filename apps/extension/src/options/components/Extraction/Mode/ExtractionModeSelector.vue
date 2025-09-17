<script setup lang="ts">
import { mdiCheckCircleOutline, mdiCloseCircleOutline, mdiCogOutline, mdiLock, mdiScale } from '@mdi/js'
import { type Mode, type NormalizationRule, NormalizationRuleSchema } from '@source-taster/types'

import { EXTRACTION_MODE_PRESETS } from '@/extension/constants/extractionModePresets'
import { extractionSettings } from '@/extension/logic'

// Get all available normalization rules from the schema
const ALL_NORMALIZATION_RULES: NormalizationRule[] = NormalizationRuleSchema.options

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
  extractionSettings.value.extractionStrategy.normalizationRules = EXTRACTION_MODE_PRESETS[preset]
}
function selectAll() {
  // Get all available normalization rules
  extractionSettings.value.extractionStrategy.normalizationRules = [...ALL_NORMALIZATION_RULES]
}
function deselectAll() {
  extractionSettings.value.extractionStrategy.normalizationRules = []
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
  return ALL_NORMALIZATION_RULES.map((rule: NormalizationRule) => ({
    key: rule,
    label: t(`setting-${rule}`),
    description: t(`setting-${rule}-short-description`),
    detailedDescription: t(`setting-${rule}-description`),
    example: t(`setting-${rule}-example`),
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
    v-model:selected-actions="extractionSettings.extractionStrategy.normalizationRules"
    :mode-options
    custom-value="custom"
    :settings
    :custom-settings-description="t('custom-extraction-settings-description')"
    :preset-buttons
  />
</template>
