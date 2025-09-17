<script setup lang="ts" generic="TMode extends string">
import ModeRadioButton from './ModeRadioButton.vue'
import ModeTooltip from './ModeTooltip.vue'

export interface ModeOption<TMode extends string = string> {
  value: TMode
  icon: string
  label: string
  description: string
  tooltipTitle: string
  tooltipDescription: string
}

interface Props {
  modeOptions: ModeOption<TMode>[]
}

defineProps<Props>()

const modelValue = defineModel<TMode>()
</script>

<template>
  <v-radio-group
    v-model="modelValue"
  >
    <div
      v-for="(option, index) in modeOptions"
      :key="option.value"
      class="d-flex align-center justify-space-between"
      :class="{ 'mb-2': index < modeOptions.length - 1 }"
    >
      <ModeRadioButton
        :value="option.value"
        :icon="option.icon"
        :label="option.label"
        :description="option.description"
      />
      <ModeTooltip
        :title="option.tooltipTitle"
        :description="option.tooltipDescription"
      />
    </div>
  </v-radio-group>
</template>
