<script setup lang="ts">
import { useAiStore } from '@/extension/stores/ai'
import { mdiStarFourPointsOutline } from '@mdi/js'

const { isAiUsed } = storeToRefs(useAiStore())
</script>

<template>
  <v-tooltip
    v-if="isAiUsed"
  >
    <template #activator="{ props }">
      <v-icon
        v-bind="props"
        :icon="mdiStarFourPointsOutline"
      />
    </template>
    {{ $t('ai-used') }}
  </v-tooltip>
</template>

<style scoped>

</style>
