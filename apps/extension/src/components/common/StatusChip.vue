<script setup lang="ts">
type Variant = 'flat' | 'text' | 'tonal' | 'elevated' | 'outlined' | 'plain' | undefined

const props = withDefaults(defineProps<{
  text: string | number
  tooltip?: string
  color?: string
  prependIcon?: string
  loading?: boolean
  label?: boolean
  variant?: Variant
}>(), {
  label: true,
  variant: 'tonal',
})
</script>

<template>
  <!-- With tooltip -->
  <v-tooltip
    v-if="props.tooltip"
    :text="props.tooltip"
  >
    <template
      #activator="{ props: tooltipProps }"
    >
      <v-chip
        v-bind="{ ...tooltipProps, ...$attrs }"
        :label="props.label"
        :variant="props.variant"
        :color="props.color"
      >
        <v-progress-circular
          v-if="props.loading"
          indeterminate
          size="16"
          width="2"
          class="mr-2"
        />
        <v-icon
          v-else-if="props.prependIcon"
          :icon="props.prependIcon"
          size="medium"
          start
        />
        {{ props.text }}
      </v-chip>
    </template>
  </v-tooltip>

  <!-- Without tooltip -->
  <v-chip
    v-else
    :label="props.label"
    :variant="props.variant"
    :color="props.color"
    v-bind="$attrs"
  >
    <v-progress-circular
      v-if="props.loading"
      indeterminate
      size="16"
      width="2"
      class="mr-2"
    />
    <v-icon
      v-else-if="props.prependIcon"
      :icon="props.prependIcon"
      size="medium"

      start
    />
    {{ props.text }}
  </v-chip>
</template>

<style scoped>
.v-chip {
  transition: all 0.2s ease-in-out;
  font-weight: 500;
}

.v-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
