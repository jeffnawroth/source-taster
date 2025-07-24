<script setup lang="ts">
import type { ProcessingRuleDefinition } from '@source-taster/types'
import {
  mdiCogOutline,
  mdiFormTextbox,
  mdiLock,
  mdiScale,
  mdiTarget,
  mdiWrench,
} from '@mdi/js'
import { PROCESSING_RULES, ProcessingMode } from '@source-taster/types'
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

// Setting groups configuration - now based on central rules
const settingGroups = computed(() => {
  // Group rules by category
  const groupedRules = PROCESSING_RULES.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = []
    }
    acc[rule.category].push(rule)
    return acc
  }, {} as Record<string, ProcessingRuleDefinition[]>)

  return Object.entries(groupedRules).map(([category, rules]) => ({
    key: category,
    title: t(`${category}-settings`),
    description: t(`${category}-settings-description`),
    icon: category === 'text-processing' ? mdiFormTextbox : mdiWrench,
    settings: rules.map(rule => ({
      key: rule.id,
      label: t(`setting-${rule.id}`),
      description: t(`setting-${rule.id}-description`),
      example: rule.aiInstruction.example || '',
    })),
  }))
})

// Preset buttons configuration - simplified for new rule system
const presetButtons = computed(() => [
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
])

// Simple function to set processing mode
function setProcessingMode(mode: ProcessingMode) {
  extractionSettings.value.processingStrategy.mode = mode
  // Rules are handled centrally, no need to manage individual settings
}
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
