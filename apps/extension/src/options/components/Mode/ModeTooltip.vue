<script setup lang="ts">
import { mdiHelpCircleOutline } from '@mdi/js'

interface Props {
  title: string
  description: string
}

defineProps<Props>()
</script>

<template>
  <v-tooltip
    location="left"
    max-width="400"
  >
    <template #activator="{ props: tooltipProps }">
      <v-icon
        v-bind="tooltipProps"
        :icon="mdiHelpCircleOutline"
        class="text-medium-emphasis ml-2"
      />
    </template>
    <div class="pa-2">
      <div class="font-weight-bold mb-2">
        {{ title }}
      </div>
      <div class="mb-2">
        {{ description }}
      </div>
    </div>
  </v-tooltip>
</template>
