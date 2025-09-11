<script setup lang="ts">
import type { ApiMatchFieldConfig } from '@source-taster/types'

interface Props {
  label: string
  defaultValue?: number
}

const props = withDefaults(defineProps<Props>(), {
  defaultValue: 5,
})

const fieldConfig = defineModel<ApiMatchFieldConfig>({
  default: () => ({ enabled: false, weight: 0 }),
})

function toggleField(enabled: boolean | null) {
  if (enabled) {
    fieldConfig.value = {
      enabled: true,
      weight: fieldConfig.value?.weight || props.defaultValue,
    }
  }
  else {
    fieldConfig.value = {
      enabled: false,
      weight: fieldConfig.value?.weight || 0,
    }
  }
}

function updateWeight(newWeight: number) {
  fieldConfig.value = {
    enabled: fieldConfig.value?.enabled || false,
    weight: newWeight,
  }
}
</script>

<template>
  <div class="d-flex justify-space-between align-center mb-2">
    <div class="d-flex align-center">
      <v-switch
        :model-value="fieldConfig?.enabled || false"
        density="compact"
        color="primary"
        hide-details
        class="mr-3 ml-3"
        @update:model-value="toggleField"
      />
      <label class="font-weight-medium">{{ label }}</label>
    </div>
    <v-chip
      size="small"
      :color="fieldConfig?.enabled ? 'primary' : 'default'"
      class="mr-2"
    >
      {{ fieldConfig?.weight || 0 }}%
    </v-chip>
  </div>
  <v-slider
    :model-value="fieldConfig?.weight || 0"
    :disabled="!fieldConfig?.enabled"
    :min="0"
    :max="100"
    :step="1"
    color="primary"
    show-ticks="always"
    thumb-label
    class="ml-4"
    @update:model-value="updateWeight"
  />
</template>
