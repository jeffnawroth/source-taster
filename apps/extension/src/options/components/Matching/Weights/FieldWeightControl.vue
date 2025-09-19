<script setup lang="ts">
import type { ApiMatchFieldConfig } from '@source-taster/types'

interface Props {
  label: string
  defaultValue?: number
  fieldKey?: string
  canDisable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultValue: 5,
  fieldKey: '',
  canDisable: true,
})

const emit = defineEmits<{
  toggleField: [fieldKey: string, enabled: boolean]
}>()

const fieldConfig = defineModel<ApiMatchFieldConfig>({
  default: () => ({ enabled: false, weight: 0 }),
})

function toggleField(enabled: boolean | null) {
  if (props.fieldKey) {
    emit('toggleField', props.fieldKey, !!enabled)
  }
  else {
    // Fallback to old behavior if no fieldKey provided
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
      <v-tooltip
        v-if="fieldConfig?.enabled && !props.canDisable"
        location="top"
      >
        <template #activator="{ props: tooltipProps }">
          <v-switch
            v-bind="tooltipProps"
            :model-value="fieldConfig?.enabled || false"
            density="compact"
            color="primary"
            class="mr-3 ml-3"
            :disabled="fieldConfig?.enabled && !props.canDisable"
            @update:model-value="toggleField"
          />
        </template>
        <span>{{ $t('matching-fields-last-field-tooltip') }}</span>
      </v-tooltip>

      <v-switch
        v-else
        :model-value="fieldConfig?.enabled || false"
        density="compact"
        color="primary"
        class="mr-3 ml-3"
        inset
        :disabled="fieldConfig?.enabled && !props.canDisable"
        @update:model-value="toggleField"
      />
      <label class="font-weight-medium">{{ label }}</label>
    </div>
    <v-chip
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
