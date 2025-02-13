<script setup lang="ts">
import { mdiStarFourPointsOutline } from '@mdi/js'
import { useAiStore } from '~/stores/ai'

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
