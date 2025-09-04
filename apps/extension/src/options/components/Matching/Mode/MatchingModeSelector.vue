<script setup lang="ts">
import {
  mdiCheckCircleOutline,
  mdiCloseCircleOutline,
  mdiCogOutline,
  mdiFormTextbox,
  mdiLock,
  mdiPalette,
  mdiScale,
} from '@mdi/js'
import { type MatchingActionType, MatchingRuleCategory, type Mode } from '@source-taster/types'
import { getMatchingActionTypesByCategory } from '@/extension/constants/matchingCategories'
import { MATCHING_MODE_PRESETS } from '@/extension/constants/matchingModePresets'
import { matchingSettings } from '@/extension/logic'

// TRANSLATION
const { t } = useI18n()

watch(() => matchingSettings.value.matchingStrategy.mode, (newMode) => {
  if (newMode === 'custom') {
    deselectAll()
  }
  else {
    matchingSettings.value.matchingStrategy.actionTypes = MATCHING_MODE_PRESETS[newMode]
  }
})

// === Hilfsfunktionen ===
function loadRuleSet(preset: Mode) {
  matchingSettings.value.matchingStrategy.actionTypes = MATCHING_MODE_PRESETS[preset]
}
function selectAll() {
  // Get all available action types from all categories
  matchingSettings.value.matchingStrategy.actionTypes = [
    ...getMatchingActionTypesByCategory(MatchingRuleCategory.CONTENT_EQUIVALENCE),
    ...getMatchingActionTypesByCategory(MatchingRuleCategory.STYLE_INSENSITIVITY),
  ]
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

const categoryConfig = {
  [MatchingRuleCategory.CONTENT_EQUIVALENCE]: {
    title: t('text-extraction-settings'),
    description: t('text-extraction-settings-description'),
    icon: mdiFormTextbox,
  },
  [MatchingRuleCategory.STYLE_INSENSITIVITY]: {
    title: t('content-formatting-settings'),
    description: t('content-formatting-settings-description'),
    icon: mdiPalette,
  },
}

// Setting groups based on rule categories
const settingGroups = computed(() => {
  return Object.entries(categoryConfig).map(([category, config]) => ({
    key: category,
    title: config.title,
    icon: config.icon,
    settings: getMatchingActionTypesByCategory(category as MatchingRuleCategory).map((actionType: MatchingActionType) => ({
      key: actionType,
      label: t(`setting-${actionType}`),
      description: t(`setting-${actionType}-description`),
      example: t(`setting-${actionType}-example`),
    })),
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
    custom-value="'custom'"
    :setting-groups
    :custom-settings-description="t('custom-extraction-settings-description')"
    :preset-buttons
  />
</template>
