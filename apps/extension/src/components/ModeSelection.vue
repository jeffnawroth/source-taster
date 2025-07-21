<script setup lang="ts" generic="TMode extends string">
import { mdiHelpCircleOutline } from '@mdi/js'

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
    class="mb-0"
  >
    <div
      v-for="(option, index) in modeOptions"
      :key="option.value"
      class="d-flex align-center justify-space-between"
      :class="{ 'mb-2': index < modeOptions.length - 1 }"
    >
      <v-radio
        :value="option.value"
        class="flex-grow-1"
      >
        <template #label>
          <div>
            <div class="font-weight-medium d-flex align-center">
              <v-icon
                :icon="option.icon"
                size="small"
                class="me-2"
              />
              {{ option.label }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ option.description }}
            </div>
          </div>
        </template>
      </v-radio>
      <v-tooltip
        location="left"
        max-width="400"
      >
        <template #activator="{ props: tooltipProps }">
          <v-icon
            v-bind="tooltipProps"
            :icon="mdiHelpCircleOutline"
            size="small"
            class="text-medium-emphasis ml-2"
          />
        </template>
        <div class="pa-2">
          <div class="font-weight-bold mb-2">
            {{ option.tooltipTitle }}
          </div>
          <div class="mb-2">
            {{ option.tooltipDescription }}
          </div>
        </div>
      </v-tooltip>
    </div>
  </v-radio-group>
</template>

<style scoped>
.v-radio :deep(.v-label) {
  opacity: 1;
}
</style>
