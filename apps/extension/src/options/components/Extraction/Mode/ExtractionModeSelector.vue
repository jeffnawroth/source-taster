<script setup lang="ts">
import type { ProcessingActionType } from '@source-taster/types'
import { mdiCheckCircleOutline, mdiCloseCircleOutline, mdiCogOutline, mdiFormTextbox, mdiLock, mdiPalette, mdiScale, mdiTarget, mdiWrench } from '@mdi/js'
import { getActionTypesByCategory, getActionTypesFromRules, getRulesForActionTypes, MODE_PRESETS, PROCESSING_RULES, ProcessingMode, ProcessingRuleCategory } from '@source-taster/types'
import { ref, watch } from 'vue'
import { extractionSettings } from '@/extension/logic'

const selectedActionTypes = ref(getActionTypesFromRules(extractionSettings.value.processingStrategy.rules))

watch(() => extractionSettings.value.processingStrategy.mode, (newMode) => {
  if (newMode === 'custom') {
    deselectAll()
  }
  else {
    selectedActionTypes.value = MODE_PRESETS[newMode]
  }
})

watch(selectedActionTypes, (newActionTypes) => {
  extractionSettings.value.processingStrategy.rules = getRulesForActionTypes(newActionTypes)
})

// === Hilfsfunktionen ===
function loadRuleSet(preset: ProcessingMode) {
  selectedActionTypes.value = MODE_PRESETS[preset]
}
function selectAll() {
  selectedActionTypes.value = getActionTypesFromRules(PROCESSING_RULES)
}
function deselectAll() {
  selectedActionTypes.value = []
}

const { t } = useI18n()

const modeOptions = computed(() =>
  Object.entries(MODE_PRESETS).map(([mode]) => {
    const iconMap = {
      [ProcessingMode.STRICT]: mdiLock,
      [ProcessingMode.BALANCED]: mdiScale,
      [ProcessingMode.TOLERANT]: mdiTarget,
      [ProcessingMode.CUSTOM]: mdiCogOutline,
    }

    const modeKey = mode.toLowerCase()
    return {
      value: mode,
      icon: iconMap[mode as ProcessingMode],
      label: t(`extraction-mode-${modeKey}`),
      description: t(`extraction-mode-${modeKey}-description`),
      tooltipTitle: t(`extraction-mode-${modeKey}-tooltip-title`),
      tooltipDescription: t(`extraction-mode-${modeKey}-tooltip-description`),
    }
  }),
)

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

// Setting groups based on rule categories
const settingGroups = computed(() => {
  return Object.entries(categoryConfig).map(([category, config]) => ({
    key: category,
    title: config.title,
    icon: config.icon,
    settings: getActionTypesByCategory(category as ProcessingRuleCategory).map((actionType: ProcessingActionType) => ({
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
    v-model:mode="extractionSettings.processingStrategy.mode"
    v-model:selected-actions="selectedActionTypes"
    :mode-options
    :custom-value="ProcessingMode.CUSTOM"
    :setting-groups
    :custom-settings-description="t('custom-extraction-settings-description')"
    :preset-buttons
  />
</template>
