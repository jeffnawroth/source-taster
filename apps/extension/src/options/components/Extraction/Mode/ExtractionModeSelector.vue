<script setup lang="ts">
import type { ExtractionActionType, Mode } from '@source-taster/types'
import { mdiCheckCircleOutline, mdiCloseCircleOutline, mdiCogOutline, mdiFormTextbox, mdiLock, mdiPalette, mdiScale, mdiTarget, mdiWrench } from '@mdi/js'
import { EXTRACTION_MODE_PRESETS, ExtractionRuleCategory } from '@source-taster/types'
import { getExtractionActionTypesByCategory } from '@/extension/constants/extractionCategories'
import { extractionSettings } from '@/extension/logic'

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
  // Get all available action types from all categories
  extractionSettings.value.extractionStrategy.actionTypes = [
    ...getExtractionActionTypesByCategory(ExtractionRuleCategory.CONTENT_NORMALIZATION),
    ...getExtractionActionTypesByCategory(ExtractionRuleCategory.STYLE_FORMATTING),
    ...getExtractionActionTypesByCategory(ExtractionRuleCategory.TECHNICAL_EXTRACTION),
  ]
}
function deselectAll() {
  extractionSettings.value.extractionStrategy.actionTypes = []
}

const modeOptions = computed(() =>
  Object.entries(EXTRACTION_MODE_PRESETS).map(([mode]) => {
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
  [ExtractionRuleCategory.TECHNICAL_EXTRACTION]: {
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
      description: t(`setting-${actionType}-short-description`), // GEÄNDERT: Kurze Beschreibung
      detailedDescription: t(`setting-${actionType}-description`), // NEU: Detaillierte Beschreibung
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
    v-model:selected-actions="extractionSettings.extractionStrategy.actionTypes"
    :mode-options
    custom-value="custom"
    :setting-groups
    :custom-settings-description="t('custom-extraction-settings-description')"
    :preset-buttons
  />
</template>
