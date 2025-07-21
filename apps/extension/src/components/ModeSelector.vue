<script setup lang="ts" generic="TMode extends string, TSettings extends Record<string, any>">
import CustomSettings from './CustomSettings.vue'
import ModeSelection from './ModeSelection.vue'

interface ModeOption {
  value: TMode
  icon: string
  label: string
  description: string
  tooltipTitle: string
  tooltipDescription: string
}

interface SettingGroup {
  key: string
  title: string
  description: string
  icon: string
  settings: Array<{
    key: keyof TSettings
    label: string
    description: string
    example: string
    type?: 'checkbox' | 'slider'
    min?: number
    max?: number
    step?: number
    suffix?: string
    dependsOn?: keyof TSettings
  }>
}

interface PresetButton {
  label: string
  icon: string
  onClick: () => void
}

interface Props {
  customValue: TMode
  modeOptions: ModeOption[]
  settingGroups: SettingGroup[]
  presetButtons: PresetButton[]
  customSettingsTitle: string
  customSettingsDescription: string
}

const props = defineProps<Props>()

const modelValue = defineModel<TMode>()
const customSettings = defineModel<TSettings>('customSettings')

// Check if custom mode is selected
const showCustomSettings = computed(() => modelValue.value === props.customValue)
</script>

<template>
  <!-- Mode Selection Component -->
  <ModeSelection
    v-model="modelValue"
    :mode-options
  />

  <!-- Custom Settings (shown when Custom mode is selected) -->
  <v-expand-transition>
    <CustomSettings
      v-if="showCustomSettings"
      v-model="customSettings"
      :setting-groups
      :preset-buttons
      :title="customSettingsTitle"
      :description="customSettingsDescription"
    />
  </v-expand-transition>
</template>

<style scoped>
.v-radio :deep(.v-label) {
  opacity: 1;
}

.v-card--variant-outlined {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}
</style>
