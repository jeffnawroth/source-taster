<script setup lang="ts">
import type { ApiMatchMode, ApiMatchNormalizationRule } from '@source-taster/types'
import {
  mdiCheckCircleOutline,
  mdiCloseCircleOutline,
  mdiCogOutline,
  mdiLock,
  mdiScale,
} from '@mdi/js'
import { ApiMatchNormalizationRuleSchema } from '@source-taster/types'
import { settings } from '@/extension/logic'
// Get all available matching action types from the schema
const ALL_NORMALIZATION_RULES: ApiMatchNormalizationRule[] = ApiMatchNormalizationRuleSchema.options

// TRANSLATION
const { t } = useI18n()

watch(() => settings.value.matching.matchingStrategy.mode, (newMode) => {
  if (newMode === 'custom') {
    deselectAll()
  }
  else {
    loadRuleSet(newMode)
  }
})

function loadRuleSet(preset: ApiMatchMode) {
  settings.value.matching.matchingStrategy.normalizationRules = MATCHING_MODE_PRESETS[preset as ApiMatchMode]
}
function selectAll() {
  // Get all available normalization rules
  settings.value.matching.matchingStrategy.normalizationRules = [...ALL_NORMALIZATION_RULES]
}
function deselectAll() {
  settings.value.matching.matchingStrategy.normalizationRules = []
}

const modeOptions = computed(() =>
  Object.entries(MATCHING_MODE_PRESETS).map(([mode]) => {
    const iconMap: Record<ApiMatchMode, string> = {
      strict: mdiLock,
      balanced: mdiScale,
      custom: mdiCogOutline,
    }

    const modeKey = mode.toLowerCase()
    return {
      value: mode,
      icon: iconMap[mode as ApiMatchMode],
      label: t(`matching-mode-${modeKey}`),
      description: t(`matching-mode-${modeKey}-description`),
      tooltipTitle: t(`matching-mode-${modeKey}-tooltip-title`),
      tooltipDescription: t(`matching-mode-${modeKey}-tooltip-description`),
    }
  }),
)

// Simplified settings - direct array instead of groups
const settingsRules = computed(() => {
  return ALL_NORMALIZATION_RULES.map((rule: ApiMatchNormalizationRule) => ({
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
    v-model:mode="settings.matching.matchingStrategy.mode"
    v-model:selected-actions="settings.matching.matchingStrategy.normalizationRules"
    :mode-options
    custom-value="custom"
    :settings="settingsRules"
    :custom-settings-description="t('custom-matching-settings-description')"
    :preset-buttons
  />
</template>
