<script setup lang="ts">
import type { ProcessingActionType, ProcessingRuleDefinition } from '@source-taster/types'
import {
  mdiCogOutline,
  mdiDeleteOutline,
  mdiLock,
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
  ProcessingMode,
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

// Setting groups - simplified to show all rules in one group
const settingGroups = computed(() => [
  {
    key: 'processing-rules',
    title: t('processing-rules'),
    description: t('processing-rules-description'),
    icon: mdiWrench,
    settings: PROCESSING_RULES.map((rule: ProcessingRuleDefinition) => ({
      key: rule.actionType,
      label: t(`rule-${rule.actionType}`),
      description: t(`rule-${rule.actionType}-description`),
      example: t(`rule-${rule.actionType}-example`),
    })),
  },
])

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
