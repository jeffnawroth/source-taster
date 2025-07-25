<script setup lang="ts" generic="TMode extends string, TActions">
import type { SettingGroup } from './CustomSettings.vue'
import type { PresetButton } from './CustomSettingsActions.vue'
import type { ModeOption } from './ModeSelection.vue'
import CustomSettings from './CustomSettings.vue'
import ModeSelection from './ModeSelection.vue'

interface Props {
  customValue: TMode
  modeOptions: ModeOption[]
  settingGroups: SettingGroup[]
  presetButtons: PresetButton[]
  customSettingsDescription: string
}

const props = defineProps<Props>()

const mode = defineModel<TMode>('mode', { required: true })
const selectedActions = defineModel<TActions>('selectedActions', { required: true })

// Check if custom mode is selected
const showCustomSettings = computed(() => mode.value === props.customValue)
</script>

<template>
  <!-- Mode Selection Component -->
  <ModeSelection
    v-model="mode"
    :mode-options
  />
  <!-- Custom Settings (shown when Custom mode is selected) -->
  <v-expand-transition>
    <CustomSettings
      v-if="showCustomSettings"
      v-model="selectedActions"
      :setting-groups
      :preset-buttons
      :description="customSettingsDescription"
    />
  </v-expand-transition>
</template>
