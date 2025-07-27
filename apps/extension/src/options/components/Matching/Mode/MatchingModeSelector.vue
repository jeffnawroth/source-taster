<script setup lang="ts">
import type { MatchingActionType, Mode } from '@source-taster/types'
import {
  mdiCogOutline,
  mdiFormTextbox,
  mdiLock,
  mdiPalette,
  mdiScale,
  mdiTarget,
} from '@mdi/js'
import { getMatchingActionTypesByCategory, getMatchingActionTypesFromRules, getMatchingRulesForActionTypes, MATCHING_MODE_PRESETS, MATCHING_RULES, MatchingRuleCategory } from '@source-taster/types'
import { matchingSettings } from '@/extension/logic'

// TRANSLATION
const { t } = useI18n()

const selectedActionTypes = ref<MatchingActionType[]>(getMatchingActionTypesFromRules(matchingSettings.value.matchingStrategy.rules))

watch(() => matchingSettings.value.matchingStrategy.mode, (newMode) => {
  if (newMode === 'custom') {
    deselectAll()
  }
  else {
    selectedActionTypes.value = MATCHING_MODE_PRESETS[newMode]
  }
})

watch(selectedActionTypes, (newActionTypes) => {
  matchingSettings.value.matchingStrategy.rules = getMatchingRulesForActionTypes(newActionTypes)
})

// === Hilfsfunktionen ===
function loadRuleSet(preset: Mode) {
  selectedActionTypes.value = MATCHING_MODE_PRESETS[preset]
}
function selectAll() {
  selectedActionTypes.value = getMatchingActionTypesFromRules(MATCHING_RULES)
}
function deselectAll() {
  selectedActionTypes.value = []
}

const modeOptions = computed(() =>
  Object.entries(MATCHING_MODE_PRESETS).map(([mode]) => {
    const iconMap: Record<Mode, string> = {
      strict: mdiLock,
      balanced: mdiScale,
      tolerant: mdiTarget,
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
    title: t('text-processing-settings'),
    description: t('text-processing-settings-description'),
    icon: mdiFormTextbox,
  },
  [MatchingRuleCategory.STYLE_INSENSITIVITY]: {
    title: t('content-formatting-settings'),
    description: t('content-formatting-settings-description'),
    icon: mdiPalette,
  },
  [MatchingRuleCategory.TOLERANCE]: {
    title: t('technical-processing-settings'),
    description: t('technical-processing-settings-description'),
    icon: mdiWrench,
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
    label: t('load-tolerant'),
    icon: mdiTarget,
    onClick: () => loadRuleSet('tolerant'),
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
    v-model:selected-actions="selectedActionTypes"
    :mode-options
    custom-value="'custom'"
    :setting-groups
    :custom-settings-description="t('custom-extraction-settings-description')"
    :preset-buttons
  />
</template>
