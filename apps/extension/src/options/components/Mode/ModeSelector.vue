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

  <!-- Custom Settings with proper expand transition -->
  <v-expand-transition>
    <div v-if="showCustomSettings">
      <v-divider />
      <CustomSettings
        v-model="selectedActions"
        :setting-groups
        :preset-buttons
        :description="customSettingsDescription"
      />
    </div>
  </v-expand-transition>
</template>
