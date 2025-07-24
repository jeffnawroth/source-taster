<script setup lang="ts">
import type { ProcessingRuleDefinition } from '@source-taster/types'
import {
  mdiCogOutline,
  mdiFormTextbox,
  mdiLock,
  mdiPalette,
  mdiScale,
  mdiTarget,
  mdiWrench,
} from '@mdi/js'
import {
  getDefaultRulesForMode,
  getRulesForCategory,
  ProcessingMode,
  ProcessingRuleCategory,
} from '@source-taster/types'
import { extractionSettings } from '@/extension/logic'

// TRANSLATION
const { t } = useI18n()

// Mode options configuration
const modeOptions = computed(() => createModeOptions())

// Setting groups based on rule categories
const settingGroups = computed(() => createSettingGroups())

// Preset buttons configuration
const presetButtons = computed(() => createPresetButtons())

/**
 * Create mode options configuration
 */
function createModeOptions() {
  return [
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
    // {
    //   value: ProcessingMode.TOLERANT,
    //   icon: mdiTarget,
    //   label: t('extraction-mode-tolerant'),
    //   description: t('extraction-mode-tolerant-description'),
    //   tooltipTitle: t('extraction-mode-tolerant-tooltip-title'),
    //   tooltipDescription: t('extraction-mode-tolerant-tooltip-description'),
    // },
    {
      value: ProcessingMode.CUSTOM,
      icon: mdiCogOutline,
      label: t('extraction-mode-custom'),
      description: t('extraction-mode-custom-description'),
      tooltipTitle: t('extraction-mode-custom-tooltip-title'),
      tooltipDescription: t('extraction-mode-custom-tooltip-description'),
    },
  ]
}

/**
 * Create setting groups based on processing rule categories
 */
function createSettingGroups() {
  const categoryConfig = getCategoryConfiguration()

  return Object.entries(categoryConfig).map(([category, config]) => ({
    key: category,
    title: t(config.title),
    icon: config.icon,
    settings: transformRulesToSettings(getRulesForCategory(category as ProcessingRuleCategory)),
  }))
}

/**
 * Get category configuration for UI display
 */
function getCategoryConfiguration() {
  return {
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
}

/**
 * Transform rules to UI settings format
 */
function transformRulesToSettings(rules: ProcessingRuleDefinition[]) {
  return rules.map(rule => createSettingFromRule(rule))
}

/**
 * Create a setting object from a processing rule
 */
function createSettingFromRule(rule: ProcessingRuleDefinition) {
  return {
    key: rule.id,
    label: t(`setting-${rule.id}`),
    description: t(`setting-${rule.id}-description`),
    example: t(`setting-${rule.id}-example`),
  }
}

/**
 * Create preset buttons configuration
 */
function createPresetButtons() {
  return [
    {
      label: t('load-strict'),
      icon: mdiLock,
      onClick: () => setProcessingMode(ProcessingMode.STRICT),
    },
    {
      label: t('load-balanced'),
      icon: mdiScale,
      onClick: () => setProcessingMode(ProcessingMode.BALANCED),
    },
    {
      label: t('load-tolerant'),
      icon: mdiTarget,
      onClick: () => setProcessingMode(ProcessingMode.TOLERANT),
    },
    // {
    //   label: t('clear-all'),
    //   icon: mdiDeleteOutline,
    //   onClick: clearAll,
    // },
    // {
    //   label: t('select-all'),
    //   icon: mdiSelectAll,
    //   onClick: selectAll,
    // },
  ]
}

// function clearAll() {
//   const newSettings = ensureCustomModeSettings()

//   // Use template keys to ensure we have all available properties
//   const templateKeys = Object.keys(STRICT_MODIFICATIONS) as Array<keyof ModificationOptions>
//   templateKeys.forEach((key) => {
//     newSettings[key] = false
//   })

//   extractionSettings.value.modificationSettings.options = newSettings
// }

// function selectAll() {
//   const newSettings = ensureCustomModeSettings()

//   // Use template keys to ensure we have all available properties
//   const templateKeys = Object.keys(STRICT_MODIFICATIONS) as Array<keyof ModificationOptions>
//   templateKeys.forEach((key) => {
//     newSettings[key] = true
//   })

//   extractionSettings.value.modificationSettings.options = newSettings
// }

/**
 * Set processing mode and update rules
 * Single responsibility: Update processing strategy
 */
function setProcessingMode(mode: ProcessingMode) {
  const activeRules = getDefaultRulesForMode(mode)

  extractionSettings.value.processingStrategy = {
    mode,
    rules: activeRules,
  }
}

/**
 * Initialize rules when mode changes
 * Single responsibility: Handle mode change events
 */
function handleModeChange(newMode: ProcessingMode) {
  setProcessingMode(newMode)
}

/**
 * Initialize component with correct rules
 * Single responsibility: Component initialization
 */
function initializeComponent() {
  const currentMode = extractionSettings.value.processingStrategy.mode
  setProcessingMode(currentMode)
}

// Watch for mode changes and update rules automatically
watch(
  () => extractionSettings.value.processingStrategy.mode,
  handleModeChange,
  { immediate: true },
)

// Ensure rules are set correctly on component mount
onMounted(initializeComponent)
</script>

<template>
  <ModeSelector
    v-model="extractionSettings.processingStrategy.mode"
    :custom-value="ProcessingMode.CUSTOM"
    :mode-options
    :setting-groups
    :preset-buttons
    :custom-settings-title="t('custom-extraction-settings')"
    :custom-settings-description="t('custom-extraction-settings-description')"
  />
</template>
