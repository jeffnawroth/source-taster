<script setup lang="ts">
import type { ExtractionActionType, Mode } from '@source-taster/types'
import { mdiCheckCircleOutline, mdiCloseCircleOutline, mdiCogOutline, mdiFormTextbox, mdiLock, mdiPalette, mdiScale, mdiTarget, mdiWrench } from '@mdi/js'
import { ExtractionRuleCategory, getExtractionActionTypesByCategory, getExtractionActionTypesFromRules, getExtractionRulesForActionTypes, PROCESSING_MODE_PRESETS, PROCESSING_RULES } from '@source-taster/types'
import { ref, watch } from 'vue'
import { extractionSettings } from '@/extension/logic'

const selectedActionTypes = ref<ExtractionActionType[]>(getExtractionActionTypesFromRules(extractionSettings.value.extractionStrategy.rules))

watch(() => extractionSettings.value.extractionStrategy.mode, (newMode) => {
  if (newMode === 'custom') {
    deselectAll()
  }
  else {
    selectedActionTypes.value = PROCESSING_MODE_PRESETS[newMode]
  }
})

watch(selectedActionTypes, (newActionTypes) => {
  extractionSettings.value.extractionStrategy.rules = getExtractionRulesForActionTypes(newActionTypes)
})

// === Hilfsfunktionen ===
function loadRuleSet(preset: Mode) {
  selectedActionTypes.value = PROCESSING_MODE_PRESETS[preset]
}
function selectAll() {
  selectedActionTypes.value = getExtractionActionTypesFromRules(PROCESSING_RULES)
}
function deselectAll() {
  selectedActionTypes.value = []
}

const { t } = useI18n()

const modeOptions = computed(() =>
  Object.entries(PROCESSING_MODE_PRESETS).map(([mode]) => {
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
      label: t(`extraction-mode-${modeKey}`),
      description: t(`extraction-mode-${modeKey}-description`),
      tooltipTitle: t(`extraction-mode-${modeKey}-tooltip-title`),
      tooltipDescription: t(`extraction-mode-${modeKey}-tooltip-description`),
    }
  }),
)

const categoryConfig = {
  [ExtractionRuleCategory.CONTENT_NORMALIZATION]: {
    title: t('text-extraction-settings'),
    description: t('text-extraction-settings-description'),
    icon: mdiFormTextbox,
  },
  [ExtractionRuleCategory.STYLE_FORMATTING]: {
    title: t('content-formatting-settings'),
    description: t('content-formatting-settings-description'),
    icon: mdiPalette,
  },
  [ExtractionRuleCategory.TECHNICAL_PROCESSING]: {
    title: t('technical-extraction-settings'),
    description: t('technical-extraction-settings-description'),
    icon: mdiWrench,
  },
}

// Setting groups based on rule categories
const settingGroups = computed(() => {
  return Object.entries(categoryConfig).map(([category, config]) => ({
    key: category,
    title: config.title,
    icon: config.icon,
    settings: getExtractionActionTypesByCategory(category as ExtractionRuleCategory).map((actionType: ExtractionActionType) => ({
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
    v-model:mode="extractionSettings.extractionStrategy.mode"
    v-model:selected-actions="selectedActionTypes"
    :mode-options
    custom-value="custom"
    :setting-groups
    :custom-settings-description="t('custom-extraction-settings-description')"
    :preset-buttons
  />
</template>
