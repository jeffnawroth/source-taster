<script setup lang="ts">
// PROPS & MODEL
defineProps<{
  field: string
}>()

const modelValue = defineModel<boolean>()

// TRANSLATION
const { t } = useI18n()
</script>

<template>
  <v-tooltip
    location="top"
  >
    <template #activator="{ props }">
      <v-checkbox
        v-model="modelValue"
        :label="t(`field-${field}`)"
        v-bind="props"
        density="compact"
        hide-details
      />
    </template>

    {{ t(`tooltip-${field}`) }}
  </v-tooltip>
</template>
