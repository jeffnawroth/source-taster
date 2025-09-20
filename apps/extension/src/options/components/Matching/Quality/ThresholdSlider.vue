<script setup lang="ts">
interface Props {
  /** Label for the threshold */
  label: string
  /** Minimum slider value */
  min: number
  /** Maximum slider value */
  max: number
  /** Vuetify color for the slider and chip */
  color: string
  /** Description text below the slider */
  description: string
  /** MDI icon to display */
  icon?: string
}

defineProps<Props>()

const modelValue = defineModel<number>({ required: true })
</script>

<template>
  <div class="mb-6">
    <div class="d-flex align-center justify-space-between mb-2">
      <label class="font-weight-medium d-flex align-center">
        <v-icon
          v-if="icon"
          :icon
          :color
          class="me-2"
        />
        {{ label }}
      </label>
      <v-chip
        :color
        variant="flat"
      >
        {{ modelValue }} %
      </v-chip>
    </div>

    <v-slider
      v-model="modelValue"
      :min
      :max
      :step="1"
      :color
      class="ma-0"
    />

    <p class="text-body-2 text-medium-emphasis">
      {{ description }}
    </p>
  </div>
</template>
