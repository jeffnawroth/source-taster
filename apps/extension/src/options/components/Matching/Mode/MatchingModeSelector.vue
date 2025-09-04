<script setup lang="ts">
import type { MatchingActionType, Mode } from '@source-taster/types'
import {
  mdiCheckCircleOutline,
  mdiCloseCircleOutline,
  mdiCogOutline,
  mdiLock,
  mdiScale,
} from '@mdi/js'

import { MatchingActionTypeSchema } from '@source-taster/types'
import { MATCHING_MODE_PRESETS } from '@/extension/constants/matchingModePresets'
import { matchingSettings } from '@/extension/logic'

// Get all available matching action types from the schema
const ALL_MATCHING_ACTION_TYPES: MatchingActionType[] = MatchingActionTypeSchema.options

// TRANSLATION
const { t } = useI18n()

watch(() => matchingSettings.value.matchingStrategy.mode, (newMode) => {
  if (newMode === 'custom') {
    deselectAll()
  }
  else {
    loadRuleSet(newMode)
  }
})

function loadRuleSet(preset: Mode) {
  matchingSettings.value.matchingStrategy.actionTypes = MATCHING_MODE_PRESETS[preset]
}
function selectAll() {
  // Get all available action types
  matchingSettings.value.matchingStrategy.actionTypes = [...ALL_MATCHING_ACTION_TYPES]
}
function deselectAll() {
  matchingSettings.value.matchingStrategy.actionTypes = []
}

const modeOptions = computed(() =>
  Object.entries(MATCHING_MODE_PRESETS).map(([mode]) => {
    const iconMap: Record<Mode, string> = {
      strict: mdiLock,
      balanced: mdiScale,
      custom: mdiCogOutline,
    }

    const modeKey = mode.toLowerCase()
    return {
      value: mode,
      icon: iconMap[mode as Mode],
      label: t(`matching-mode-${modeKey}`),
      description: t(`matching-mode-${modeKey}-description`),
      tooltipTitle: t(`matching-mode-${modeKey}-tooltip-title`),
      tooltipDescription: t(`matching-mode-${modeKey}-tooltip-description`),
    }
  }),
)

// Simplified settings - direct array instead of groups
const settings = computed(() => {
  return ALL_MATCHING_ACTION_TYPES.map((actionType: MatchingActionType) => ({
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
    v-model:mode="matchingSettings.matchingStrategy.mode"
    v-model:selected-actions="matchingSettings.matchingStrategy.actionTypes"
    :mode-options
    custom-value="custom"
    :settings
    :custom-settings-description="t('custom-matching-settings-description')"
    :preset-buttons
  />
</template>
