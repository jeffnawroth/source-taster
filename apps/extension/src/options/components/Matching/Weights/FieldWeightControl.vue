<script setup lang="ts">
interface Props {
  label: string
  description: string
  defaultValue?: number
}

const props = withDefaults(defineProps<Props>(), {
  defaultValue: 5,
})

const value = defineModel<number>({ default: 0 })

const isEnabled = computed(() => (value.value || 0) > 0)

function toggleField(enabled: boolean | null) {
  value.value = enabled ? props.defaultValue : 0
}
</script>

<template>
  <div class="mb-4">
    <div class="d-flex justify-space-between align-center mb-2">
      <div class="d-flex align-center">
        <v-switch
          :model-value="isEnabled"
          density="compact"
          color="primary"
          hide-details
          class="mr-3"
          @update:model-value="toggleField"
        />
        <label class="font-weight-medium">{{ label }}</label>
      </div>
      <v-chip
        size="small"
        :color="isEnabled ? 'primary' : 'default'"
      >
        {{ value || 0 }}%
      </v-chip>
    </div>
    <v-slider
      v-model="value"
      :disabled="!isEnabled"
      :min="0"
      :max="100"
      :step="1"
      color="primary"
      show-ticks="always"
      thumb-label
    />
    <p class="text-caption text-medium-emphasis">
      {{ description }}
    </p>
  </div>
</template>
