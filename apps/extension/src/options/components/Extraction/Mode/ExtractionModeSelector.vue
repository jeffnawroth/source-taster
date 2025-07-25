<script setup lang="ts">
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
  getActionTypesFromRules,
  getRulesForActionTypes,
  MODE_PRESETS,
  PROCESSING_RULES,
  ProcessingActionType,
  ProcessingMode,
  ProcessingRuleCategory,
} from '@source-taster/types'
import { extractionSettings } from '@/extension/logic'

// TRANSLATION
const { t } = useI18n()

// Mode options configuration
const modeOptions = computed(() => [
  {
    value: ProcessingMode.STRICT,
    icon: mdiLock,
    label: t('extraction-mode-strict'),
    description: t('extraction-mode-strict-description'),
    tooltipTitle: t('extraction-mode-strict-tooltip-title'),
    tooltipDescription: t('extraction-mode-strict-tooltip-description'),
  },
  {
    value: ProcessingMode.BALANCED,
    icon: mdiScale,
    label: t('extraction-mode-balanced'),
    description: t('extraction-mode-balanced-description'),
    tooltipTitle: t('extraction-mode-balanced-tooltip-title'),
    tooltipDescription: t('extraction-mode-balanced-tooltip-description'),
  },
  {
    value: ProcessingMode.TOLERANT,
    icon: mdiTarget,
    label: t('extraction-mode-tolerant'),
    description: t('extraction-mode-tolerant-description'),
    tooltipTitle: t('extraction-mode-tolerant-tooltip-title'),
    tooltipDescription: t('extraction-mode-tolerant-tooltip-description'),
  },
  {
    value: ProcessingMode.CUSTOM,
    icon: mdiCogOutline,
    label: t('extraction-mode-custom'),
    description: t('extraction-mode-custom-description'),
    tooltipTitle: t('extraction-mode-custom-tooltip-title'),
    tooltipDescription: t('extraction-mode-custom-tooltip-description'),
  },
])

// Helper function to get action types by category
function getActionTypesByCategory(category: ProcessingRuleCategory): ProcessingActionType[] {
  const categoryMapping = {
    [ProcessingRuleCategory.TEXT_PROCESSING]: [
      ProcessingActionType.TYPO_CORRECTION,
      ProcessingActionType.NORMALIZE_TITLE_CASE,
      ProcessingActionType.EXPAND_ABBREVIATIONS,
      ProcessingActionType.STANDARDIZE_PUNCTUATION,
    ],
    [ProcessingRuleCategory.CONTENT_FORMATTING]: [
      ProcessingActionType.FORMAT_AUTHOR_NAMES,
      ProcessingActionType.STANDARDIZE_DATE_FORMAT,
      ProcessingActionType.STANDARDIZE_IDENTIFIERS,
    ],
    [ProcessingRuleCategory.TECHNICAL_PROCESSING]: [
      ProcessingActionType.FIX_ENCODING_ISSUES,
      ProcessingActionType.REPAIR_LINE_BREAKS,
      ProcessingActionType.REMOVE_ARTIFACTS,
    ],
  }

  return categoryMapping[category] || []
}

// Setting groups based on rule categories
const settingGroups = computed(() => {
  const categoryConfig = {
    [ProcessingRuleCategory.TEXT_PROCESSING]: {
      title: t('text-processing-settings'),
      description: t('text-processing-settings-description'),
      icon: mdiFormTextbox,
    },
    [ProcessingRuleCategory.CONTENT_FORMATTING]: {
      title: t('content-formatting-settings'),
      description: t('content-formatting-settings-description'),
      icon: mdiPalette,
    },
    [ProcessingRuleCategory.TECHNICAL_PROCESSING]: {
      title: t('technical-processing-settings'),
      description: t('technical-processing-settings-description'),
      icon: mdiWrench,
    },
  }

  return Object.entries(categoryConfig).map(([category, config]) => ({
    key: category,
    title: config.title,
    description: config.description,
    icon: config.icon,
    settings: getActionTypesByCategory(category as ProcessingRuleCategory).map((actionType: ProcessingActionType) => ({
      key: actionType,
      label: t(`rule-${actionType}`),
      description: t(`rule-${actionType}-description`),
      example: t(`rule-${actionType}-example`),
    })),
  }))
})

// Preset buttons configuration
const presetButtons = computed(() => [
  {
    label: t('load-strict'),
    icon: mdiLock,
    onClick: () => loadRuleSet(ProcessingMode.STRICT),
  },
  {
    label: t('load-balanced'),
    icon: mdiScale,
    onClick: () => loadRuleSet(ProcessingMode.BALANCED),
  },
  {
    label: t('load-tolerant'),
    icon: mdiTarget,
    onClick: () => loadRuleSet(ProcessingMode.TOLERANT),
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

// Custom settings that map actionTypes to boolean values
const customSettings = computed({
  get: () => {
    const activeActionTypes = getActionTypesFromRules(extractionSettings.value.processingStrategy.rules)
    const allActionTypes = getActionTypesFromRules(PROCESSING_RULES)

    const settings: Record<string, boolean> = {}
    allActionTypes.forEach((actionType) => {
      settings[actionType] = activeActionTypes.includes(actionType)
    })
    return settings
  },
  set: (value: Record<string, boolean>) => {
    const activeActionTypes = Object.entries(value)
      .filter(([_, isActive]) => isActive)
      .map(([actionType]) => actionType as ProcessingActionType)

    extractionSettings.value.processingStrategy.rules = getRulesForActionTypes(activeActionTypes)
  },
})

// Helper functions
function loadRuleSet(preset: ProcessingMode) {
  const actionTypes = MODE_PRESETS[preset]
  extractionSettings.value.processingStrategy.rules = getRulesForActionTypes(actionTypes)
}

function selectAll() {
  const allActionTypes = getActionTypesFromRules(PROCESSING_RULES)
  extractionSettings.value.processingStrategy.rules = getRulesForActionTypes(allActionTypes)
}

function clearAll() {
  extractionSettings.value.processingStrategy.rules = []
}

// Watch for mode changes and update rules automatically
watch(
  () => extractionSettings.value.processingStrategy.mode,
  (newMode) => {
    if (newMode !== ProcessingMode.CUSTOM) {
      const actionTypes = MODE_PRESETS[newMode]
      extractionSettings.value.processingStrategy.rules = getRulesForActionTypes(actionTypes)
    }
  },
  { immediate: true },
)
</script>

<template>
  <ModeSelector
    v-model="extractionSettings.processingStrategy.mode"
    v-model:custom-settings="customSettings"
    :custom-value="ProcessingMode.CUSTOM"
    :mode-options
    :setting-groups
    :preset-buttons
    :custom-settings-title="t('custom-extraction-settings')"
    :custom-settings-description="t('custom-extraction-settings-description')"
  />
</template>
